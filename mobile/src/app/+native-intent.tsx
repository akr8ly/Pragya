/** Redirect external Spotify OAuth callbacks into the existing Playlists tab. */
export function redirectSystemPath({ path }: { path: string }) {
  if (path.includes("auth/spotify/callback")) {
    const queryIndex = path.indexOf("?");
    return `/playlists${queryIndex >= 0 ? path.slice(queryIndex) : ""}`;
  }
  return path;
}
