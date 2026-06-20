import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvtdqslleeotszdkdspx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_M4TGwtedyavR6o5DlfGxsg_noDE1zlT';

// React Native has no localStorage — disable session persistence so the
// client doesn't crash on init trying to access it.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
