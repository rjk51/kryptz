import { supabase } from './supabaseClient';

// Decrement training tokens for a user
export async function useTrainingToken(wallet) {
  // Fetch user
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet', wallet)
    .single();

  if (error || !user) throw new Error('User not found');
  if (user.tokens <= 0) throw new Error('No training tokens left');

  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ tokens: user.tokens - 1 })
    .eq('wallet', wallet)
    .select()
    .single();
  if (updateError) throw updateError;
  return updatedUser;
}

function isNewDay(lastclaimed) {
  if (!lastclaimed) return true;
  const last = new Date(lastclaimed);
  const now = new Date();
  return last.getUTCFullYear() !== now.getUTCFullYear() ||
    last.getUTCMonth() !== now.getUTCMonth() ||
    last.getUTCDate() !== now.getUTCDate();
}

export async function getOrCreateUser(wallet) {
  // Try to fetch user
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet', wallet)
    .single();

  if (user) {
    // Check if we need to increment tokens for a new day
    if (isNewDay(user.lastclaimed)) {
      const newTokens = (user.tokens || 0) + 3;
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ tokens: newTokens, lastclaimed: new Date().toISOString() })
        .eq('wallet', wallet)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedUser;
    }
    return user;
  }

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  // If not found, create
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ wallet, tokens: 3, lastclaimed: new Date().toISOString(), xp: 0, evolve_tokens: 0 }])
    .select()
    .single();

  if (insertError) throw insertError;
  return newUser;
}

// Add XP to a user
export async function addXp(wallet, addXp) {
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet', wallet)
    .single();

  if (error || !user) throw new Error('User not found');

  const newXp = (user.xp ?? 0) + addXp;
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ xp: newXp })
    .eq('wallet', wallet)
    .select()
    .single();
  if (updateError) throw updateError;
  return updatedUser;
}

export async function getUserProgress(wallet) {
  const { data, error } = await supabase
    .from("users")
    .select("battlesWon, creaturesTrained, creaturesCollected, marketplaceVisited")
    .eq("wallet", wallet)
    .single();
  if (error) throw error;
  return data;
}

export async function addXpAndTokens(wallet, xpToAdd, tokensToAdd) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('xp, tokens')
    .eq('wallet', wallet)
    .single();

  if (fetchError) throw fetchError;

  const newXp = (user.xp || 0) + xpToAdd;
  const newTokens = (user.tokens || 0) + tokensToAdd;

  const { data, error } = await supabase
    .from('users')
    .update({ xp: newXp, tokens: newTokens })
    .eq('wallet', wallet);

  if (error) throw error;
  return data;
}

// Evolve token helpers
export async function getEvolveTokens(wallet) {
  const { data, error } = await supabase
    .from('users')
    .select('evolve_tokens')
    .eq('wallet', wallet)
    .single();
  if (error) throw error;
  return data?.evolve_tokens || 0;
}

export async function grantEvolveTokens(wallet, amount) {
  if (!wallet || amount <= 0) throw new Error('Invalid wallet or amount');
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('evolve_tokens')
    .eq('wallet', wallet)
    .single();
  if (fetchError) throw fetchError;
  const newCount = (user?.evolve_tokens || 0) + amount;
  const { data, error } = await supabase
    .from('users')
    .update({ evolve_tokens: newCount })
    .eq('wallet', wallet)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function useEvolveToken(wallet) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('evolve_tokens')
    .eq('wallet', wallet)
    .single();
  if (fetchError || !user) throw new Error('User not found');
  if ((user.evolve_tokens || 0) <= 0) throw new Error('No evolve tokens');
  const { data, error } = await supabase
    .from('users')
    .update({ evolve_tokens: user.evolve_tokens - 1 })
    .eq('wallet', wallet)
    .select()
    .single();
  if (error) throw error;
  return data;
}