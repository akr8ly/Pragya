import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDailyPrompt } from "../lib/api";
import { getOrCreatePragyaAlias } from "../lib/profile-alias";
import { supabase } from "../lib/supabase";

const ink = "#173D32";
const muted = "#68746F";
const cream = "#F8F7F1";
const green = "#214B3B";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [dailyPrompt, setDailyPrompt] = useState("What’s one thing you wish felt a little easier today?");
  const [displayName, setDisplayName] = useState("Your space");
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
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <View pointerEvents="none" style={styles.leafCluster}>
        <View style={[styles.leaf, styles.leafOne]} />
        <View style={[styles.leaf, styles.leafTwo]} />
      </View>
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>✦</Text></View>
        <Text style={styles.brand}>Pragya</Text>
      </View>
      <Text style={styles.eyebrow}>A PRIVATE SPACE FOR YOU</Text>
      <Text style={styles.greeting}>{greeting},{"\n"}{displayName}</Text>
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
          <Text style={styles.artCaption}>A provider-free sound plan</Text>
        </View>
        <Text style={styles.meta}>MOOD-ALIGNED SOUND SPACE</Text>
        <Link href="/playlists" style={styles.spotifyButton}>Explore sound plan</Link>
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
  content: { position: "relative", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 30, gap: 16, overflow: "hidden" },
  leafCluster: { position: "absolute", right: -30, top: 132, width: 150, height: 120, opacity: 0.6 },
  leaf: { position: "absolute", width: 80, height: 38, borderTopLeftRadius: 80, borderBottomRightRadius: 80, backgroundColor: "#DFCFF0" },
  leafOne: { right: 0, top: 16, transform: [{ rotate: "38deg" }] },
  leafTwo: { right: 55, top: 2, transform: [{ rotate: "44deg" }], backgroundColor: "#E8DFF4" },
  header: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 33, height: 33, borderRadius: 17, backgroundColor: "#E7ECDD", alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: green, fontSize: 18, fontWeight: "900" },
  brand: { color: ink, fontSize: 25, fontWeight: "800", flex: 1 },
  eyebrow: { color: "#687D70", fontSize: 10, letterSpacing: 1.8, fontWeight: "800", marginTop: 10 },
  greeting: { color: ink, fontSize: 34, lineHeight: 39, fontWeight: "800", marginTop: -8, fontFamily: "serif" },
  subtitle: { color: muted, fontSize: 16, marginTop: -12 },
  promptCard: { backgroundColor: "#F2F0F8", borderRadius: 24, padding: 21, gap: 11, borderWidth: 1, borderColor: "#E9E5F1" },
  prompt: { color: ink, fontSize: 22, lineHeight: 30, fontWeight: "600" },
  promptLink: { color: green, fontSize: 15, fontWeight: "700", marginTop: 2 },
  playlistCard: { backgroundColor: "#173D32", borderRadius: 24, overflow: "hidden", paddingBottom: 17 },
  art: { height: 200, justifyContent: "flex-end", padding: 20, backgroundColor: "#375A49" },
  sun: { position: "absolute", right: 24, top: 12, color: "#F3D7A5", fontSize: 50 },
  artTitle: { color: "white", fontSize: 34, fontWeight: "700" },
  artCaption: { color: "#F1F0E8", fontSize: 14 },
  meta: { color: "#D5E1D1", letterSpacing: 1.5, fontSize: 10, fontWeight: "700", marginHorizontal: 18, marginTop: 14 },
  spotifyButton: { alignSelf: "flex-start", overflow: "hidden", color: "white", backgroundColor: "#168A4B", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, fontWeight: "700", marginHorizontal: 18, marginTop: 10 },
  sessionCard: { backgroundColor: "#EEF1E8", borderRadius: 22, padding: 19, gap: 8, borderWidth: 1, borderColor: "#E1E8D9" },
  progressCard: { backgroundColor: "white", borderColor: "#ECEAE1", borderWidth: 1, borderRadius: 22, padding: 19, gap: 8 },
  cardTitle: { color: ink, fontSize: 20, fontWeight: "700" },
  cardCopy: { color: muted, fontSize: 14, lineHeight: 21 },
  action: { color: green, fontSize: 15, fontWeight: "700", marginTop: 4 },
});
