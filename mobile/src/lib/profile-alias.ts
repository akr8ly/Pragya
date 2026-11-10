import * as SecureStore from "expo-secure-store";
import { supabase } from "./supabase";

const adjectives = ["Quiet", "Kind", "Curious", "Gentle", "Bright", "Steady", "Open", "Soft"];
const nouns = ["Cedar", "River", "Lantern", "Meadow", "Comet", "Harbor", "Mango", "Cloud"];
const fallbackAlias = "Your space";
const aliasRequestByUser = new Map<string, Promise<string>>();

function aliasStorageKey(userId: string): string {
  return `pragya.alias.${userId}`;
}

function isValidAlias(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 24 && /^[\p{L}\p{N} _-]+$/u.test(value.trim());
}

export function createPragyaAlias(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] ?? adjectives[0];
  const noun = nouns[Math.floor(Math.random() * nouns.length)] ?? nouns[0];
  return `${adjective} ${noun}`;
}

/**
 * A generated persona must be stable even when an auth metadata write is
 * delayed or rejected. Deriving it from the authenticated user's id gives us
 * the same friendly alias on every device and every app restart.
 */
function aliasForUserId(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = ((hash << 5) - hash + userId.charCodeAt(index)) | 0;
  }
  const value = Math.abs(hash);
  const adjective = adjectives[value % adjectives.length] ?? adjectives[0];
  const noun = nouns[Math.floor(value / adjectives.length) % nouns.length] ?? nouns[0];
  return `${adjective} ${noun}`;
}

async function resolveAlias(userId: string, savedAlias: unknown): Promise<string> {
  if (typeof savedAlias === "string" && isValidAlias(savedAlias)) {
    const alias = savedAlias.trim();
    await SecureStore.setItemAsync(aliasStorageKey(userId), alias);
    return alias;
  }

  const storedAlias = await SecureStore.getItemAsync(aliasStorageKey(userId));
  if (storedAlias && isValidAlias(storedAlias)) return storedAlias.trim();

  const alias = aliasForUserId(userId);
  await SecureStore.setItemAsync(aliasStorageKey(userId), alias);
  // The local, user-scoped value is the source of continuity. Metadata is a
  // convenience for another device, and a transient network failure must not
  // cause the persona to change on the next launch.
  await supabase.auth.updateUser({ data: { pragya_alias: alias } }).catch(() => undefined);
  return alias;
}

export async function getOrCreatePragyaAlias(): Promise<string> {
  // getUser() validates against the network. On a phone this can temporarily
  // fail during startup even though SecureStore already has a valid session,
  // which used to expose the "Quiet Cedar" placeholder. Read the persisted
  // session first so the alias is stable offline as well.
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return fallbackAlias;

  const user = data.session.user;
  const userId = user.id;
  const inFlight = aliasRequestByUser.get(userId);
  if (inFlight) return inFlight;

  const request = resolveAlias(userId, user.user_metadata?.pragya_alias).finally(() => {
    aliasRequestByUser.delete(userId);
  });
  aliasRequestByUser.set(userId, request);
  return request;
}

export async function savePragyaAlias(value: string): Promise<string> {
  const alias = value.trim();
  if (!isValidAlias(alias)) throw new Error("Use 2–24 letters, numbers, spaces, or hyphens.");
  const { data, error } = await supabase.auth.updateUser({ data: { pragya_alias: alias } });
  if (error || !data.user) throw new Error("Could not save your name right now. Please try again.");
  await SecureStore.setItemAsync(aliasStorageKey(data.user.id), alias);
  return alias;
}

export function getAliasInitials(alias: string): string {
  return alias.split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase() ?? "").join("") || "P";
}
