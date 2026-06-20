import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] Missing Expo/Supabase environment variables. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env, then restart with `expo start -c`.',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '', {
  auth: { persistSession: false },
});
