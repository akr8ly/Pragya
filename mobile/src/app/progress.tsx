import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getProgressReport, ProgressReport } from "../lib/api";

export default function ProgressScreen() {
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProgressReport(30)
      .then(setReport)
      .catch(() => setError("Your progress report isn’t available right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.body}>
      <Link href="/" style={s.back}>←  Home</Link>
      <Text style={s.title}>Your progress</Text>
      <Text style={s.sub}>A gentle look at your reflections over the past 30 days.</Text>

      {loading ? <Text style={s.copy}>Loading your report…</Text> : null}
      {error ? <Text accessibilityLiveRegion="polite" style={s.notice}>{error}</Text> : null}

      {!loading && !error && report ? (
        <>
          <View style={s.summaryRow}>
            <View style={s.metric}>
              <Text style={s.metricValue}>{report.session_count}</Text>
              <Text style={s.metricLabel}>reflections</Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricValue}>{report.average_helpfulness === null ? "—" : `${report.average_helpfulness}/5`}</Text>
              <Text style={s.metricLabel}>helpfulness</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.head}>Themes you explored</Text>
            {report.recurring_themes.length ? (
              <View style={s.themeList}>
                {report.recurring_themes.map((theme) => <Text key={theme} style={s.chip}>{theme}</Text>)}
              </View>
            ) : (
              <Text style={s.copy}>Themes will appear after a session recap is created.</Text>
            )}
          </View>

          <View style={s.card}>
            <Text style={s.head}>Recent reflections</Text>
            {report.recent_sessions.length ? report.recent_sessions.map((session) => (
              <View key={session.session_id} style={s.session}>
                <Text style={s.date}>{new Date(session.ended_at).toLocaleDateString()}</Text>
                <Text style={s.copy}>{session.summary}</Text>
                {session.helpfulness_rating !== null ? (
                  <Text style={s.rating}>Helpful: {session.helpfulness_rating}/5</Text>
                ) : null}
              </View>
            )) : (
              <Text style={s.copy}>Your session recaps will appear here after you end a conversation.</Text>
            )}
          </View>
          <Text style={s.note}>These are reflections from your sessions, not a clinical assessment or mental-health score.</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1" },
  body: { padding: 24, paddingTop: 28, paddingBottom: 36, gap: 16 },
  back: { color: "#214B3B", fontSize: 15, fontWeight: "600" },
  title: { color: "#173D32", fontSize: 32, fontWeight: "700", marginTop: 10 },
  sub: { color: "#68746F", fontSize: 16, lineHeight: 23 },
  summaryRow: { flexDirection: "row", gap: 12 },
  metric: { flex: 1, backgroundColor: "#EEF1E8", borderRadius: 20, padding: 18, gap: 4 },
  metricValue: { color: "#173D32", fontSize: 26, fontWeight: "700" },
  metricLabel: { color: "#68746F", fontSize: 13 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: "#ECEAE1" },
  head: { color: "#173D32", fontSize: 20, fontWeight: "700" },
  themeList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { color: "#214B3B", backgroundColor: "#EEF1E8", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, overflow: "hidden" },
  session: { borderTopWidth: 1, borderTopColor: "#ECEAE1", paddingTop: 12, gap: 6 },
  date: { color: "#687D70", fontSize: 12, fontWeight: "700" },
  copy: { color: "#68746F", fontSize: 15, lineHeight: 22 },
  rating: { color: "#214B3B", fontSize: 13, fontWeight: "600" },
  note: { color: "#7B817D", fontSize: 12, lineHeight: 18, textAlign: "center" },
  notice: { color: "#8F3B3B", backgroundColor: "#F8EAEA", padding: 13, borderRadius: 14, fontSize: 13 },
});
