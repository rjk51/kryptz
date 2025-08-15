import { Contract, JsonRpcProvider } from 'ethers';

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const tokenId = searchParams.get('tokenId');
		if (!tokenId) return new Response(JSON.stringify({ error: 'Missing tokenId' }), { status: 400 });

		const rpc = process.env.CORE_RPC_URL;
		const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
		if (!rpc || !contractAddress) return new Response(JSON.stringify({ error: 'RPC or contract address not configured' }), { status: 500 });

		const provider = new JsonRpcProvider(rpc, {
			chainId: 1114,
			name: "Core Testnet",
			ensAddress: null // Disable ENS resolution
		});
		const abi = ["function tokenURI(uint256 tokenId) view returns (string)"];
		const contract = new Contract(contractAddress, abi, provider);

		let tokenURI = null;
		try {
			tokenURI = await contract.tokenURI(tokenId);
		} catch (err) {
			console.error('tokenURI call failed', err?.message || err);
			return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
		}

		if (typeof tokenURI === 'string' && tokenURI.startsWith('ipfs://')) tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
		let meta = {};
		if (tokenURI) {
			try {
				const r = await fetch(tokenURI);
				if (r.ok) meta = await r.json();
			} catch (e) {
				console.error('Failed to fetch token metadata', e?.message || e);
			}
		}

		return new Response(JSON.stringify({ tokenId, tokenURI, meta }), { status: 200 });
	} catch (err) {
		console.error('token-meta route error', err);
		return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
	}
}

