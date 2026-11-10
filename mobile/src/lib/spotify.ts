import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";
const TOKEN_STORAGE_KEY = "pragya.spotify.tokens.v1";
const VERIFIER_STORAGE_KEY = "pragya.spotify.pkce-verifier.v1";
const redirectUri = process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI?.trim() || "pragya://auth/spotify/callback";
const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID?.trim();
const scopes = ["user-read-private", "playlist-modify-private"];
let callbackInFlight: Promise<SpotifyConnection> | null = null;
const completedCallbackCodes = new Set<string>();

type SpotifyTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
};

export type SpotifyConnection = { displayName: string; imageUrl?: string };
export type SpotifyPlaylist = { id: string; name: string; externalUrl?: string; imageUrl?: string };

function toBase64Url(value: string): string {
  return value.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function requireClientId(): string {
  if (!clientId) throw new Error("Spotify isn’t configured yet. Add the Spotify client ID, then reload Pragya.");
  return clientId;
}

async function newVerifier(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(48);
  // RFC 7636 permits only unreserved ASCII characters. Raw bytes can contain
  // invalid characters and make Spotify reject the verifier before exchange.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function challengeFor(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  return toBase64Url(digest);
}

function encodeForm(values: Record<string, string>): string {
  return Object.entries(values).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}

async function saveTokens(response: { access_token: string; expires_in: number; refresh_token?: string }, previous?: SpotifyTokens | null) {
  const tokens: SpotifyTokens = {
    access_token: response.access_token,
    refresh_token: response.refresh_token || previous?.refresh_token,
    expires_at: Date.now() + response.expires_in * 1000,
  };
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  return tokens;
}

async function savedTokens(): Promise<SpotifyTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SpotifyTokens; } catch { await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY); return null; }
}

async function token(): Promise<string> {
  const current = await savedTokens();
  if (!current) throw new Error("Connect Spotify before creating a playlist.");
  if (current.expires_at > Date.now() + 60_000) return current.access_token;
  if (!current.refresh_token) throw new Error("Your Spotify connection expired. Please reconnect.");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeForm({ client_id: requireClientId(), grant_type: "refresh_token", refresh_token: current.refresh_token }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) {
    await disconnectSpotify();
    throw new Error("Your Spotify connection expired. Please reconnect.");
  }
  return (await saveTokens(payload, current)).access_token;
}

async function spotifyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof payload?.error?.message === "string" ? payload.error.message
        : typeof payload?.error === "string" ? payload.error
          : typeof payload?.error_description === "string" ? payload.error_description
            : "";
    if (response.status === 403) {
      throw new Error(`Spotify denied this request (403)${detail ? `: ${detail}` : ""}. In Development Mode, the signed-in account must have Spotify Premium and access to this app.`);
    }
    throw new Error(`Spotify request failed (${response.status})${detail ? `: ${detail}` : ""}.`);
  }
  return payload as T;
}

async function exchangeAuthorizationCode(code: string): Promise<SpotifyConnection> {
  const verifier = await SecureStore.getItemAsync(VERIFIER_STORAGE_KEY);
  if (!verifier) throw new Error("Spotify sign-in expired. Please connect again.");
  const response = await fetch(TOKEN_URL, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeForm({ client_id: requireClientId(), grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: verifier }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) throw new Error(payload?.error_description || "Spotify authorization failed.");
  await saveTokens(payload);
  await SecureStore.deleteItemAsync(VERIFIER_STORAGE_KEY);
  const connection = await getSpotifyConnection();
  if (!connection) throw new Error("Spotify connected, but your profile could not be loaded. Please try again.");
  return connection;
}

export async function completeSpotifyCallback(url: string): Promise<SpotifyConnection> {
  const query = Linking.parse(url).queryParams ?? {};
  const code = typeof query.code === "string" ? query.code : undefined;
  if (code && completedCallbackCodes.has(code)) {
    const connection = await getSpotifyConnection();
    if (connection) return connection;
  }
  if (callbackInFlight) return callbackInFlight;
  callbackInFlight = (async () => {
    if (typeof query.error === "string") throw new Error(`Spotify: ${query.error.replace(/_/g, " ")}.`);
    if (!code) throw new Error("Spotify didn’t return an authorization code.");
    const connection = await exchangeAuthorizationCode(code);
    completedCallbackCodes.add(code);
    return connection;
  })().finally(() => { callbackInFlight = null; });
  return callbackInFlight;
}

export async function connectSpotify(): Promise<SpotifyConnection> {
  const verifier = await newVerifier();
  await SecureStore.setItemAsync(VERIFIER_STORAGE_KEY, verifier);
  const authorizationUrl = `${AUTHORIZE_URL}?${encodeForm({
    client_id: requireClientId(), response_type: "code", redirect_uri: redirectUri,
    code_challenge_method: "S256", code_challenge: await challengeFor(verifier), scope: scopes.join(" "), show_dialog: "true",
  })}`;
  const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, redirectUri);
  if (result.type === "success" && result.url) return completeSpotifyCallback(result.url);

  // Android hands the deep link to Expo Router before WebBrowser resolves its
  // promise. The Playlists route completes the exchange; wait for its secure
  // token write instead of incorrectly reporting a cancelled connection.
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const connection = await getSpotifyConnection();
    if (connection) return connection;
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Spotify connection was cancelled or timed out.");
}

export async function getSpotifyConnection(): Promise<SpotifyConnection | null> {
  if (!(await savedTokens())) return null;
  try {
    const profile = await spotifyFetch<{ display_name?: string; images?: { url: string }[] }>("/me");
    return { displayName: profile.display_name || "Spotify listener", imageUrl: profile.images?.[0]?.url };
  } catch {
    // A saved OAuth token is enough to create a playlist with /me/playlists.
    // Do not turn a non-essential profile display request into a failed
    // connection (some Spotify development accounts restrict /me details).
    return { displayName: "Spotify listener" };
  }
}

export async function disconnectSpotify() { await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY); }

export async function createSpotifyPlaylist(mood: string, title: string, description: string, queries: readonly string[]): Promise<SpotifyPlaylist> {
  const tracks: string[] = [];
  for (const query of queries) {
    let search: { tracks?: { items?: { uri?: string }[] } };
    try {
      search = await spotifyFetch<{ tracks?: { items?: { uri?: string }[] } }>(`/search?${encodeForm({ q: query, type: "track", limit: "1" })}`);
    } catch (error) {
      throw new Error(`Could not find Spotify tracks. ${error instanceof Error ? error.message : "Please try again."}`);
    }
    const uri = search.tracks?.items?.[0]?.uri;
    if (uri && !tracks.includes(uri)) tracks.push(uri);
  }
  if (!tracks.length) throw new Error("Spotify couldn’t find tracks for this mood. Try another one.");
  let playlist: { id: string; name: string; external_urls?: { spotify?: string }; images?: { url: string }[] };
  try {
    playlist = await spotifyFetch<typeof playlist>("/me/playlists", {
      method: "POST", body: JSON.stringify({ name: title, description, public: false }),
    });
  } catch (error) {
    throw new Error(`Could not create the private playlist. ${error instanceof Error ? error.message : "Please try again."}`);
  }
  try {
    await spotifyFetch(`/playlists/${playlist.id}/items`, { method: "POST", body: JSON.stringify({ uris: tracks }) });
  } catch (error) {
    throw new Error(`Playlist was created, but tracks could not be added. ${error instanceof Error ? error.message : "Please try again."}`);
  }
  return { id: playlist.id, name: playlist.name, externalUrl: playlist.external_urls?.spotify, imageUrl: playlist.images?.[0]?.url };
}
