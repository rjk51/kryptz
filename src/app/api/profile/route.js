import { getOrCreateUser, addXp } from '@/lib/supabase/userService';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  if (!wallet) {
    return new Response(JSON.stringify({ error: 'Missing wallet' }), { status: 400 });
  }
  try {
    const user = await getOrCreateUser(wallet);
    return new Response(JSON.stringify({ tokens: user.tokens, xp: user.xp }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet, addXp: xpToAdd } = body;
    if (!wallet || typeof xpToAdd !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing wallet or addXp' }), { status: 400 });
    }
    const user = await addXp(wallet, xpToAdd);
    return new Response(JSON.stringify({ xp: user.xp }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
