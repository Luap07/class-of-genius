import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iulnmfxoshfolxnhmbhb.supabase.co';
// Ensure this key is your public 'anon' key from your Supabase Dashboard Settings > API
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; 

export const supabase = createClient(supabaseUrl, supabaseKey);