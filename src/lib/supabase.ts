import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: { persistSession: true },
  global: { headers: { 'x-application-name': 'vocabulary-app' } },
});

export interface Student {
  id: string;
  code: string;
  name: string;
  class: string;
  created_at: string;
}

export interface Word {
  id: string;
  class: string;
  english: string;
  turkish: string;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  word_id: string;
  box_number: number;
  last_studied_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WordWithProgress extends Word {
  progress?: StudentProgress;
}
