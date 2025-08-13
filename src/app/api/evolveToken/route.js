import { getOrCreateUser, getEvolveTokens, grantEvolveTokens, useEvolveToken } from '@/lib/supabase/userService';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  if (!wallet) return new Response(JSON.stringify({ error: 'Missing wallet' }), { status: 400 });
  try {
    await getOrCreateUser(wallet);
    const count = await getEvolveTokens(wallet);
    return new Response(JSON.stringify({ evolveTokens: count }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet, action, amount } = body || {};
    if (!wallet || !action) {
      return new Response(JSON.stringify({ error: 'Missing wallet or action' }), { status: 400 });
    }
    // Ensure user exists
    await getOrCreateUser(wallet);
    if (action === 'grant') {
      const updated = await grantEvolveTokens(wallet, Number(amount || 0));
      return new Response(JSON.stringify({ evolveTokens: updated.evolve_tokens }), { status: 200 });
    }
    if (action === 'use') {
      const updated = await useEvolveToken(wallet);
      return new Response(JSON.stringify({ evolveTokens: updated.evolve_tokens }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}


