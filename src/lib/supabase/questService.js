import { supabase } from './supabaseClient';

// Mark quest as completed for a user
export async function completeQuest(wallet, questId, type) {
  // Upsert quest completion record
  const { data, error } = await supabase
    .from('quest_completions')
    .upsert([{ wallet, questId, type, completedAt: new Date().toISOString() }]);
  if (error) throw error;
  return data;
}

// Get completed quests for a user
export async function getCompletedQuests(wallet) {
  const { data, error } = await supabase
    .from('quest_completions')
    .select('questId,type')
    .eq('wallet', wallet);
  if (error) throw error;
  // Group by type
  const completed = { daily: [], weekly: [] };
  for (const q of data || []) {
    if (q.type === 'daily') completed.daily.push(q.questId);
    if (q.type === 'weekly') completed.weekly.push(q.questId);
  }
  return completed;
}