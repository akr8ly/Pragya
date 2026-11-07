import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getDailyPrompt } from "../lib/api";
import { getOrCreatePragyaAlias } from "../lib/profile-alias";
import { supabase } from "../lib/supabase";

const ink = "#173D32";
const muted = "#68746F";
const cream = "#F8F7F1";
const green = "#214B3B";

export default function HomeScreen() {
  const [dailyPrompt, setDailyPrompt] = useState("What’s one thing you wish felt a little easier today?");
  const [displayName, setDisplayName] = useState("Quiet Cedar");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    getDailyPrompt().then((result) => setDailyPrompt(result.prompt)).catch(() => undefined);
    const loadAlias = () => { void getOrCreatePragyaAlias().then(setDisplayName).catch(() => undefined); };
    loadAlias();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(loadAlias);
    const clock = setInterval(() => setNow(new Date()), 60_000);
    return () => { subscription.unsubscribe(); clearInterval(clock); };
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.brand}>✿ Pragya</Text>
        <Link href={"/profile" as import("expo-router").Href} style={styles.profile}>Profile</Link>
      </View>
      <Text style={styles.greeting}>{greeting}, {displayName}</Text>
      <Text style={styles.subtitle}>A small moment for yourself today.</Text>

      <View style={styles.promptCard}>
        <Text style={styles.eyebrow}>DAILY PROMPT</Text>
        <Text style={styles.prompt}>{dailyPrompt}</Text>
        <Link href="/session" style={styles.promptLink}>Reflect now  →</Link>
      </View>

      <View style={styles.playlistCard}>
        <View style={styles.art}>
          <Text style={styles.sun}>☼</Text>
          <Text style={styles.artTitle}>Soft Focus</Text>
          <Text style={styles.artCaption}>Example playlist preview</Text>
        </View>
        <Text style={styles.meta}>PLAYLIST PREVIEW</Text>
        <Link href="/playlists" style={styles.spotifyButton}>View playlist preview</Link>
      </View>

      <Link href="/session" asChild>
        <View style={styles.sessionCard}>
          <Text style={styles.cardTitle}>Ready to talk it through?</Text>
          <Text style={styles.cardCopy}>Start a live session with a guided CBT reflection.</Text>
          <Text style={styles.action}>Start a live session  →</Text>
        </View>
      </Link>

      <Link href={"/profile" as import("expo-router").Href} asChild>
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Your activity</Text>
          <Text style={styles.cardCopy}>See your session calendar and saved recaps.</Text>
          <Text style={styles.action}>View profile and activity  →</Text>
        </View>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: cream },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: ink, fontSize: 25, fontWeight: "700" },
  profile: { color: ink, backgroundColor: "#E7ECDD", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, overflow: "hidden", fontSize: 14, fontWeight: "700" },
  greeting: { color: ink, fontSize: 30, fontWeight: "700", marginTop: 6 },
  subtitle: { color: muted, fontSize: 16, marginTop: -12 },
  promptCard: { backgroundColor: "#F0EFF7", borderRadius: 22, padding: 20, gap: 10 },
  eyebrow: { color: "#687D70", fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  prompt: { color: ink, fontSize: 22, lineHeight: 30, fontWeight: "600" },
  promptLink: { color: green, fontSize: 15, fontWeight: "700", marginTop: 2 },
  playlistCard: { backgroundColor: "#173D32", borderRadius: 22, overflow: "hidden", paddingBottom: 16 },
  art: { height: 190, justifyContent: "flex-end", padding: 18, backgroundColor: "#375A49" },
  sun: { position: "absolute", right: 24, top: 12, color: "#F3D7A5", fontSize: 50 },
  artTitle: { color: "white", fontSize: 34, fontWeight: "700" },
  artCaption: { color: "#F1F0E8", fontSize: 14 },
  meta: { color: "#D5E1D1", letterSpacing: 1.5, fontSize: 10, fontWeight: "700", marginHorizontal: 18, marginTop: 14 },
  spotifyButton: { alignSelf: "flex-start", overflow: "hidden", color: "white", backgroundColor: "#168A4B", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, fontWeight: "700", marginHorizontal: 18, marginTop: 10 },
  sessionCard: { backgroundColor: "#EEF1E8", borderRadius: 20, padding: 18, gap: 8 },
  progressCard: { backgroundColor: "white", borderColor: "#ECEAE1", borderWidth: 1, borderRadius: 20, padding: 18, gap: 8 },
  cardTitle: { color: ink, fontSize: 20, fontWeight: "700" },
  cardCopy: { color: muted, fontSize: 14, lineHeight: 21 },
  action: { color: green, fontSize: 15, fontWeight: "700", marginTop: 4 },
});
