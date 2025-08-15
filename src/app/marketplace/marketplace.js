import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from 'ethers';
import { useAccount } from "wagmi";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";

export function MarketplaceContent() {
    const { address, isConnected } = useAccount();
    const [listModalOpen, setListModalOpen] = useState(false);
    const [userTokens, setUserTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (address) {
        updateUserProgress(address, "marketplaceVisited", true);
      }
    }, [address]);

    // Fetch user's owned tokens. Prefer client-side on-chain discovery when wallet is connected,
    // then fall back to the server endpoint and local-file listings.
    async function loadUserTokens() {
      if (!address) return;

      // 1) Client-side on-chain lookup (most reliable when wallet is connected)
      if (isConnected && typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
          const contractABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
            "function tokenURI(uint256 tokenId) view returns (string)",
          ];
          const contract = new Contract(contractAddress, contractABI, provider);
          const bal = await contract.balanceOf(address);
          const balNum = Number(bal?.toString ? bal.toString() : bal || 0);
          const onchain = [];
          for (let i = 0; i < balNum; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, i);
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
              onchain.push({ id: tokenId.toString ? tokenId.toString() : String(tokenId), name: meta.name || null, image: img });
            } catch (err) {
              // skip problematic tokens but continue
            }
          }
          if (onchain.length > 0) {
            setUserTokens(onchain);
            return;
          }
        } catch (e) {
          // Ignore and continue to server/local fallbacks
        }
      }

      // 2) Server-side token discovery
      if (!isConnected) {
        // If wallet isn't connected, server-side discovery still works if a wallet query param is provided
      }
      try {
        const res = await fetch(`/api/userTokens?wallet=${address}`);
        if (!res.ok) {
          setUserTokens([]);
          return;
        }
        const data = await res.json();
        const tokens = Array.isArray(data.tokens) ? data.tokens : [];
        if (tokens.length > 0) {
          // ensure any token image ipfs normalization
          const normalized = tokens.map(t => {
            let img = t.image || t.meta?.image || null;
            if (img && typeof img === 'string' && img.startsWith('ipfs://')) img = img.replace('ipfs://', 'https://ipfs.io/ipfs/');
            return { ...t, image: img };
          });
          setUserTokens(normalized);
          return;
        }

        // 3) local fallback listings
        try {
          const res2 = await fetch(`/api/marketplace/local-listings?wallet=${address}`);
          if (res2.ok) {
            const d2 = await res2.json();
            const localTokens = (d2.listings || []).map(l => ({ id: l.token_id, name: l.name || null }));
            if (localTokens.length > 0) {
              setUserTokens(localTokens);
              return;
            }
          }
        } catch (e) {
          // ignore
        }

        setUserTokens(tokens);
      } catch (err) {
        setUserTokens([]);
      }
    }

    useEffect(() => { loadUserTokens(); }, [address, isConnected]);

    const [myListings, setMyListings] = useState([]);

    async function loadMyListings() {
      if (!address) return;
      try {
        const res = await fetch(`/api/marketplace/local-listings?wallet=${address}`);
        if (!res.ok) {
          setMyListings([]);
          return;
        }
        const d = await res.json();
        const raw = Array.isArray(d.listings) ? d.listings : [];

        // Enrich listings with token metadata (image) via token-meta endpoint
        async function enrich(listings) {
          return await Promise.all(listings.map(async (l) => {
            try {
              const r = await fetch(`/api/marketplace/token-meta?tokenId=${encodeURIComponent(l.token_id)}`);
              if (!r.ok) return { ...l };
              const body = await r.json();
              const meta = body?.meta || {};
              let img = meta.image || meta.image_url || null;
              if (img && typeof img === 'string' && img.startsWith('ipfs://')) img = img.replace('ipfs://', 'https://ipfs.io/ipfs/');
              return { ...l, image: img };
            } catch (e) {
              return { ...l };
            }
          }));
        }

        const enriched = await enrich(raw);
        setMyListings(enriched);
      } catch (e) {
        setMyListings([]);
      }
    }

    useEffect(() => { loadMyListings(); }, [address]);

    const marketItems = [
      {
        id: 1,
        name: "LIGHTNING BEAST",
        price: "2.5 CORE",
        rarity: "RARE",
        emoji: "⚡",
      },
      {
        id: 2,
        name: "SHADOW CAT",
        price: "1.8 CORE",
        rarity: "UNCOMMON",
        emoji: "🐱",
      },
      {
        id: 3,
        name: "CRYSTAL BIRD",
        price: "5.0 CORE",
        rarity: "EPIC",
        emoji: "🦅",
      },
    ];
  
    return (
      <div className="space-y-8">
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">MARKETPLACE</p>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-success">
              Buy and sell creatures with other trainers
            </p>
            <button className="nes-btn is-primary" onClick={async () => { await loadUserTokens(); setListModalOpen(true); }}>LIST CREATURE</button>
          </div>
        </div>

        {/* List modal */}
        {listModalOpen && (
          <div className="nes-container is-dark">
            <h4 className="text-warning">List your creature for sale</h4>
            <div className="space-y-2">
              <label className="text-xs">Select token</label>
              {userTokens.length > 0 ? (
                <select className="nes-select" value={selectedToken} onChange={e => setSelectedToken(e.target.value)}>
                  <option value="">-- choose token --</option>
                  {userTokens.map(t => (
                      <option key={t.id} value={t.id}>{t.name ? t.name : `Creature #${t.id}`}</option>
                    ))}
                </select>
              ) : (
                <div>
                  <input className="nes-input" placeholder="Enter token id (e.g. 22)" value={selectedToken} onChange={e => setSelectedToken(e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">No owned tokens found via server—enter a token id to list via local fallback.</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs">Price (CORE)</label>
                <button className="nes-btn is-small" onClick={async () => { await loadUserTokens(); alert('Refreshed tokens'); }}>Refresh tokens</button>
              </div>
              {/* Selected token preview */}
              {selectedToken && (() => {
                const tok = userTokens.find(x => String(x.id) === String(selectedToken));
                if (!tok) return null;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 border-2 border-black overflow-hidden">
                      {tok.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tok.image} alt={tok.name || `Creature #${tok.id}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">🦴</div>
                      )}
                    </div>
                    <div className="text-xs">{tok.name || `Creature #${tok.id}`}</div>
                  </div>
                );
              })()}
              <label className="text-xs">Price (CORE)</label>
              <input className="nes-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1.5" />
              <div className="flex gap-2">
                <button className="nes-btn is-success" onClick={async () => {
                  if (!selectedToken || !price) return alert('Select a token and set a price');
                  setLoading(true);
                  const endpoint = (typeof window !== 'undefined' && window.location && window.location.origin) ? `${window.location.origin}/api/marketplace/list` : '/api/marketplace/list';
                  async function doPost() {
                    try {
                      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, tokenId: selectedToken, price }) });
                      const text = await res.text();
                      let data;
                      try { data = JSON.parse(text); } catch { data = text; }
                      if (!res.ok) {
                        const errObj = data?.error ?? data;
                        const message = typeof errObj === 'object' ? JSON.stringify(errObj, null, 2) : String(errObj);
                        console.error('Listing failed response:', data);
                        alert('Listing failed: ' + message);
                        return { ok: false };
                      }
                      return { ok: true, data };
                    } catch (err) {
                      console.error('Listing call failed (network):', err);
                      return { ok: false, networkError: err };
                    }
                  }

                  // try once, then retry a single time on network error
                  let result = await doPost();
                  if (!result.ok && result.networkError) {
                    // brief retry
                    result = await doPost();
                  }

                  if (!result.ok) {
                    const err = result.networkError;
                    const msg = err ? `${err.name}: ${err.message}` : 'Unknown error';
                    alert('Listing failed: ' + msg + '\nSee console for details.');
                    setLoading(false);
                    return;
                  }

                  alert('Listed successfully');
                  setListModalOpen(false);
                  setLoading(false);
                }}>{loading ? 'Listing...' : 'LIST'}</button>
                <button className="nes-btn" onClick={() => setListModalOpen(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}
  
        {/* My Listings section */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-warning">My Listings</h4>
          <div>
            <button className="nes-btn is-primary" onClick={loadMyListings}>Refresh listings</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {myListings.length === 0 ? (
            <div className="nes-container is-dark">No listings found.</div>
          ) : myListings.map(l => (
            <div key={l.id} className="nes-container is-dark">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black mb-4 flex items-center justify-center overflow-hidden">
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt={l.name || `Creature #${l.token_id}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🦴</span>
                  )}
                </div>
                <h3 className="text-xs mb-2 text-warning">{l.name ? l.name : `Creature #${l.token_id}`}</h3>
                <div className="text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>PRICE:</span>
                    <span className="text-green-400">{l.price} {l.currency || 'CORE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SELLER:</span>
                    <span className="text-purple-400">{String(l.seller).slice(0,6)}...{String(l.seller).slice(-4)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="nes-btn is-disabled w-full text-xs">LISTED</button>
                  <button className="nes-btn is-error w-full text-xs" onClick={async () => {
                    if (!confirm('Remove this listing?')) return;
                    try {
                      const res = await fetch('/api/marketplace/remove', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id }) });
                      const txt = await res.text();
                      let data;
                      try { data = JSON.parse(txt); } catch { data = txt; }
                      if (!res.ok) {
                        alert('Remove failed: ' + (data?.error || String(data)));
                        return;
                      }
                      alert('Removed listing');
                      await loadMyListings();
                    } catch (e) {
                      console.error('Remove failed', e);
                      alert('Remove failed: ' + (e?.message || String(e)));
                    }
                  }}>REMOVE</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketItems.map((item) => (
            <div key={item.id} className="nes-container is-dark">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black mb-4 flex items-center justify-center">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <h3 className="text-xs mb-2 text-warning">{item.name}</h3>
                <div className="text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>PRICE:</span>
                    <span className="text-green-400">{item.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RARITY:</span>
                    <span className="text-purple-400">{item.rarity}</span>
                  </div>
                </div>
                <button className="nes-btn is-success w-full text-xs">
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }