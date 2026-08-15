import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Separate from the customer key so an admin session never clobbers a guest login. */
const STAFF_AUTH_STORAGE_KEY = "shoredrop-staff-auth-web";

export const STAFF_ALLOWED_EMAIL = "staff@gmail.com";

export function isAllowedStaffEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === STAFF_ALLOWED_EMAIL.toLowerCase();
}

let staffClient: SupabaseClient | null = null;

export const getStaffSupabase = (): SupabaseClient | null => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (typeof window === "undefined") return null;
  if (!staffClient) {
    staffClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        storageKey: STAFF_AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return staffClient;
};
