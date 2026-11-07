import { supabase } from "../lib/supabase";

const completedUrls = new Set<string>();
const pendingUrls = new Map<string, Promise<string | null>>();

export function completeAuthCallback(url: string): Promise<string | null> {
  if (completedUrls.has(url)) return Promise.resolve(null);
  const pending = pendingUrls.get(url);
  if (pending) return pending;

  const operation = (async (): Promise<string | null> => {
    const parsed = new URL(url);
    const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const urlError = parsed.searchParams.get("error_description")
      ?? fragment.get("error_description")
      ?? parsed.searchParams.get("error")
      ?? fragment.get("error");
    if (urlError) return urlError;

    const code = parsed.searchParams.get("code") ?? fragment.get("code");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return error.message;
      return data.session ? null : "Google sign-in returned no session. Please try again.";
    }

    const accessToken = parsed.searchParams.get("access_token") ?? fragment.get("access_token");
    const refreshToken = parsed.searchParams.get("refresh_token") ?? fragment.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      return error?.message ?? null;
    }

    return "The sign-in callback did not include credentials. Check the Supabase redirect URL configuration.";
  })();

  pendingUrls.set(url, operation);
  return operation.then((error) => {
    if (!error) completedUrls.add(url);
    return error;
  }).catch((error: unknown) => error instanceof Error ? error.message : "Could not complete sign-in.")
    .finally(() => pendingUrls.delete(url));
}
