import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    _client = createClient(url, key);
  }
  return _client;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url) throw new Error("Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL");
    const key = svcKey ?? anonKey;
    if (!key) throw new Error("Missing Supabase env var: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    _admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return _admin;
}

// Convenience aliases — resolved lazily
export const supabase      = new Proxy({} as SupabaseClient, { get: (_, p) => (getSupabase() as unknown as Record<string, unknown>)[p as string] });
export const supabaseAdmin = new Proxy({} as SupabaseClient, { get: (_, p) => (getSupabaseAdmin() as unknown as Record<string, unknown>)[p as string] });
