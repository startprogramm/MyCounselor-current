import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase env vars missing');
  }
  return createClient<Database>(url, serviceKey);
}
