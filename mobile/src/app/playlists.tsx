import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const moods = {
  Calm: { title: "Soft Focus", caption: "Gentle sound for a quieter mind.", tone: "#375A49", card: "#EAF0E5", accent: "#C7D6B9", icon: "☼", motif: "BREATHE", tracks: ["soft instrumental focus", "slow ambient reset", "rainy-day piano"], duration: "20-minute reset" },
  Focus: { title: "Clear Space", caption: "Steady energy for the next small step.", tone: "#315767", card: "#E5EEF3", accent: "#B8D2DD", icon: "✦", motif: "CLARITY", tracks: ["deep-focus instrumental", "low-fi without lyrics", "calm electronic concentration"], duration: "30-minute focus block" },
  Comfort: { title: "Warm Landing", caption: "A little softness when the day feels heavy.", tone: "#765847", card: "#F5EAE0", accent: "#EAC9AE", icon: "☾", motif: "SOFTEN", tracks: ["Hindi acoustic comfort", "gentle indie warmth", "soft evening guitar"], duration: "15-minute landing" },
  Energy: { title: "Fresh Start", caption: "A gentle lift without rushing yourself.", tone: "#4B586D", card: "#E8EAF3", accent: "#C9CDEC", icon: "↗", motif: "RISE", tracks: ["bright morning pop", "uplifting Hindi indie", "light movement mix"], duration: "20-minute lift" },
} as const;

type Mood = keyof typeof moods;

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const [mood, setMood] = useState<Mood>("Calm");
  const [notice, setNotice] = useState("");
  const playlist = moods[mood];
  const [float] = useState(() => new Animated.Value(0));

  useEffect(() => {
    float.setValue(0);
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float, mood]);
  const heroLift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  async function sharePlan() {
    try {
      await Share.share({ title: `Pragya · ${playlist.title}`, message: `My Pragya sound plan: ${playlist.title} (${playlist.duration})\n\nSearch these in any music app:\n${playlist.tracks.map((track, index) => `${index + 1}. ${track}`).join("\n")}` });
      setNotice("Sound plan ready to share or paste into your music app.");
    } catch {
      setNotice("Could not open sharing right now. You can still use the prompts below.");
    }
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={[s.body, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
      <View pointerEvents="none" style={s.leafCluster}>
        <View style={[s.leaf, s.leafOne]} />
        <View style={[s.leaf, s.leafTwo]} />
      </View>
      <Text style={s.eyebrow}>PRAGYA SOUND SPACE</Text>
      <Text style={s.title}>A soundtrack for now</Text>
      <Text style={s.sub}>Choose the kind of space you need. Use the sound plan in any music app — no sign-in required.</Text>

      <View style={[s.hero, { backgroundColor: playlist.tone }]}>
        <Animated.View pointerEvents="none" style={[s.heroOrb, { backgroundColor: playlist.accent, transform: [{ translateY: heroLift }, { rotate: "18deg" }] }]} />
        <Animated.View pointerEvents="none" style={[s.heroRing, { borderColor: playlist.accent, transform: [{ translateY: heroLift }] }]} />
        <Text pointerEvents="none" style={s.heroMotif}>{playlist.motif}</Text>
        <Text style={s.icon}>{playlist.icon}</Text>
        <Text style={s.tag}>PRAGYA SOUND PLAN</Text>
        <Text style={s.name}>{playlist.title}</Text>
        <Text style={s.copy}>{playlist.caption}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.head}>What do you need right now?</Text>
        <View style={s.moodGrid}>
          {(Object.keys(moods) as Mood[]).map((option) => (
            <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: mood === option }} onPress={() => setMood(option)} style={[s.moodCard, { backgroundColor: moods[option].card }, mood === option && { borderColor: moods[option].tone, borderWidth: 2 }]}>
              <View pointerEvents="none" style={[s.cardOrb, { backgroundColor: moods[option].accent }]} />
              <Text style={[s.cardMotif, { color: moods[option].tone }]}>{moods[option].icon}</Text>
              <Text style={[s.cardTitle, { color: moods[option].tone }]}>{moods[option].title}</Text>
              <Text style={s.cardCaption}>{moods[option].duration}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.previewCard}>
        <View style={s.previewHeader}><Text style={s.head}>Your sound plan</Text><Text style={s.count}>{playlist.duration}</Text></View>
        {playlist.tracks.map((track, index) => (
          <View key={track} style={s.track}>
            <Text style={s.trackNumber}>{String(index + 1).padStart(2, "0")}</Text>
            <View style={s.trackText}><Text style={s.trackTitle}>{track}</Text><Text style={s.trackMeta}>Search this anywhere you listen</Text></View>
            <Text style={s.duration}>⌕</Text>
          </View>
        ))}
      </View>

      <View style={s.notice}>
        <Text style={s.noticeTitle}>Your music, your choice</Text>
        <Text style={s.noticeText}>Pragya does not require Spotify, Premium, or any account. Share this plan and paste its prompts into the music app you already use.</Text>
        <Pressable accessibilityRole="button" onPress={() => void sharePlan()} style={s.primaryButton}><Text style={s.primaryText}>Share sound plan</Text></Pressable>
        {notice ? <Text accessibilityLiveRegion="polite" style={s.noticeText}>{notice}</Text> : null}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1" },
  body: { position: "relative", padding: 24, paddingTop: 28, paddingBottom: 38, gap: 20, overflow: "hidden" },
  leafCluster: { position: "absolute", right: -30, top: 58, width: 135, height: 120, opacity: 0.55 },
  leaf: { position: "absolute", width: 78, height: 36, borderTopLeftRadius: 78, borderBottomRightRadius: 78, backgroundColor: "#E2D5F1" },
  leafOne: { right: 0, top: 8, transform: [{ rotate: "35deg" }] },
  leafTwo: { right: 48, top: 33, transform: [{ rotate: "-8deg" }], backgroundColor: "#EEE5F7" },
  eyebrow: { color: "#687D70", fontSize: 10, letterSpacing: 1.8, fontWeight: "800", marginTop: -6 },
  title: { color: "#173D32", fontSize: 34, lineHeight: 39, fontWeight: "800", marginTop: -12, fontFamily: "serif" },
  sub: { color: "#68746F", fontSize: 16, lineHeight: 24, marginTop: -10 },
  hero: { minHeight: 250, borderRadius: 28, padding: 22, justifyContent: "flex-end", gap: 8, overflow: "hidden" },
  heroOrb: { width: 185, height: 185, borderRadius: 92, opacity: 0.35, position: "absolute", right: -38, top: -55 },
  heroRing: { width: 128, height: 128, borderRadius: 64, borderWidth: 2, opacity: 0.8, position: "absolute", right: 42, top: 40 },
  heroMotif: { position: "absolute", right: -4, bottom: 66, color: "rgba(255,255,255,0.13)", fontSize: 27, letterSpacing: 4, fontWeight: "800", transform: [{ rotate: "-90deg" }] },
  icon: { color: "#F3D7A5", fontSize: 54, position: "absolute", right: 23, top: 16 },
  tag: { color: "#D5E1D1", fontSize: 10, fontWeight: "800", letterSpacing: 1.7 },
  name: { color: "white", fontSize: 35, fontWeight: "800", fontFamily: "serif" },
  copy: { color: "#F1F0E8", fontSize: 15, lineHeight: 22 },
  section: { gap: 11 }, head: { color: "#173D32", fontSize: 20, fontWeight: "800" }, moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, moodCard: { width: "48%", minHeight: 136, borderRadius: 21, padding: 15, justifyContent: "flex-end", overflow: "hidden", borderWidth: 1, borderColor: "transparent" }, cardOrb: { width: 80, height: 80, borderRadius: 40, opacity: 0.62, position: "absolute", right: -19, top: -20 }, cardMotif: { position: "absolute", right: 14, top: 13, fontSize: 31, fontWeight: "700" }, cardTitle: { fontSize: 18, fontWeight: "800", fontFamily: "serif", lineHeight: 22, maxWidth: "85%" }, cardCaption: { color: "#68746F", fontSize: 11, fontWeight: "700", marginTop: 4 }, previewCard: { backgroundColor: "white", borderRadius: 24, borderWidth: 1, borderColor: "#ECEAE1", padding: 18, gap: 4 }, previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 }, count: { color: "#68746F", fontSize: 12, fontWeight: "700" }, track: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: "#ECEAE1", paddingVertical: 14 }, trackNumber: { color: "#687D70", fontSize: 12, fontWeight: "800", width: 22 }, trackText: { flex: 1, gap: 3 }, trackTitle: { color: "#173D32", fontSize: 15, fontWeight: "700", textTransform: "capitalize" }, trackMeta: { color: "#68746F", fontSize: 12 }, duration: { color: "#687D70", fontSize: 17 }, notice: { backgroundColor: "#F2F0F8", borderRadius: 19, padding: 17, gap: 9 }, noticeTitle: { color: "#173D32", fontSize: 15, fontWeight: "800" }, noticeText: { color: "#68746F", fontSize: 13, lineHeight: 20 }, primaryButton: { alignSelf: "flex-start", backgroundColor: "#168A4B", borderRadius: 22, paddingHorizontal: 17, paddingVertical: 12 }, primaryText: { color: "white", fontSize: 14, fontWeight: "800" },
});
