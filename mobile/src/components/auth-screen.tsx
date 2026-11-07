import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { completeAuthCallback } from "../lib/auth-callback";

type AuthScreenProps = {
  callbackNotice?: string;
  onClearCallbackNotice?: () => void;
};

export default function AuthScreen({ callbackNotice = "", onClearCallbackNotice }: AuthScreenProps) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setNotice("Supabase is not configured. Add its URL and publishable key to mobile/.env, then restart Expo.");
      return;
    }

    setBusy(true);
    setNotice("");
    onClearCallbackNotice?.();
    try {
      const redirectTo = Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: Platform.OS !== "web" },
      });
      if (error) throw error;

      if (Platform.OS !== "web" && data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === "success" && result.url) {
          const callbackError = await completeAuthCallback(result.url);
          if (callbackError) throw new Error(callbackError);
        } else if (result.type === "cancel" || result.type === "dismiss") {
          setNotice("Google sign-in was cancelled. You can try again whenever you’re ready.");
        } else {
          setNotice("Google sign-in did not return to Pragya. Check the Supabase redirect URL and try again.");
        }
      } else if (Platform.OS !== "web" && !data.url) {
        setNotice("Supabase did not return a Google sign-in page. Check that Google is enabled in Supabase Auth.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not start Google sign-in. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.page}>
      <View style={s.content}>
        <Text style={s.brand}>pragya</Text>
        <Text style={s.title}>A moment to reflect.</Text>
        <Text style={s.copy}>Sign in to start a private live conversation and save recaps for your progress reports.</Text>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void signInWithGoogle()} style={[s.button, busy && s.buttonDisabled]}>
          <Text style={s.googleMark}>G</Text>
          <Text style={s.buttonText}>{busy ? "Connecting to Google…" : "Continue with Google"}</Text>
        </Pressable>
        {callbackNotice ? <Text accessibilityLiveRegion="polite" style={s.callbackNotice}>{callbackNotice}</Text> : null}
        {notice ? <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text> : null}
        <Text style={s.privacy}>New here? Your Google account creates your Pragya account. Your email is used for sign-in. Pragya is for reflection and does not replace professional care.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8F7F1", justifyContent: "center", padding: 24 },
  content: { gap: 16, maxWidth: 460, width: "100%", alignSelf: "center" },
  brand: { color: "#214B3B", fontSize: 17, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  title: { color: "#173D32", fontSize: 34, fontWeight: "700", marginTop: 18 },
  copy: { color: "#68746F", fontSize: 16, lineHeight: 24, marginBottom: 18 },
  button: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E4E5DC", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, justifyContent: "center", padding: 16 },
  buttonDisabled: { opacity: 0.65 },
  googleMark: { color: "#4285F4", fontSize: 20, fontWeight: "800" },
  buttonText: { color: "#173D32", fontSize: 16, fontWeight: "700" },
  notice: { color: "#214B3B", fontSize: 14, lineHeight: 21 },
  callbackNotice: { color: "#8F3B3B", backgroundColor: "#F8EAEA", padding: 12, borderRadius: 12, fontSize: 13, lineHeight: 19 },
  privacy: { color: "#7B817D", fontSize: 12, lineHeight: 18, marginTop: 14, textAlign: "center" },
});
