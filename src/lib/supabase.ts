import { createClient, SupabaseClient } from "@supabase/supabase-js";

const envMeta = (import.meta as any).env || {};

const supabaseUrl =
  envMeta.VITE_SUPABASE_URL ||
  envMeta.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mpeedjoyvimegnmymweb.supabase.co";

const supabaseAnonKey =
  envMeta.VITE_SUPABASE_ANON_KEY ||
  envMeta.VITE_SUPABASE_PUBLISHABLE_KEY ||
  envMeta.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  envMeta.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Lkzk8qb5WvAYiNGhPyCLOQ_2fibx46L";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes("cinevenue-supabase.supabase.co") &&
  supabaseAnonKey &&
  supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key" &&
  !supabaseAnonKey.includes("dummy")
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce"
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;

