import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iulnmfxoshfolxnhmbhb.supabase.co';
const supabaseKey = 'sb_publishable_WTy_z8mgyPgmth1RbgFwQw_Tj3RIvzL'; 

export const supabase = createClient(supabaseUrl, supabaseKey);