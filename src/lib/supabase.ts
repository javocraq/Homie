import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'homie-cms-auth',
      },
    })
  : null;

if (!hasSupabase && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — falling back to mock data.',
  );
}
