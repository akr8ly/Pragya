import { supabase } from "./supabase";

const adjectives = ["Quiet", "Kind", "Curious", "Gentle", "Bright", "Steady", "Open", "Soft"];
const nouns = ["Cedar", "River", "Lantern", "Meadow", "Comet", "Harbor", "Mango", "Cloud"];
const fallbackAlias = "Quiet Cedar";

function isValidAlias(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 24 && /^[\p{L}\p{N} _-]+$/u.test(value.trim());
}

export function createPragyaAlias(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] ?? adjectives[0];
  const noun = nouns[Math.floor(Math.random() * nouns.length)] ?? nouns[0];
  return `${adjective} ${noun}`;
}

export async function getOrCreatePragyaAlias(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return fallbackAlias;

  const saved = data.user.user_metadata?.pragya_alias;
  if (typeof saved === "string" && isValidAlias(saved)) return saved.trim();

  const alias = createPragyaAlias();
  const { error: updateError } = await supabase.auth.updateUser({ data: { pragya_alias: alias } });
  return updateError ? fallbackAlias : alias;
}

export async function savePragyaAlias(value: string): Promise<string> {
  const alias = value.trim();
  if (!isValidAlias(alias)) throw new Error("Use 2–24 letters, numbers, spaces, or hyphens.");
  const { data, error } = await supabase.auth.updateUser({ data: { pragya_alias: alias } });
  if (error || !data.user) throw new Error("Could not save your name right now. Please try again.");
  return alias;
}

export function getAliasInitials(alias: string): string {
  return alias.split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase() ?? "").join("") || "P";
}
