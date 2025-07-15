import { supabase } from './supabaseClient';

export async function updateUserProgress(wallet, field, value) {
  // If value is undefined, increment the field
  if (value === undefined) {
    const { data: user, error } = await supabase
      .from('users')
      .select(field)
      .eq('wallet', wallet)
      .single();
    if (error || !user) throw new Error('User not found');
    const newValue = (user[field] ?? 0) + 1;
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ [field]: newValue })
      .eq('wallet', wallet)
      .select()
      .single();
    if (updateError) throw updateError;
    return updatedUser;
  } else {
    // For boolean fields (e.g., marketplaceVisited)
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('wallet', wallet)
      .select()
      .single();
    if (updateError) throw updateError;
    return updatedUser;
  }
}
