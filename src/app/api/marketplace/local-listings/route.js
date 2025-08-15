import fs from 'fs/promises';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const filePath = path.join(process.cwd(), 'data', 'marketplace.local.json');
    let list = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      list = JSON.parse(raw || '[]');
    } catch (e) {
      // file missing or empty -> return empty list
      list = [];
    }
    if (wallet) {
      const filtered = list.filter(l => String(l.seller).toLowerCase() === String(wallet).toLowerCase());
      return new Response(JSON.stringify({ listings: filtered }), { status: 200 });
    }
    return new Response(JSON.stringify({ listings: list }), { status: 200 });
  } catch (err) {
    console.error('local-listings error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
