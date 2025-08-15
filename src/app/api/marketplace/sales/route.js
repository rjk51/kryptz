import fs from 'fs/promises';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const filePath = path.join(process.cwd(), 'data', 'marketplace.sales.json');
    let sales = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      sales = JSON.parse(raw || '[]');
    } catch (e) {
      sales = [];
    }
    if (wallet) {
      const filtered = sales.filter(s => String(s.buyer).toLowerCase() === String(wallet).toLowerCase());
      return new Response(JSON.stringify({ sales: filtered }), { status: 200 });
    }
    return new Response(JSON.stringify({ sales }), { status: 200 });
  } catch (err) {
    console.error('sales route error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
