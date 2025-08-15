import { supabase } from '@/lib/supabase/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet, tokenId, price } = body || {};
    if (!wallet || !tokenId || !price) {
      return new Response(JSON.stringify({ error: 'Missing wallet, tokenId or price' }), { status: 400 });
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid price' }), { status: 400 });
    }

    const { data: existingListing, error: checkError } = await supabase
      .from('marketplace')
      .select('id')
      .eq('token_id', tokenId.toString())
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase check error:', checkError);
      return new Response(JSON.stringify({ error: 'Failed to check existing listings' }), { status: 500 });
    }

    if (existingListing) {
      return new Response(JSON.stringify({ error: 'Token is already listed for sale' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketplace')
      .insert([{ 
        seller: wallet, 
        token_id: tokenId.toString(), 
        price: priceNum, 
        currency: 'CORE', 
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create listing. Please try again.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ listing: data, operator: process.env.NEXT_PUBLIC_MARKET_OPERATOR || null }), { status: 200 });
  } catch (err) {
    console.error('List route error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
