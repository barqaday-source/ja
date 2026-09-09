import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** Mobile-safe client. Never place a service_role key in an Expo bundle. */
export const supabase: SupabaseClient<Database> | null = url && anonKey
  ? createClient<Database>(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

export const isSupabaseConfigured = Boolean(supabase);

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error("Supabase غير مهيأ. أضف EXPO_PUBLIC_SUPABASE_URL وEXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

export async function requireUser() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("يجب تسجيل الدخول أولاً.");
  return data.user;
}
