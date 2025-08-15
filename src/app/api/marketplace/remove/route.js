import { supabase } from '@/lib/supabase/supabaseClient';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    // Try Supabase delete first
    try {
      const { data, error } = await supabase
        .from('marketplace')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return new Response(JSON.stringify({ removed: data }), { status: 200 });
      }
      console.error('Supabase delete error (will try local fallback):', error);
    } catch (e) {
      console.error('Supabase delete thrown error (will try local fallback):', e);
    }

    // Local file fallback: remove by id
    const filePath = path.join(process.cwd(), 'data', 'marketplace.local.json');
    let list = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      list = JSON.parse(raw || '[]');
    } catch (e) {
      list = [];
    }
    const initialLen = list.length;
    const filtered = list.filter(l => String(l.id) !== String(id));
    if (filtered.length === initialLen) {
      return new Response(JSON.stringify({ error: 'Listing not found' }), { status: 404 });
    }
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    return new Response(JSON.stringify({ removed: id, source: 'local-fallback' }), { status: 200 });
  } catch (err) {
    console.error('remove route error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
