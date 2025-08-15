import { supabase } from '@/lib/supabase/supabaseClient';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    // Delete listing from Supabase
    const { data, error } = await supabase
      .from('marketplace')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to remove listing' }), { status: 500 });
    }

    return new Response(JSON.stringify({ removed: data }), { status: 200 });
  } catch (err) {
    console.error('Remove route error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
