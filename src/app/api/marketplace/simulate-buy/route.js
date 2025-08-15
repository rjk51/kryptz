import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token_id, price, currency, seller, buyer, name } = body || {};
    if (!token_id || !buyer) return new Response(JSON.stringify({ error: 'Missing token_id or buyer' }), { status: 400 });

    const salesPath = path.join(process.cwd(), 'data', 'marketplace.sales.json');
    let sales = [];
    try {
      const r = await fs.readFile(salesPath, 'utf8');
      sales = JSON.parse(r || '[]');
    } catch (e) { sales = []; }

    const sale = { id: `sale-${Date.now()}`, listingId: `platform-${token_id}`, token_id: token_id, seller: seller || 'platform', buyer, price: price || 0, currency: currency || 'CORE', name: name || null, created_at: new Date().toISOString() };
    sales.push(sale);
    await fs.writeFile(salesPath, JSON.stringify(sales, null, 2), 'utf8');

    return new Response(JSON.stringify({ sale }), { status: 200 });
  } catch (err) {
    console.error('simulate-buy error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
