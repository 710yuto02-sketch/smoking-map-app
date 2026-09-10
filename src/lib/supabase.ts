import { createClient } from '@supabase/supabase-js';

// 初心者向け解説:
// .env ファイルに記載したキーを読み込みます。
// もしキーがまだ設定されていない場合でも、安全にデモ動作するように設計しています。

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
