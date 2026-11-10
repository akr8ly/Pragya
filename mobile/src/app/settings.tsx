import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteMyData } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    setNotice(error ? "Could not sign out right now. Please try again." : "You have signed out.");
  }

  async function deleteSavedData() {
    if (deleting) return;
    setDeleting(true);
    setNotice("");
    try {
      const result = await deleteMyData();
      setNotice(result.message);
    } catch {
      setNotice("Could not delete saved data right now. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    const title = "Delete saved recaps?";
    const message = "This permanently removes your saved session recaps and progress history.";
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${message}`)) void deleteSavedData();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { void deleteSavedData(); } },
    ]);
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={[s.body, { paddingTop: insets.top + 18 }]}>
      <View pointerEvents="none" style={s.leafCluster}>
        <View style={[s.leaf, s.leafOne]} />
        <View style={[s.leaf, s.leafTwo]} />
      </View>
      <Text style={s.eyebrow}>PRIVATE BY DESIGN</Text>
      <Text style={s.title}>Settings & privacy</Text>
      <View style={[s.card, s.softCard]}>
        <Text style={s.kicker}>SOUND</Text>
        <Text style={s.head}>Sound Space</Text>
        <Text style={s.copy}>Your sound plans work with any music app. Pragya does not require a music account or subscription.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.kicker}>YOUR DATA</Text>
        <Text style={s.head}>Saved session recaps</Text>
        <Text style={s.copy}>Recaps are saved to your account and used for your progress report. Only your account can access them.</Text>
        <Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete}>
          <Text style={s.delete}>{deleting ? "Deleting…" : "Delete saved data"}</Text>
        </Pressable>
      </View>
      <View style={[s.card, s.softCard]}>
        <Text style={s.kicker}>PREFERENCES</Text>
        <Text style={s.head}>Preferences</Text>
        <Text style={s.copy}>Daily prompt · Spoken responses · Reminder time</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={signOut} style={s.signOut}>
        <Text style={s.action}>Sign out</Text>
      </Pressable>
      {notice ? <Text accessibilityLiveRegion="polite" style={s.note}>{notice}</Text> : null}
      <Text style={s.note}>Your voice recordings are not retained by default.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1" },
  body: { position: "relative", padding: 24, paddingTop: 28, paddingBottom: 34, gap: 16, overflow: "hidden" },
  leafCluster: { position: "absolute", right: -30, top: 52, width: 140, height: 120, opacity: 0.55 },
  leaf: { position: "absolute", width: 82, height: 37, borderTopLeftRadius: 82, borderBottomRightRadius: 82, backgroundColor: "#E1D5F1" },
  leafOne: { right: 1, top: 9, transform: [{ rotate: "36deg" }] },
  leafTwo: { right: 48, top: 36, transform: [{ rotate: "-8deg" }], backgroundColor: "#EEE6F7" },
  eyebrow: { color: "#687D70", fontSize: 10, letterSpacing: 1.8, fontWeight: "800", marginTop: -7 },
  title: { color: "#173D32", fontSize: 34, lineHeight: 40, fontWeight: "800", marginTop: -12, fontFamily: "serif" },
  card: { backgroundColor: "white", borderRadius: 22, padding: 19, gap: 10, borderWidth: 1, borderColor: "#ECEAE1" },
  softCard: { backgroundColor: "#EEF1E8", borderColor: "#E0E7D8" },
  kicker: { color: "#687D70", fontSize: 10, letterSpacing: 1.5, fontWeight: "800" },
  head: { color: "#173D32", fontSize: 20, fontWeight: "700" },
  copy: { color: "#68746F", fontSize: 15, lineHeight: 22 },
  action: { color: "#214B3B", fontSize: 15, fontWeight: "700" },
  signOut: { backgroundColor: "#F2F0F8", borderRadius: 18, padding: 17, borderWidth: 1, borderColor: "#E8E3F1", alignItems: "center" },
  delete: { color: "#8F3B3B", fontSize: 14, fontWeight: "700", paddingTop: 4 },
  note: { color: "#7B817D", fontSize: 13, textAlign: "center" },
});
