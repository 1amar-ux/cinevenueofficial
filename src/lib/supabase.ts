import { createClient, SupabaseClient } from "@supabase/supabase-js";

const envMeta = (import.meta as any).env || {};

const supabaseUrl =
  envMeta.VITE_SUPABASE_URL ||
  envMeta.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cinevenue-supabase.supabase.co";

const supabaseAnonKey =
  envMeta.VITE_SUPABASE_ANON_KEY ||
  envMeta.VITE_SUPABASE_PUBLISHABLE_KEY ||
  envMeta.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  envMeta.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

export const isSupabaseConfigured = Boolean(
  (envMeta.VITE_SUPABASE_URL || envMeta.NEXT_PUBLIC_SUPABASE_URL) &&
  (envMeta.VITE_SUPABASE_ANON_KEY ||
   envMeta.VITE_SUPABASE_PUBLISHABLE_KEY ||
   envMeta.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
   envMeta.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
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

