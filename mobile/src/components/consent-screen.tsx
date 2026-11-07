import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function ConsentScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function agree() {
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { pragya_data_consent: "v1", pragya_data_consent_at: new Date().toISOString() },
    });
    if (updateError) setError("Could not save your choice. Check your connection and try again.");
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <View style={s.page}>
      <View style={s.content}>
        <Text style={s.brand}>PRAGYA · PRIVACY</Text>
        <Text style={s.title}>Before your first session</Text>
        <Text style={s.copy}>Pragya uses these services to provide your live conversation:</Text>
        <Text style={s.item}>• Your audio is sent to Gnani for transcription and spoken replies. Recordings are held temporarily and are not saved.</Text>
        <Text style={s.item}>• The transcript is sent to Google Gemini to generate a response and a CBT-informed recap.</Text>
        <Text style={s.item}>• Session recaps and helpfulness ratings are saved to your account for your progress report. Only your account can access them.</Text>
        <Text style={s.note}>Pragya is a reflection tool, not therapy or medical care. You can delete saved recaps later in Settings.</Text>
        <Pressable accessibilityRole="button" disabled={busy} onPress={agree} style={s.button}>
          <Text style={s.buttonText}>{busy ? "Saving…" : "I understand and agree"}</Text>
        </Pressable>
        {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={signOut}><Text style={s.signout}>Sign out</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1", justifyContent: "center", padding: 24 },
  content: { gap: 15, maxWidth: 500, width: "100%", alignSelf: "center" },
  brand: { color: "#214B3B", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#173D32", fontSize: 30, fontWeight: "700", marginTop: 10 },
  copy: { color: "#68746F", fontSize: 16, lineHeight: 23 },
  item: { color: "#37453E", fontSize: 15, lineHeight: 23 },
  note: { color: "#68746F", fontSize: 13, lineHeight: 20, marginTop: 4 },
  button: { alignItems: "center", backgroundColor: "#214B3B", borderRadius: 24, marginTop: 8, padding: 16 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
  error: { color: "#8F3B3B", fontSize: 13 },
  signout: { color: "#7B817D", fontSize: 12, lineHeight: 18, padding: 10, textAlign: "center" },
});
