import { supabase } from '@/lib/supabase/supabaseClient';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    
    let query = supabase
      .from('marketplace')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (wallet) {
      query = query.eq('seller', wallet);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch listings' }), { status: 500 });
    }

    return new Response(JSON.stringify({ listings: listings || [] }), { status: 200 });
  } catch (err) {
    console.error('Listings fetch error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
