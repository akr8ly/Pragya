import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  createSession,
  finishSession,
  getTurnAudioUrl,
  getAccessToken,
  sendVoiceTurn,
  SessionRecap,
} from "../lib/api";

type Turn = { transcript: string; response: string; audioId: string };
const MAX_SPOKEN_TURNS = 3;

export default function SessionScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recordingState = useAudioRecorderState(recorder);
  const [player] = useState(() => createAudioPlayer(null));
  const playerStatus = useAudioPlayerStatus(player);
  const turnInFlight = useRef(false);
  const playbackObjectUrl = useRef<string | null>(null);
  const [notice, setNotice] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [recap, setRecap] = useState<SessionRecap | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    player.remove();
    if (playbackObjectUrl.current) URL.revokeObjectURL(playbackObjectUrl.current);
  }, [player]);

  async function loadReplyAudio(activeSessionId: string, audioId: string, accessToken?: string) {
    const token = accessToken ?? await getAccessToken();
    const audioUrl = getTurnAudioUrl(activeSessionId, audioId);
    if (Platform.OS === "web") {
      const response = await fetch(audioUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Audio download failed.");
      const audioBlob = await response.blob();
      if (!audioBlob.size) throw new Error("The spoken reply was empty.");
      const objectUrl = URL.createObjectURL(audioBlob);
      if (playbackObjectUrl.current) URL.revokeObjectURL(playbackObjectUrl.current);
      playbackObjectUrl.current = objectUrl;
      player.replace({ uri: objectUrl });
    } else {
      player.replace({ uri: audioUrl, headers: { Authorization: `Bearer ${token}` } });
    }
    setAudioReady(true);
  }

  async function beginTurn() {
    if (feedbackOpen || turns.length >= MAX_SPOKEN_TURNS) return;
    setBusy(true);
    setNotice("");
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setPermissionDenied(true);
        setNotice("Microphone access is needed to begin a voice conversation.");
        return;
      }
      setPermissionDenied(false);
      player.pause();
      const activeSessionId = sessionId ?? (await createSession()).session_id;
      if (!sessionId) {
        if (playbackObjectUrl.current) {
          URL.revokeObjectURL(playbackObjectUrl.current);
          playbackObjectUrl.current = null;
        }
        setTurns([]);
        setCurrentAudioId(null);
        setAudioReady(false);
        setRecap(null);
        setFeedbackOpen(false);
        setSelectedRating(null);
        setSubmittedRating(null);
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setSessionId(activeSessionId);
    } catch {
      setNotice("Could not start the session. Check that the local Pragya API is running and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finishTurn() {
    if (turnInFlight.current) return;
    turnInFlight.current = true;
    setBusy(true);
    setNotice("Sending this turn for transcription and a spoken reply…");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!sessionId || !uri) throw new Error("No voice recording was available. Please try again.");
      const extension = uri.split("?")[0].split(".").pop()?.toLowerCase();
      const filename = `pragya-turn.${extension || "m4a"}`;
      const result = await sendVoiceTurn(sessionId, uri, filename);
      const completedTurnCount = turns.length + 1;
      setTurns((current) => [...current, { transcript: result.transcript, response: result.response, audioId: result.audio_id }]);
      setCurrentAudioId(result.audio_id);
      setAudioReady(false);
      setAudioLoading(true);
      let audioLoadFailed = false;
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        await loadReplyAudio(sessionId, result.audio_id);
        player.play();
      } catch {
        audioLoadFailed = true;
      } finally {
        setAudioLoading(false);
      }
      if (completedTurnCount >= MAX_SPOKEN_TURNS) {
        setFeedbackOpen(true);
        setNotice("You’ve completed 3 spoken turns. Share your feedback to generate the daily report and end the session.");
      } else {
        setNotice(`Pragya replied. You can speak ${MAX_SPOKEN_TURNS - completedTurnCount} more ${MAX_SPOKEN_TURNS - completedTurnCount === 1 ? "time" : "times"}.`);
      }
      if (audioLoadFailed) setNotice("Your text reply is ready, but its audio could not load. Tap Retry audio to try again.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not process this voice turn. Please try again.");
    } finally {
      turnInFlight.current = false;
      setBusy(false);
    }
  }

  async function toggleLatestReply(audioId: string) {
    if (audioId !== currentAudioId || !sessionId) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }
    if (!audioReady) {
      setAudioLoading(true);
      try {
        await loadReplyAudio(sessionId, audioId);
        setNotice("Audio is loaded. Tap Play reply once more to start playback.");
      } catch {
        setNotice("Audio still could not load. Check the connection to the Pragya API and retry.");
      } finally {
        setAudioLoading(false);
      }
      return;
    }
    player.play();
    setNotice("Playing Pragya’s reply. If you still can’t hear it, check the browser tab and device volume.");
  }

  async function submitFeedback() {
    if (!sessionId || selectedRating === null || busy) return;
    setBusy(true);
    try {
      const result = await finishSession(sessionId, selectedRating);
      setSessionId(null);
      setRecap(result.recap);
      setSubmittedRating(selectedRating);
      setFeedbackOpen(false);
      player.pause();
      setCurrentAudioId(null);
      setAudioReady(false);
      if (playbackObjectUrl.current) {
        URL.revokeObjectURL(playbackObjectUrl.current);
        playbackObjectUrl.current = null;
      }
      setNotice("Session ended. " + result.message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The report could not be generated or saved. Please try submitting again.");
    } finally {
      setBusy(false);
    }
  }

  const seconds = Math.floor((recordingState.durationMillis ?? 0) / 1000);
  const clock = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  const recording = recordingState.isRecording;

  return (
    <ScrollView style={s.page} contentContainerStyle={s.body}>
      <Link href="/" style={s.back}>←  Home</Link>
      <Text style={s.title}>Live session</Text>
      <Text style={s.sub}>Speak naturally, one turn at a time. Pragya will listen and reply aloud.</Text>

      <View style={[s.micCard, recording && s.micActive]}>
        <Text style={s.micIcon}>{recording ? "●" : "◉"}</Text>
        <Text style={s.micText}>{recording ? "Listening" : busy ? "Processing your turn" : feedbackOpen ? "Feedback before your daily report" : sessionId ? `Your turn · ${turns.length} of ${MAX_SPOKEN_TURNS} used` : "Ready when you are"}</Text>
        <Text style={s.timer}>{recording ? clock : " "}</Text>
        {!feedbackOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={recording ? "Finish speaking" : sessionId ? "Start speaking" : "Start voice session"}
            disabled={busy || (!recording && turns.length >= MAX_SPOKEN_TURNS)}
            onPress={recording ? finishTurn : beginTurn}
            style={recording ? s.stopButton : s.primary}
          >
            <Text style={recording ? s.stopText : s.primaryText}>
              {busy ? "Please wait…" : recording ? "Finish this turn" : sessionId ? "Speak to Pragya" : "Start voice session"}
            </Text>
          </Pressable>
        ) : null}
        {permissionDenied ? <Text style={s.permission}>You can enable microphone access in your device settings.</Text> : null}
      </View>

      {notice ? (
        <Text accessibilityLiveRegion="polite" style={s.notice}>
          {playerStatus.error
            ? "Pragya’s text reply is ready, but audio could not start. Tap Play reply or check your browser and device volume."
            : notice}
        </Text>
      ) : null}

      {feedbackOpen && sessionId ? (
        <View style={s.feedbackCard}>
          <Text style={s.label}>SESSION FEEDBACK</Text>
          <Text style={s.head}>How helpful was this reflection?</Text>
          <Text style={s.copy}>Your feedback is saved with today’s report. Submitting it ends this session.</Text>
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Pressable
                key={rating}
                accessibilityRole="button"
                accessibilityLabel={`Rate helpfulness ${rating} out of 5`}
                accessibilityState={{ selected: selectedRating === rating }}
                disabled={busy}
                onPress={() => setSelectedRating(rating)}
                style={[s.ratingButton, selectedRating === rating && s.ratingSelected]}
              >
                <Text style={[s.ratingText, selectedRating === rating && s.ratingTextSelected]}>{rating}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={busy || selectedRating === null}
            onPress={submitFeedback}
            style={[s.primary, (busy || selectedRating === null) && s.disabledButton]}
          >
            <Text style={s.primaryText}>{busy ? "Generating daily report…" : "Submit feedback & finish"}</Text>
          </Pressable>
        </View>
      ) : null}

      {turns.length ? (
        <View style={s.turnList}>
          {turns.map((turn, index) => (
            <View key={`${index}-${turn.transcript.slice(0, 12)}`} style={s.turnCard}>
              <Text style={s.label}>YOU</Text>
              <Text style={s.turnText}>{turn.transcript}</Text>
              <Text style={[s.label, s.pragyaLabel]}>PRAGYA</Text>
              <Text style={s.turnText}>{turn.response}</Text>
              {turn.audioId === currentAudioId ? (
                <View style={s.audioControls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={playerStatus.playing ? "Pause Pragya’s reply" : audioReady ? "Play Pragya’s reply" : "Retry loading Pragya’s reply"}
                    disabled={audioLoading}
                    onPress={() => void toggleLatestReply(turn.audioId)}
                    style={s.audioButton}
                  >
                    <Text style={s.audioButtonText}>
                      {audioLoading ? "Loading audio…" : playerStatus.playing ? "Pause reply Ⅱ" : audioReady ? "Play reply ▶" : "Retry audio ↻"}
                    </Text>
                  </Pressable>
                  <Text style={s.audioStatus}>
                    {playerStatus.error
                      ? "Audio could not start. Tap Play reply to retry."
                      : playerStatus.isBuffering
                        ? "Loading spoken reply…"
                        : !audioReady
                          ? "Reply audio needs to be loaded."
                        : playerStatus.playing
                          ? "Pragya is speaking…"
                          : "If it was silent, tap Play reply."}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {recap ? (
        <View style={s.recapCard}>
          <Text style={s.label}>DAILY REPORT</Text>
          <Text style={s.head}>{recap.summary}</Text>
          {recap.themes.length ? <Text style={s.copy}>Themes: {recap.themes.join(" · ")}</Text> : null}
          <Text style={s.recapLabel}>What happened</Text>
          <Text style={s.copy}>{recap.cbt_reflection.situation}</Text>
          <Text style={s.recapLabel}>Thought you noticed</Text>
          <Text style={s.copy}>{recap.cbt_reflection.thought}</Text>
          <Text style={s.recapLabel}>A balanced perspective</Text>
          <Text style={s.copy}>{recap.cbt_reflection.balanced_perspective}</Text>
          <Text style={s.recapLabel}>One small next step</Text>
          <Text style={s.copy}>{recap.next_step}</Text>
          {submittedRating !== null ? <Text style={s.copy}>Your feedback: {submittedRating} out of 5</Text> : null}
          <Link href="/progress" style={s.reportLink}>View progress report →</Link>
        </View>
      ) : null}

      <View style={s.card}>
        <Text style={s.label}>GUIDED CBT REFLECTION</Text>
        <Text style={s.head}>We’ll explore one thought together</Text>
        <Text style={s.copy}>Pragya can help you notice what happened, the thought that came up, and another way to look at it.</Text>
        <View style={s.step}><Text style={s.stepNo}>1</Text><Text style={s.stepText}>What happened?</Text></View>
        <View style={s.step}><Text style={s.stepNo}>2</Text><Text style={s.stepText}>What thought came up?</Text></View>
        <View style={s.step}><Text style={s.stepNo}>3</Text><Text style={s.stepText}>What might be a balanced perspective?</Text></View>
      </View>

      <Text style={s.note}>You can complete up to 3 spoken turns. After feedback, Pragya generates your daily report and ends the session. Audio and conversation text are held temporarily and cleared when the session ends.</Text>
      <Text style={s.disclaimer}>Pragya supports reflection and does not replace professional care.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1" },
  body: { padding: 24, paddingTop: 28, paddingBottom: 30, gap: 18 },
  back: { color: "#214B3B", fontSize: 15, fontWeight: "600" },
  title: { color: "#173D32", fontSize: 32, fontWeight: "700", marginTop: 10 },
  sub: { color: "#68746F", fontSize: 16, lineHeight: 23 },
  micCard: { minHeight: 245, backgroundColor: "#EEF1E8", borderRadius: 28, alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8, padding: 22 },
  micActive: { backgroundColor: "#E5EEE6" },
  micIcon: { color: "#173D32", fontSize: 54 },
  micText: { color: "#173D32", fontSize: 18, fontWeight: "700" },
  timer: { color: "#68746F", fontSize: 15, minHeight: 20 },
  primary: { backgroundColor: "#214B3B", paddingVertical: 15, paddingHorizontal: 28, borderRadius: 28, minWidth: 190, alignItems: "center" },
  primaryText: { color: "white", fontSize: 16, fontWeight: "700" },
  stopButton: { backgroundColor: "white", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 28, minWidth: 190, alignItems: "center", borderWidth: 1, borderColor: "#A84E4E" },
  stopText: { color: "#8F3B3B", fontSize: 16, fontWeight: "700" },
  permission: { color: "#8F3B3B", fontSize: 13, textAlign: "center" },
  notice: { color: "#375A49", backgroundColor: "#E7ECDD", padding: 13, borderRadius: 14, fontSize: 13, lineHeight: 20 },
  feedbackCard: { backgroundColor: "white", borderRadius: 22, borderWidth: 1, borderColor: "#ECEAE1", padding: 20, gap: 12 },
  turnList: { gap: 12 },
  turnCard: { backgroundColor: "white", borderRadius: 20, borderWidth: 1, borderColor: "#ECEAE1", padding: 18, gap: 8 },
  turnText: { color: "#173D32", fontSize: 15, lineHeight: 23 },
  pragyaLabel: { marginTop: 10 },
  audioControls: { alignItems: "flex-start", gap: 7, marginTop: 4 },
  audioButton: { backgroundColor: "#E7ECDD", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  audioButtonText: { color: "#214B3B", fontSize: 14, fontWeight: "700" },
  audioStatus: { color: "#68746F", fontSize: 12 },
  recapCard: { backgroundColor: "white", borderRadius: 22, borderWidth: 1, borderColor: "#ECEAE1", padding: 20, gap: 10 },
  recapLabel: { color: "#214B3B", fontSize: 13, fontWeight: "700", marginTop: 6 },
  ratingRow: { flexDirection: "row", gap: 10 },
  ratingButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EEF1E8", alignItems: "center", justifyContent: "center" },
  ratingSelected: { backgroundColor: "#214B3B" },
  ratingText: { color: "#214B3B", fontSize: 15, fontWeight: "700" },
  ratingTextSelected: { color: "white" },
  disabledButton: { opacity: 0.5 },
  reportLink: { color: "#214B3B", fontSize: 15, fontWeight: "700", marginTop: 4 },
  card: { backgroundColor: "#F0EFF7", borderRadius: 22, padding: 20, gap: 12 },
  label: { color: "#687D70", fontSize: 11, letterSpacing: 1.6, fontWeight: "700" },
  head: { color: "#173D32", fontSize: 22, fontWeight: "700" },
  copy: { color: "#68746F", fontSize: 15, lineHeight: 23 },
  step: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8 },
  stepNo: { width: 28, height: 28, borderRadius: 14, overflow: "hidden", textAlign: "center", textAlignVertical: "center", color: "#214B3B", backgroundColor: "#E2E9DD", fontWeight: "700" },
  stepText: { color: "#173D32", fontSize: 14, flex: 1 },
  note: { color: "#68746F", fontSize: 14, lineHeight: 21, paddingHorizontal: 4 },
  disclaimer: { color: "#7B817D", fontSize: 12, textAlign: "center", marginTop: 4 },
});


