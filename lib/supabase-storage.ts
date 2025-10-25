import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Simple wrappers - ÇALIŞAN storage API'sini taklit eder
export async function savePrediction(key: string, data: any): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .upsert({ id: key, data: JSON.stringify(data), updated_at: new Date().toISOString() });
  
  if (error) console.error('Save prediction error:', error);
}

export async function getPrediction(key: string): Promise<any> {
  const { data, error } = await supabase
    .from('predictions')
    .select('data')
    .eq('id', key)
    .single();
  
  if (error) return null;
  return data?.data ? JSON.parse(data.data) : null;
}

export async function saveUserStats(key: string, data: any): Promise<void> {
  const { error } = await supabase
    .from('user_stats')
    .upsert({ id: key, data: JSON.stringify(data), updated_at: new Date().toISOString() });
  
  if (error) console.error('Save user stats error:', error);
}

export async function getUserStats(key: string): Promise<any> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('data')
    .eq('id', key)
    .single();
  
  if (error) return null;
  return data?.data ? JSON.parse(data.data) : null;
}

export async function getLeaderboard(): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('data')
    .order('updated_at', { ascending: false })
    .limit(100);
  
  if (error) return [];
  return (data || []).map(row => JSON.parse(row.data));
}
