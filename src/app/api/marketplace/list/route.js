import { supabase } from '@/lib/supabase/supabaseClient';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet, tokenId, price } = body || {};
    if (!wallet || !tokenId || !price) {
      return new Response(JSON.stringify({ error: 'Missing wallet, tokenId or price' }), { status: 400 });
    }

    // Validate price as number
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid price' }), { status: 400 });
    }

    // Insert listing record
    const { data, error } = await supabase
      .from('marketplace')
      .insert([{ seller: wallet, token_id: tokenId.toString(), price: priceNum, currency: 'CORE', created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Try local-file fallback so listing still works in dev when DB isn't available.
      try {
        const fallbackDir = path.resolve(process.cwd(), 'data');
        await fs.mkdir(fallbackDir, { recursive: true });
        const filePath = path.join(fallbackDir, 'marketplace.local.json');
        let list = [];
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          list = JSON.parse(raw || '[]');
        } catch (e) {
          list = [];
        }
        const localListing = { id: (`local-${Date.now()}`), seller: wallet, token_id: tokenId.toString(), price: priceNum, currency: 'CORE', created_at: new Date().toISOString(), source: 'local-fallback' };
        list.push(localListing);
        await fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8');
        const payload = { listing: localListing, warning: 'Supabase insert failed; saved to local file.' };
        if (process.env.NODE_ENV === 'development') payload.supabaseError = error;
        return new Response(JSON.stringify(payload), { status: 200 });
      } catch (fsErr) {
        console.error('Local fallback write failed:', fsErr);
        const payload = process.env.NODE_ENV === 'development' ? { error: error, fallbackError: String(fsErr) } : { error: error.message || 'DB error' };
        return new Response(JSON.stringify(payload), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ listing: data }), { status: 200 });
  } catch (err) {
    console.error('List route error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
