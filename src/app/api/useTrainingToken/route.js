import { useTrainingToken } from '@/lib/supabase/userService';

export async function POST(req) {
  const { wallet } = await req.json();
  if (!wallet) {
    return new Response(JSON.stringify({ error: 'Missing wallet' }), { status: 400 });
  }
  try {
    const user = await useTrainingToken(wallet);
    return new Response(JSON.stringify({ tokens: user.tokens }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
