import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kraomhjnnwebfvscwrpe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYW9taGpubndlYmZ2c2N3cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5Mjg4NjUsImV4cCI6MjEwODUwNDg2NX0.meY9Osa3fq7IgD434CujB-nmM5Y-QTOrG0CB0w2DQw8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
