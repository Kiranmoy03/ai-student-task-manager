import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ojrkktrfjbigmgkserfl.supabase.co';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uaU8bnMv_gm5ZEwlD1YK7w_LP3euLxm';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storageKey: 'student-task-manager-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
