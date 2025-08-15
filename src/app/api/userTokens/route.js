import { JsonRpcProvider, Contract } from 'ethers';
import fs from 'fs/promises';
import path from 'path';

const contractABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    if (!wallet) return new Response(JSON.stringify({ error: 'Missing wallet' }), { status: 400 });

    const rpcUrl = process.env.CORE_RPC_URL || process.env.NEXT_PUBLIC_CORE_RPC_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!rpcUrl || !contractAddress) {
      return new Response(JSON.stringify({ error: 'Missing RPC or contract address' }), { status: 500 });
    }

    const provider = new JsonRpcProvider(rpcUrl, {
      chainId: 1114,
      name: "Core Testnet",
      ensAddress: null // Disable ENS resolution
    });
    const contract = new Contract(contractAddress, contractABI, provider);

    const balance = await contract.balanceOf(wallet);
    const balanceNum = Number(balance.toString ? balance.toString() : balance);
    console.log('[userTokens] balance for', wallet, '=>', balanceNum);
    const tokens = [];
    for (let i = 0; i < balanceNum; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(wallet, i);
        let tokenURI = await contract.tokenURI(tokenId);
        if (tokenURI && tokenURI.startsWith('ipfs://')) tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        let meta = {};
        if (tokenURI) {
          try {
            const r = await fetch(tokenURI);
            if (r.ok) meta = await r.json();
          } catch (e) {}
        }
        let img = meta.image || meta.image_url || null;
        if (img && typeof img === 'string' && img.startsWith('ipfs://')) img = img.replace('ipfs://', 'https://ipfs.io/ipfs/');
        tokens.push({ id: tokenId.toString ? tokenId.toString() : String(tokenId), name: meta.name || null, image: img });
      } catch (err) {
        console.error('[userTokens] failed to fetch token at index', i, err);
        // include a placeholder item showing error (only in development)
        if (process.env.NODE_ENV === 'development') {
          tokens.push({ id: `error-${i}`, name: `error: ${err?.message || String(err)}` });
        }
        continue;
      }
    }

    // Also include any purchases recorded in local sales log (local-fallback)
    try {
      const salesPath = path.join(process.cwd(), 'data', 'marketplace.sales.json');
      let sales = [];
      try {
        const raw = await fs.readFile(salesPath, 'utf8');
        sales = JSON.parse(raw || '[]');
      } catch (e) { sales = []; }
      const purchased = sales.filter(s => String(s.buyer).toLowerCase() === String(wallet).toLowerCase()).map(s => ({ id: String(s.token_id), name: s.name || null, image: null }));
      // merge: prefer on-chain tokens already collected
      const existingIds = new Set(tokens.map(t => String(t.id)));
      for (const p of purchased) {
        if (!existingIds.has(String(p.id))) tokens.push(p);
      }
    } catch (e) {
      // ignore sales merge failures
    }

    return new Response(JSON.stringify({ tokens }), { status: 200 });
  } catch (err) {
    console.error('[userTokens] error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
