import { useEffect } from "react";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/**
 * Spotify redirects into this native route after consent. WebBrowser receives
 * the full URL to finish PKCE; this route simply prevents Expo Router from
 * rendering an unmatched-route error if Android delivers it first.
 */
export default function SpotifyCallbackScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/playlists"), 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.page}>
      <ActivityIndicator color="#214B3B" size="large" />
      <Text style={styles.title}>Finishing Spotify connection…</Text>
      <Text style={styles.copy}>You’ll return to your playlist in a moment.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1", justifyContent: "center", alignItems: "center", padding: 28, gap: 13 },
  title: { color: "#173D32", fontSize: 22, fontWeight: "800", textAlign: "center" },
  copy: { color: "#68746F", fontSize: 15, textAlign: "center" },
});
