import { NativeModules, Platform } from "react-native";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { supabase } from "./supabase";

function developmentNativeApiUrl() {
  const bundleUrl = NativeModules.SourceCode?.scriptURL ?? "";
  const metroHost = bundleUrl.match(/^https?:\/\/([^/:]+)/i)?.[1];
  return metroHost ? `http://${metroHost}:8000` : "http://10.0.2.2:8000";
}

const defaultApiUrl =
  Platform.OS === "web"
    ? "http://127.0.0.1:8000"
    : Platform.OS === "android"
      ? (__DEV__ ? developmentNativeApiUrl() : "http://10.0.2.2:8000")
      : "http://127.0.0.1:8000";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const isLocalWeb =
  __DEV__ &&
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const configuredUrlIsLocal =
  !configuredApiUrl || /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/.*)?$/i.test(configuredApiUrl);
const apiUrl =
  isLocalWeb && configuredUrlIsLocal
    ? "http://127.0.0.1:8001"
    : configuredApiUrl || defaultApiUrl;
let activeApiUrl = apiUrl;

function apiBaseCandidates(): string[] {
  const androidTunnelUrl = __DEV__ && Platform.OS === "android" ? "http://127.0.0.1:8000" : undefined;
  return [...new Set([activeApiUrl, apiUrl, androidTunnelUrl, defaultApiUrl].filter((value): value is string => Boolean(value)))];
}

type SessionStart = { session_id: string; status: "active"; processing_status: "provider_pending" };
type SessionEnd = {
  session_id: string;
  status: "ended";
  recap_status: "generated" | "empty" | "unavailable";
  message: string;
  recap: SessionRecap | null;
};

export type SessionRecap = {
  summary: string;
  themes: string[];
  cbt_reflection: { situation: string; thought: string; balanced_perspective: string };
  next_step: string;
};

export type ProgressReport = {
  period_days: number;
  activity_timestamps: string[];
  session_count: number;
  average_helpfulness: number | null;
  recurring_themes: string[];
  recent_sessions: {
    session_id: string;
    ended_at: string;
    summary: string;
    themes: string[];
    helpfulness_rating: number | null;
  }[];
};

export type DailyPrompt = { date: string; prompt: string };
export type VoiceTurn = { session_id: string; transcript: string; response: string; model: string; audio_id: string };

export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Sign in again to continue.");
  const expiresSoon = Boolean(
    data.session.expires_at && data.session.expires_at * 1000 <= Date.now() + 60_000,
  );
  if (!expiresSoon) return data.session.access_token;

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session?.access_token) {
    throw new Error("Your sign-in expired. Please sign in again.");
  }
  return refreshed.session.access_token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  let lastNetworkError: unknown;
  for (const baseUrl of apiBaseCandidates()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), __DEV__ && Platform.OS === "android" ? 4_000 : 12_000);
    try {
      const response = await fetch(baseUrl + path, {
        ...init,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
      });
      activeApiUrl = baseUrl;
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const detail = body?.detail;
        const responseError = new Error(typeof detail === "string" ? detail : "Pragya API is unavailable.") as Error & { apiResponse?: boolean };
        responseError.apiResponse = true;
        throw responseError;
      }
      return (await response.json()) as T;
    } catch (error) {
      if ((error as { apiResponse?: boolean } | null)?.apiResponse) throw error;
      if (error instanceof Error && error.message !== "Pragya API is unavailable." && !error.message.includes("fetch") && !error.message.includes("Network") && !error.message.includes("cancel")) {
        throw error;
      }
      lastNetworkError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastNetworkError instanceof Error
    ? new Error("Could not reach the local Pragya API. Keep the server running and retry.")
    : new Error("Pragya API is unavailable.");
}

export function createSession(): Promise<SessionStart> {
  return request<SessionStart>("/api/sessions", { method: "POST" });
}

export function finishSession(sessionId: string, helpfulnessRating: number): Promise<SessionEnd> {
  return request<SessionEnd>(`/api/sessions/${encodeURIComponent(sessionId)}/end`, {
    method: "POST",
    body: JSON.stringify({ helpfulness_rating: helpfulnessRating }),
  });
}

export function rateSessionRecap(sessionId: string, helpfulnessRating: number): Promise<void> {
  return request<void>(`/api/sessions/${encodeURIComponent(sessionId)}/feedback`, {
    method: "POST",
    body: JSON.stringify({ helpfulness_rating: helpfulnessRating }),
  });
}

export function getDailyPrompt(): Promise<DailyPrompt> {
  return request<DailyPrompt>("/api/prompts/daily");
}

export function getProgressReport(days = 30): Promise<ProgressReport> {
  return request<ProgressReport>(`/api/progress?days=${days}`);
}

async function convertBrowserAudioToWav(blob: Blob): Promise<Blob> {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    throw new Error("This browser cannot prepare audio for transcription. Try the Pragya app in Chrome or Edge.");
  }
  const audioContext = new window.AudioContext();
  try {
    const decoded = await audioContext.decodeAudioData(await blob.arrayBuffer());
    const targetRate = 16000;
    const outputLength = Math.ceil((decoded.length * targetRate) / decoded.sampleRate);
    const samples = new Float32Array(outputLength);
    const channels = Array.from({ length: decoded.numberOfChannels }, (_, channel) => decoded.getChannelData(channel));

    for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
      const sourcePosition = (outputIndex * decoded.sampleRate) / targetRate;
      const leftIndex = Math.floor(sourcePosition);
      const fraction = sourcePosition - leftIndex;
      let mixedSample = 0;
      for (const channel of channels) {
        const left = channel[Math.min(leftIndex, channel.length - 1)] ?? 0;
        const right = channel[Math.min(leftIndex + 1, channel.length - 1)] ?? left;
        mixedSample += left + (right - left) * fraction;
      }
      samples[outputIndex] = mixedSample / channels.length;
    }

    const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(wavBuffer);
    const writeAscii = (offset: number, value: string) => {
      for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
    };
    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(36, "data");
    view.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}
export async function sendVoiceTurn(
  sessionId: string,
  uri: string,
  filename: string,
): Promise<VoiceTurn> {
  const token = await getAccessToken();
  const form = new FormData();
  if (Platform.OS === "web") {
    const audioResponse = await fetch(uri);
    const recordedBlob = await audioResponse.blob();
    const wavBlob = await convertBrowserAudioToWav(recordedBlob);
    form.append("audio_file", wavBlob, "pragya-turn.wav");
  } else {
    // Expo's current multipart implementation accepts Blob-compatible File objects,
    // not React Native's older { uri, name, type } upload object.
    form.append("audio_file", new File(uri), filename);
  }
  const response = await expoFetch(`${activeApiUrl}/api/sessions/${encodeURIComponent(sessionId)}/voice-turns`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : "Could not process this voice turn.");
  }
  return (await response.json()) as VoiceTurn;
}

export function getTurnAudioUrl(sessionId: string, audioId: string): string {
  return `${activeApiUrl}/api/sessions/${encodeURIComponent(sessionId)}/audio/${encodeURIComponent(audioId)}`;
}

export function deleteMyData(): Promise<{ deleted_recaps: number; message: string }> {
  return request<{ deleted_recaps: number; message: string }>("/api/account/data", { method: "DELETE" });
}


