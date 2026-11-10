import { useEffect, useState } from "react";
import { router, Tabs } from "expo-router";
import * as Linking from "expo-linking";
import { Text, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "../components/auth-screen";
import ConsentScreen from "../components/consent-screen";
import { completeAuthCallback } from "../lib/auth-callback";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { completeSpotifyCallback } from "../lib/spotify";

const ink = "#173D32";
const muted = "#68746F";

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text accessibilityElementsHidden importantForAccessibility="no" style={{ color, fontSize: 20, lineHeight: 22, fontWeight: "700" }}>{glyph}</Text>;
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [authLinkMessage, setAuthLinkMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;

    supabase.auth.getSession().then(
      ({ data }) => {
        if (alive) {
          setSession(data.session);
          setReady(true);
        }
      },
      () => {
        if (alive) setReady(true);
      },
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setAuthLinkMessage("");
      setReady(true);
    });

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      if (url.includes("auth/spotify/callback")) {
        try { await completeSpotifyCallback(url); }
        catch { /* Playlists shows a retryable connection state. */ }
        router.navigate("/playlists");
        return;
      }
      if (!url.includes("auth/callback")) return;
      setAuthLinkMessage("Completing sign-in…");
      const callbackError = await completeAuthCallback(url);
      if (callbackError) setAuthLinkMessage(callbackError);
    };

    Linking.getInitialURL().then((url) => { if (url) void handleUrl(url); }).catch(() => undefined);
    const linkSubscription = Linking.addEventListener("url", ({ url }) => { void handleUrl(url); });

    return () => {
      alive = false;
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  if (!ready) return null;
  if (!session) return <AuthScreen callbackNotice={authLinkMessage} onClearCallbackNotice={() => setAuthLinkMessage("")} />;
  if (session.user.user_metadata?.pragya_data_consent !== "v1") return <ConsentScreen />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ink,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EAE8DF",
          height: 64 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        sceneStyle: { backgroundColor: "#F8F7F1" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} /> }} />
      <Tabs.Screen name="session" options={{ title: "Session", tabBarIcon: ({ color }) => <TabIcon glyph="◉" color={color} /> }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="playlists" options={{ title: "Playlists", tabBarIcon: ({ color }) => <TabIcon glyph="♫" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <TabIcon glyph="◎" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="auth/callback" options={{ href: null }} />
      <Tabs.Screen name="auth/spotify/callback" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
