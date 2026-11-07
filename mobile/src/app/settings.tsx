import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { deleteMyData } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {
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
    <ScrollView style={s.page} contentContainerStyle={s.body}>
      <Link href={"/profile" as import("expo-router").Href} style={s.back}>←  Profile</Link>
      <Text style={s.title}>Settings & privacy</Text>
      <View style={s.card}>
        <Text style={s.head}>Spotify</Text>
        <Text style={s.copy}>Spotify playlist creation is a preview and is not connected yet.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.head}>Saved session recaps</Text>
        <Text style={s.copy}>Recaps are saved to your account and used for your progress report. Only your account can access them.</Text>
        <Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete}>
          <Text style={s.delete}>{deleting ? "Deleting…" : "Delete saved data"}</Text>
        </Pressable>
      </View>
      <View style={s.card}>
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
  body: { padding: 24, paddingTop: 28, gap: 16 },
  back: { color: "#214B3B", fontSize: 15, fontWeight: "600" },
  title: { color: "#173D32", fontSize: 30, fontWeight: "700", marginTop: 10 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 18, gap: 10, borderWidth: 1, borderColor: "#ECEAE1" },
  head: { color: "#173D32", fontSize: 20, fontWeight: "700" },
  copy: { color: "#68746F", fontSize: 15, lineHeight: 22 },
  action: { color: "#214B3B", fontSize: 15, fontWeight: "700" },
  signOut: { backgroundColor: "white", borderRadius: 16, padding: 17, borderWidth: 1, borderColor: "#ECEAE1" },
  delete: { color: "#8F3B3B", fontSize: 14, fontWeight: "700", paddingTop: 4 },
  note: { color: "#7B817D", fontSize: 13, textAlign: "center" },
});
