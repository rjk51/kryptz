import { supabase } from './supabaseClient';

export async function updateUserProgress(wallet, field, value) {
  // If value is undefined, increment the field
  if (value === undefined) {
    // Ensure user exists
    let { data: user, error } = await supabase
      .from('users')
      .select(field)
      .eq('wallet', wallet)
      .single();
    if (error || !user) {
      // Attempt to create user record automatically
      const { data: created, error: createError } = await supabase
        .from('users')
        .insert([{ wallet, tokens: 3, lastclaimed: new Date().toISOString(), xp: 0, creaturesEvolved: 0, evolve_tokens: 0 }])
        .select()
        .single();
      if (createError) throw new Error('User not found');
      user = created;
    }
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
