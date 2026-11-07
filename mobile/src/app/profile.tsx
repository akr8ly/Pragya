import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getProgressReport, ProgressReport } from "../lib/api";
import { getAliasInitials, getOrCreatePragyaAlias, savePragyaAlias } from "../lib/profile-alias";

const ink = "#173D32";
const muted = "#68746F";
const green = "#214B3B";
const cream = "#F8F7F1";
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function ProfileScreen() {
  const [alias, setAlias] = useState("Quiet Cedar");
  const [draft, setDraft] = useState("Quiet Cedar");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(dayKey(new Date()));

  useEffect(() => {
    getOrCreatePragyaAlias().then((name) => { setAlias(name); setDraft(name); }).catch(() => undefined);
    getProgressReport(90).then(setReport).catch(() => setNotice("Activity isn’t available right now. Please try again later.")).finally(() => setLoading(false));
  }, []);

  const activityCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const timestamps = report?.activity_timestamps ?? report?.recent_sessions.map((session) => session.ended_at) ?? [];
    timestamps.forEach((timestamp) => {
      const key = dayKey(new Date(timestamp));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [report]);

  const calendar = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 90);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: 13 }, (_, week) => Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      return date;
    }));
  }, []);

  const selectedDate = new Date(`${selectedDay}T12:00:00`);
  const selectedSession = report?.recent_sessions.find((session) => dayKey(new Date(session.ended_at)) === selectedDay);
  const selectedCount = activityCounts.get(selectedDay) ?? 0;
  const monthLabels = calendar.map((week, index) => {
    const firstOfMonth = week.find((day) => day.getDate() <= 7);
    return firstOfMonth && (index === 0 || firstOfMonth.getMonth() !== calendar[index - 1]?.[0]?.getMonth())
      ? firstOfMonth.toLocaleDateString(undefined, { month: "short" })
      : "";
  });

  async function saveAlias() {
    setSaving(true);
    setNotice("");
    try {
      const saved = await savePragyaAlias(draft);
      setAlias(saved);
      setDraft(saved);
      setEditing(false);
      setNotice("Your name is saved. Your sign-in email stays private.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save your name right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
      <Link href="/" style={s.back}>←  Home</Link>
      <Text style={s.title}>Your profile</Text>

      <View style={s.identity}>
        <View style={s.avatar}><Text style={s.initials}>{getAliasInitials(alias)}</Text></View>
        <View style={s.identityText}>
          <Text style={s.alias}>{alias}</Text>
          <Text style={s.caption}>Your private wellbeing space</Text>
        </View>
      </View>

      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View>
            <Text style={s.heading}>Your activity</Text>
            <Text style={s.caption}>Completed sessions · past 90 days</Text>
          </View>
          <Text style={s.count}>{report?.session_count ?? 0}</Text>
        </View>
        <View style={s.calendar}>
          <View style={s.labelsColumn}>
            <Text style={s.weekday}>M</Text><Text style={s.weekday}>W</Text><Text style={s.weekday}>F</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gridScroll}>
            <View>
              <View style={s.months}>{monthLabels.map((label, index) => <Text key={index} style={s.month}>{label}</Text>)}</View>
              <View style={s.weeks}>
                {calendar.map((week, weekIndex) => (
                  <View key={weekIndex} style={s.week}>
                    {week.map((date) => {
                      const key = dayKey(date);
                      const count = activityCounts.get(key) ?? 0;
                      const future = date > new Date();
                      const levelStyle = count === 0 ? s.level0 : count === 1 ? s.level1 : count === 2 ? s.level2 : s.level3;
                      return (
                        <Pressable
                          key={key}
                          accessibilityRole="button"
                          accessibilityLabel={`${date.toLocaleDateString()}, ${count} completed ${count === 1 ? "session" : "sessions"}`}
                          disabled={future}
                          onPress={() => setSelectedDay(key)}
                          style={[s.cell, levelStyle, selectedDay === key && s.selectedCell, future && s.futureCell]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={s.legend}><Text style={s.legendText}>Less</Text><View style={[s.legendCell, s.level0]} /><View style={[s.legendCell, s.level1]} /><View style={[s.legendCell, s.level2]} /><View style={[s.legendCell, s.level3]} /><Text style={s.legendText}>More</Text></View>
        <View style={s.selectedCard}>
          <Text style={s.selectedDate}>{selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text>
          <Text style={s.selectedTitle}>{selectedCount ? `${selectedCount} ${selectedCount === 1 ? "session" : "sessions"} completed` : "No session recorded"}</Text>
          {selectedSession ? <Text style={s.summary}>{selectedSession.summary}</Text> : <Text style={s.summary}>{selectedCount ? "You completed a Pragya reflection on this day." : "Your activity will appear here after a session recap is saved."}</Text>}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.heading}>Choose your name</Text>
        <Text style={s.copy}>Use a nickname or keep your generated one. Pragya doesn’t display your email as your name; email is used for sign-in.</Text>
        {editing ? (
          <>
            <TextInput value={draft} onChangeText={setDraft} maxLength={24} autoCapitalize="words" placeholder="Your name in Pragya" placeholderTextColor="#87918B" accessibilityLabel="Pragya display name" style={s.input} />
            <View style={s.buttonRow}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setDraft(alias); setEditing(false); setNotice(""); }} style={s.secondaryButton}><Text style={s.secondaryText}>Cancel</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void saveAlias()} style={s.primaryButton}><Text style={s.primaryText}>{saving ? "Saving…" : "Save name"}</Text></Pressable>
            </View>
          </>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => { setDraft(alias); setEditing(true); setNotice(""); }} style={s.secondaryButton}><Text style={s.secondaryText}>Change name</Text></Pressable>
        )}
        {notice ? <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text> : null}
      </View>

      <Link href="/settings" asChild>
        <Pressable style={s.accountCard}><View><Text style={s.heading}>Privacy & saved data</Text><Text style={s.caption}>Review or delete your saved recaps</Text></View><Text style={s.chevron}>›</Text></Pressable>
      </Link>
      {loading ? <Text style={s.footer}>Loading your activity…</Text> : null}
      <Text style={s.footer}>Your activity is private to your account. These reflections aren’t a clinical assessment.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: cream },
  body: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 36, gap: 18, maxWidth: 720, width: "100%", alignSelf: "center" },
  back: { color: green, fontSize: 15, fontWeight: "700" },
  title: { color: ink, fontSize: 32, lineHeight: 38, fontWeight: "800", marginTop: 4 },
  identity: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 4 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E7ECDD", alignItems: "center", justifyContent: "center" },
  initials: { color: ink, fontSize: 23, fontWeight: "700" },
  identityText: { flex: 1, gap: 3 },
  alias: { color: ink, fontSize: 22, fontWeight: "700" },
  caption: { color: muted, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: "white", borderRadius: 22, padding: 18, gap: 14, borderWidth: 1, borderColor: "#ECEAE1" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  heading: { color: ink, fontSize: 20, fontWeight: "700" },
  count: { color: ink, fontSize: 24, fontWeight: "800", backgroundColor: "#EEF1E8", borderRadius: 14, overflow: "hidden", paddingHorizontal: 12, paddingVertical: 6 },
  calendar: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  labelsColumn: { width: 14, height: 80, justifyContent: "space-around", paddingBottom: 1 },
  weekday: { color: muted, fontSize: 9, lineHeight: 12 },
  gridScroll: { paddingRight: 2 },
  months: { height: 16, flexDirection: "row", gap: 4, marginBottom: 4 },
  month: { color: muted, width: 24, fontSize: 9, lineHeight: 12 },
  weeks: { flexDirection: "row", gap: 4 },
  week: { gap: 4 },
  cell: { width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: "transparent" },
  level0: { backgroundColor: "#EFF0E9" },
  level1: { backgroundColor: "#C7DABB" },
  level2: { backgroundColor: "#82AD78" },
  level3: { backgroundColor: "#2E6847" },
  selectedCell: { borderColor: ink, borderWidth: 2 },
  futureCell: { opacity: 0.45 },
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 7 },
  legendText: { color: muted, fontSize: 11 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
  selectedCard: { backgroundColor: "#F0EFF7", borderRadius: 16, padding: 14, gap: 4 },
  selectedDate: { color: muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  selectedTitle: { color: ink, fontSize: 16, fontWeight: "700" },
  summary: { color: muted, fontSize: 14, lineHeight: 20 },
  copy: { color: muted, fontSize: 14, lineHeight: 21 },
  input: { borderColor: "#DADFD4", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: ink, fontSize: 16, backgroundColor: cream },
  buttonRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  primaryButton: { borderRadius: 22, backgroundColor: green, paddingHorizontal: 18, paddingVertical: 11, alignItems: "center" },
  primaryText: { color: "white", fontWeight: "700", fontSize: 14 },
  secondaryButton: { alignSelf: "flex-start", borderRadius: 22, backgroundColor: "#EEF1E8", paddingHorizontal: 18, paddingVertical: 11 },
  secondaryText: { color: green, fontWeight: "700", fontSize: 14 },
  notice: { color: green, fontSize: 13, lineHeight: 18 },
  accountCard: { backgroundColor: "#EEF1E8", borderRadius: 18, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chevron: { color: green, fontSize: 28, lineHeight: 30 },
  footer: { color: muted, textAlign: "center", fontSize: 12, lineHeight: 18 },
});
