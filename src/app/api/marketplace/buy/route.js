import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, buyer } = body || {};
    if (!id || !buyer) return new Response(JSON.stringify({ error: 'Missing id or buyer' }), { status: 400 });

    const filePath = path.join(process.cwd(), 'data', 'marketplace.local.json');
    let list = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      list = JSON.parse(raw || '[]');
    } catch (e) {
      list = [];
    }
    const idx = list.findIndex(l => String(l.id) === String(id));
    if (idx === -1) return new Response(JSON.stringify({ error: 'Listing not found' }), { status: 404 });

    const listing = list.splice(idx, 1)[0];
    // write back remaining listings
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8');

    // append sale to sales log
    const salesPath = path.join(process.cwd(), 'data', 'marketplace.sales.json');
    let sales = [];
    try {
      const r = await fs.readFile(salesPath, 'utf8');
      sales = JSON.parse(r || '[]');
    } catch (e) {
      sales = [];
    }
    const sale = { id: `sale-${Date.now()}`, listingId: listing.id, token_id: listing.token_id, seller: listing.seller, buyer, price: listing.price, currency: listing.currency || 'CORE', created_at: new Date().toISOString() };
    sales.push(sale);
    await fs.writeFile(salesPath, JSON.stringify(sales, null, 2), 'utf8');

    return new Response(JSON.stringify({ sale, removed: listing }), { status: 200 });
  } catch (err) {
    console.error('buy route error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
