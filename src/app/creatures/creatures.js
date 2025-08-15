import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider, Contract } from "ethers";
import { creaturesData } from "../../../creaturesData.js";
import { uploadToPinata } from "@/lib/ipfs";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";

export function CreaturesContent({ onProgressUpdate }) {
    const { isConnected, address } = useAccount();
    const [userCreatures, setUserCreatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [minting, setMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState("");
  const [evolving, setEvolving] = useState(false);
  const [evolveStatus, setEvolveStatus] = useState("");
  const [noEvolveTokenModal, setNoEvolveTokenModal] = useState(false);
    const [showTraits, setShowTraits] = useState(false);
    const [trainModal, setTrainModal] = useState({ open: false, tokenId: null, traits: { Power: 0, Speed: 0, Defense: 0, Intelligence: 0 } });
    const [noTokenModal, setNoTokenModal] = useState(false);
    const [training, setTraining] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [userTokens, setUserTokens] = useState(0);
    const [xpGained, setXpGained] = useState(0);
    const [showXpPopup, setShowXpPopup] = useState(false);

    // Fetch user tokens from supabase
    async function fetchUserTokens() {
      if (!address) return;
      try {
        const res = await fetch(`/api/profile?wallet=${address}`);
        const data = await res.json();
        setUserTokens(data.tokens || 0);
        // attach evolve tokens to creatures display enablement by refetching later
      } catch (err) {
        setUserTokens(0);
      }
    }
  
    // Contract details (update with your actual values)
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const contractABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function mintFirstCreature() public",
      "function mintCreature(address to, string uri, uint256 powerInit, uint256 speedInit, uint256 defenseInit, uint256 intelligenceInit)",
      "function getTraits(uint256 tokenId) view returns (uint256,uint256,uint256,uint256)",
      "function getLevel(uint256 tokenId) view returns (uint256)",
      "function getEvolutionStage(uint256 tokenId) view returns (uint8)",
      "function trainTrait(uint256 tokenId, string trait, uint256 amount)",
      "function addXP(uint256 tokenId, uint256 amount)",
      "function evolve(uint256 tokenId, string newUri)",
    ];
  
    async function fetchCreatures() {
      if (!isConnected || !address) return;
      setLoading(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          contractAddress,
          contractABI,
          provider
        );
        // Fetch evolve tokens once per load
        let evolveTokensGlobal = 0;
        try {
          const resTok = await fetch(`/api/evolveToken?wallet=${address}`);
          const dataTok = await resTok.json();
          evolveTokensGlobal = dataTok.evolveTokens || 0;
        } catch {}
        const balance = await contract.balanceOf(address);
        const balanceNum = typeof balance === "bigint" ? Number(balance) : balance;
        const creatureList = [];
        for (let i = 0; i < balanceNum; i++) {
          let tokenId, tokenURI;
          try {
            tokenId = await contract.tokenOfOwnerByIndex(address, i);
          } catch (err) {
            console.error(`Error fetching tokenOfOwnerByIndex for index ${i}:`, err);
            continue;
          }
          try {
            tokenURI = await contract.tokenURI(tokenId);
          } catch (err) {
            console.error(`Error fetching tokenURI for tokenId ${tokenId}:`, err);
            continue;
          }
          if (!tokenURI) {
            console.error(`No tokenURI for tokenId ${tokenId}`);
            continue;
          }
          // Convert ipfs:// to https://ipfs.io/ipfs/ if needed
          if (tokenURI.startsWith("ipfs://")) {
            tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          }
          let meta = {};
          try {
            const res = await fetch(tokenURI);
            if (res.ok) {
              meta = await res.json();
            }
          } catch (err) {
            console.error(`Error fetching or parsing metadata for token ${tokenId}:`, err);
          }
          // Fetch on-chain traits and level/evolution
          let power = 0, speed = 0, defense = 0, intelligence = 0;
          let level = 1, stage = 1, canEvolve = false;

          // Helper to conditionally log RPC call errors. Suppress noisy CALL_EXCEPTION / missing revert data in prod.
          function logCallError(context, tokenId, err) {
            const isCallException = err && (err.code === 'CALL_EXCEPTION' || String(err).toLowerCase().includes('missing revert data'));
            if (isCallException) {
              if (process.env.NODE_ENV === 'development') console.debug(`${context} (suppressed) for token ${tokenId}:`, err?.message || err);
            } else {
              console.error(`${context} for token ${tokenId}:`, err);
            }
          }

          try {
            const onchain = await contract.getTraits(tokenId);
            power = Number(onchain[0] ?? 0);
            speed = Number(onchain[1] ?? 0);
            defense = Number(onchain[2] ?? 0);
            intelligence = Number(onchain[3] ?? 0);
          } catch (err) {
            logCallError('Error fetching on-chain traits', tokenId, err);
          }

          try {
            const onchainLevel = await contract.getLevel(tokenId);
            level = Number(onchainLevel ?? 1);
          } catch (err) {
            logCallError('Error fetching on-chain level', tokenId, err);
          }

          try {
            // Prefer reading evolution stage from on-token metadata when available.
            // This avoids noisy RPC errors (for example if the deployed contract/address
            // doesn't expose the call expected by the ABI or the node returns "missing revert data").
            const metaAttrs = (meta && meta.attributes) || [];
            const attrStage = metaAttrs.find(a => a.trait_type === "Evolution Stage");
            if (attrStage && attrStage.value !== undefined && attrStage.value !== null) {
              // Attribute may be stored as "Stage 1" or a numeric value — extract number if possible.
              const parsed = String(attrStage.value).match(/(\d+)/);
              stage = parsed ? Number(parsed[1]) : Number(attrStage.value) || 1;
            } else {
              // Fallback: try on-chain call. If it fails, we'll default to stage 1.
              try {
                const onchainStage = await contract.getEvolutionStage(tokenId);
                stage = Number(onchainStage ?? 1);
              } catch (err) {
                logCallError('getEvolutionStage failed', tokenId, err);
                stage = 1;
              }
            }
          } catch (err) {
            logCallError('Error processing evolution stage', tokenId, err);
            stage = 1;
          }
          // Can evolve is now off-chain token gated; allow until max stage (3)
          canEvolve = Number(stage) < 3;
          // Merge on-chain traits into attributes
          let attributes = meta.attributes || [];
          // Remove any existing Level/Stage and Power/Speed/Defense/Intelligence
          attributes = attributes.filter(a => !["Level","Evolution Stage","Power","Speed","Defense","Intelligence"].includes(a.trait_type));
          attributes.push({ trait_type: "Level", value: Number(level) });
          attributes.push({ trait_type: "Evolution Stage", value: Number(stage) >= 3 ? "Stage 3" : Number(stage) >= 2 ? "Stage 2" : "Stage 1" });
          attributes.push({ trait_type: "Power", value: Number(power) });
          attributes.push({ trait_type: "Speed", value: Number(speed) });
          attributes.push({ trait_type: "Defense", value: Number(defense) });
          attributes.push({ trait_type: "Intelligence", value: Number(intelligence) });
          // attach supabase evolve tokens
          creatureList.push({ id: tokenId.toString(), level: Number(level), evolutionStage: Number(stage), canEvolve: Boolean(canEvolve), evolveTokens: Number(evolveTokensGlobal), ...meta, attributes });
        }
        setUserCreatures(creatureList);
        // If no on-chain creatures were found (e.g. purchase simulated via local sales log),
        // try server-side token discovery which includes purchases recorded in marketplace.sales.json
        if (creatureList.length === 0) {
          try {
            const res = await fetch(`/api/userTokens?wallet=${address}`);
            if (res.ok) {
              const json = await res.json();
              const tokens = Array.isArray(json.tokens) ? json.tokens : [];
              if (tokens.length > 0) {
                // tokens may include name and image from server; normalize
                const mapped = tokens.map(t => ({ id: String(t.id), level: 1, evolutionStage: 1, canEvolve: false, evolveTokens: 0, ...t }));
                setUserCreatures(mapped);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // ignore fallback errors
          }
        }
      } catch (err) {
        console.error("Error in fetchCreatures:", err);
        setUserCreatures([]);
      }
      setLoading(false);
    }
  
    async function handleMint() {
      if (!isConnected || userCreatures.length > 0) return;
      setMinting(true);
      setMintStatus("Selecting your creature...");
  
      // 1. Randomly select a base creature
      const base = creaturesData[Math.floor(Math.random() * creaturesData.length)];
  
      // 2. Generate random traits within the given ranges
      function randomInRange([min, max]) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      const traits = {
        power: randomInRange(base.traitRanges.power),
        speed: randomInRange(base.traitRanges.speed),
        defense: randomInRange(base.traitRanges.defense),
        intelligence: randomInRange(base.traitRanges.intelligence),
      };
  
      // 3. Construct metadata
      const metadata = {
        name: base.name,
        description: base.description,
        image: base.image,
        external_url: `https://kryptz.game/creature/${base.name.toLowerCase()}`,
        attributes: [
          { trait_type: "Level", value: 1 },
          { trait_type: "XP", value: 0 },
          { trait_type: "Type", value: base.type },
          { trait_type: "Rarity", value: "Common" },
          { trait_type: "Evolution Stage", value: "Stage 1" },
          { trait_type: "Power", value: traits.power },
          { trait_type: "Speed", value: traits.speed },
          { trait_type: "Defense", value: traits.defense },
          { trait_type: "Intelligence", value: traits.intelligence },
        ],
      };
  
      // 4. Upload metadata to Pinata
      setMintStatus("Uploading metadata to IPFS...");
      let metadataUrl;
      try {
        metadataUrl = await uploadToPinata(metadata);
      } catch (err) {
        alert("Pinata upload failed: " + err.message);
        setMinting(false);
        setMintStatus("");
        return;
      }
      console.log("Mint params:", address, metadataUrl);
      console.log("Contract address:", contractAddress);
      console.log("ABI:", contractABI);
      // 5. Mint NFT with metadata URL and initial on-chain traits
      setMintStatus("Minting your creature on blockchain...");
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(
          contractAddress,
          [
            ...contractABI,
            "function mintCreature(address to, string uri, uint256 powerInit, uint256 speedInit, uint256 defenseInit, uint256 intelligenceInit)"
          ],
          signer
        );
        const tx = await contract.mintCreature(
          address,
          metadataUrl,
          traits.power,
          traits.speed,
          traits.defense,
          traits.intelligence,
          { gasLimit: 500000 }
        );
        await tx.wait();
        setMintStatus("Creature minted! Updating your collection...");
        await updateUserProgress(address, "creaturesCollected");
        setTimeout(fetchCreatures, 3000);
      } catch (err) {
        console.error("Mint failed: ", err);
        alert("Mint failed: " + (err?.reason || err?.message || err));
        setMintStatus("");
      }
      setMinting(false);
    }
  
    useEffect(() => {
      fetchCreatures();
      fetchUserTokens();
      // eslint-disable-next-line
    }, [isConnected, address]);
  
    // Demo zlings (remove when integrating with backend)
    const creatures =
      userCreatures.length > 0
        ? userCreatures
        : isConnected
        ? []
        : [
            { id: 1, name: "FIRE SPRITE", type: "FIRE", level: 12, emoji: "🔥" },
            {
              id: 2,
              name: "WATER GUARDIAN",
              type: "WATER",
              level: 18,
              emoji: "🌊",
            },
            { id: 3, name: "EARTH GOLEM", type: "EARTH", level: 22, emoji: "🗿" },
            { id: 4, name: "AIR WISP", type: "AIR", level: 8, emoji: "💨" },
          ];
  
    return (
      <div>
        <div className="nes-container is-dark with-title mb-8">
          <p className="title text-warning">YOUR ZLING COLLECTION</p>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-success">
              Zlings Owned: {userCreatures.length}/∞
            </p>
            <div className="flex gap-2 items-center">
              {userCreatures.length > 0 && (
                <button
                  className={`nes-btn is-primary text-xs ${showTraits ? 'is-success' : ''}`}
                  onClick={() => setShowTraits(!showTraits)}
                >
                  {showTraits ? 'HIDE TRAITS' : 'SHOW TRAITS'}
                </button>
              )}
              {isConnected && userCreatures.length === 0 ? (
                <button
                  className={`nes-btn is-success animate-pulse ${
                    minting ? "is-disabled" : ""
                  }`}
                  onClick={handleMint}
                  disabled={minting}
                >
                  {minting ? "MINTING..." : "ADD YOUR FIRST ZLING"}
                </button>
              ) : (
                <button className="nes-btn is-primary">CATCH NEW ZLING</button>
              )}
            </div>
          </div>
        </div>

        {userCreatures.length === 0 && isConnected ? (
          <div className="text-center text-warning mb-8">
            <p>Welcome! Mint your first Zling to begin your adventure.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creatures.map((creature) => (
              <div key={creature.id} className="nes-container is-dark">
                <div className="text-center">
                  <div
                    className={`w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center relative ${
                      (Number(creature.evolutionStage) >= 3 || creature.attributes?.find(a=>a.trait_type==='Evolution Stage')?.value === 'Stage 3')
                        ? 'stage-3-frame'
                        : (Number(creature.evolutionStage) >= 2 || creature.attributes?.find(a=>a.trait_type==='Evolution Stage')?.value === 'Stage 2')
                          ? 'stage-2-frame'
                          : 'border-4 border-black'
                    }`}
                  >
                    {creature.image ? (
                      <img
                        src={creature.image.startsWith('ipfs://') ? creature.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : creature.image}
                        alt={creature.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{creature.emoji || '❓'}</span>
                    )}
                  </div>
                  <h3 className="text-xs mb-2 text-warning">{creature.name}</h3>
                  <div className="text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>TYPE:</span>
                      <span className="text-blue-400">{creature.type || (creature.attributes?.find(a => a.trait_type === 'Type')?.value) || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LEVEL:</span>
                      <span className="text-yellow-400">{creature.level || (creature.attributes?.find(a => a.trait_type === 'Level')?.value) || '-'}</span>
                    </div>
                    {showTraits && creature.attributes && (
                      <>
                        <div className="border-t border-gray-600 my-2 pt-2">
                          <div className="text-warning text-xs mb-2 font-bold">⚡ BATTLE STATS ⚡</div>
                        </div>
                        {/* Power */}
                        <div className="mb-1">
                          <div className="flex justify-between text-xs">
                            <span>POWER:</span>
                            <span className="text-red-400">{creature.attributes?.find(a => a.trait_type === 'Power')?.value || '-'}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className="bg-red-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${((creature.attributes?.find(a => a.trait_type === 'Power')?.value || 0) / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Speed */}
                        <div className="mb-1">
                          <div className="flex justify-between text-xs">
                            <span>SPEED:</span>
                            <span className="text-cyan-400">{creature.attributes?.find(a => a.trait_type === 'Speed')?.value || '-'}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className="bg-cyan-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${((creature.attributes?.find(a => a.trait_type === 'Speed')?.value || 0) / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Defense */}
                        <div className="mb-1">
                          <div className="flex justify-between text-xs">
                            <span>DEFENSE:</span>
                            <span className="text-green-400">{creature.attributes?.find(a => a.trait_type === 'Defense')?.value || '-'}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className="bg-green-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${((creature.attributes?.find(a => a.trait_type === 'Defense')?.value || 0) / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Intelligence */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs">
                            <span>INTELLIGENCE:</span>
                            <span className="text-purple-400">{creature.attributes?.find(a => a.trait_type === 'Intelligence')?.value || '-'}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${((creature.attributes?.find(a => a.trait_type === 'Intelligence')?.value || 0) / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="border-t border-gray-600 my-2 pt-2">
                          <div className="text-warning text-xs mb-1 font-bold">📊 INFO</div>
                        </div>
                        <div className="flex justify-between">
                          <span>XP:</span>
                          <span className="text-yellow-300">{creature.attributes?.find(a => a.trait_type === 'XP')?.value || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RARITY:</span>
                          <span className="text-pink-400">{creature.attributes?.find(a => a.trait_type === 'Rarity')?.value || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>STAGE:</span>
                          <span className="text-orange-400">{creature.attributes?.find(a => a.trait_type === 'Evolution Stage')?.value || '-'}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      className="nes-btn is-success w-full text-xs"
                      onClick={() => {
                        if (userTokens <= 0) {
                          setNoTokenModal(true);
                        } else {
                          setTrainModal({ open: true, tokenId: creature.id, traits: { Power: 0, Speed: 0, Defense: 0, Intelligence: 0 } });
                        }
                      }}
                      disabled={training}
                    >
                      TRAIN
                    </button>
                    {/* No Token Modal */}
                    {noTokenModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                        <div className="nes-container is-dark is-rounded w-full max-w-xs p-4 text-center">
                          <p className="text-error text-lg mb-2">No Training Tokens</p>
                          <p className="text-white text-sm mb-4">You don&apos;t have any training tokens left for today.<br/>Come back tomorrow for more!</p>
                          <button className="nes-btn is-primary w-full" onClick={() => setNoTokenModal(false)}>OK</button>
                        </div>
                      </div>
                    )}
                    <button
                    className={`nes-btn is-warning w-full text-xs ${evolving ? 'is-disabled' : ''}`}
                      disabled={evolving || Number(creature.evolutionStage) >= 3}
                      onClick={async () => {
                        try {
                          console.log('[EVOLVE] Clicked for token', creature.id, 'tokens:', creature.evolveTokens, 'stage:', creature.evolutionStage);
                          if (Number(creature.evolutionStage) >= 3) {
                            alert('Max evolution reached');
                            return;
                          }
                          // Re-check latest token balance from Supabase to avoid stale UI
                          let latestTokens = Number(creature.evolveTokens) || 0;
                          try {
                            const tokRes = await fetch(`/api/evolveToken?wallet=${address}`);
                            const tokData = await tokRes.json();
                            latestTokens = tokData.evolveTokens || 0;
                          } catch (e) { console.warn('Failed to refresh evolve token balance', e); }
                          if (latestTokens <= 0) { setNoEvolveTokenModal(true); return; }
                          if (!contractAddress) {
                            alert('Missing contract address. Set NEXT_PUBLIC_CONTRACT_ADDRESS');
                            return;
                          }
                          setEvolving(true);
                          setEvolveStatus("Applying evolution boosts...");
                          const currentStage = Number(creature.evolutionStage) || 1;
                          const nextStage = Math.min(currentStage + 1, 3);
                          const nextStageLabel = nextStage === 3 ? 'Stage 3' : 'Stage 2';
                          const nextFrame = nextStage === 3 ? 'Stage3' : 'Stage2';
                          // Boost each trait by +10 on-chain before updating metadata
                          const provider = new BrowserProvider(window.ethereum);
                          const signer = await provider.getSigner();
                          const contract = new Contract(contractAddress, contractABI, signer);
                          for (const traitName of ['Power','Speed','Defense','Intelligence']) {
                            const txBoost = await contract.trainTrait(creature.id, traitName, 10, { gasLimit: 200000 });
                            await txBoost.wait();
                          }
                          // Fetch updated traits to embed accurate values in metadata
                          let updatedPower = 0, updatedSpeed = 0, updatedDefense = 0, updatedIntelligence = 0;
                          try {
                            [updatedPower, updatedSpeed, updatedDefense, updatedIntelligence] = await contract.getTraits(creature.id);
                          } catch {}
                          setEvolveStatus("Preparing evolved metadata...");
                          // Build evolved metadata by adding a frame hint, updating stage, and injecting updated traits
                          const baseAttributes = (creature.attributes || []).filter(a => !['Evolution Frame','Power','Speed','Defense','Intelligence'].includes(a.trait_type));
                          const newAttributes = baseAttributes.map(a => {
                            if (a.trait_type === 'Evolution Stage') return { ...a, value: nextStageLabel };
                            if (a.trait_type === 'Level') return { ...a, value: Math.max(Number(creature.level) || 10, 10) };
                            return a;
                          });
                          newAttributes.push({ trait_type: 'Power', value: Number(updatedPower) });
                          newAttributes.push({ trait_type: 'Speed', value: Number(updatedSpeed) });
                          newAttributes.push({ trait_type: 'Defense', value: Number(updatedDefense) });
                          newAttributes.push({ trait_type: 'Intelligence', value: Number(updatedIntelligence) });
                          newAttributes.push({ trait_type: 'Evolution Frame', value: nextFrame });
                          const evolvedMetadata = {
                            name: creature.name,
                            description: creature.description,
                            image: creature.image,
                            external_url: creature.external_url,
                            attributes: newAttributes,
                          };
                          // 2) Upload new metadata to IPFS
                          setEvolveStatus("Uploading evolved metadata to IPFS...");
                          const newUri = await uploadToPinata(evolvedMetadata);
                          // 3) Call contract evolve (using Supabase evolve token)
                          setEvolveStatus("Submitting evolve transaction...");
                          const tx = await contract.evolve(creature.id, newUri, { gasLimit: 300000 });
                          await tx.wait();
                          // 4) Consume Supabase evolve token AFTER success
                          try {
                            const resUse = await fetch('/api/evolveToken', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, action: 'use' }) });
                            if (!resUse.ok) {
                              const errText = await resUse.text();
                              console.warn('Evolve token consume failed:', errText);
                            }
                          } catch (consumeErr) {
                            console.warn('Failed to consume evolve token:', consumeErr);
                          }
                          setEvolveStatus("Evolved successfully! Updating your collection...");
                          // Update quests/progress
                          await updateUserProgress(address, 'creaturesEvolved');
                          setTimeout(fetchCreatures, 2000);
                        } catch (err) {
                          console.error('[EVOLVE] Error:', err);
                          alert("Evolve failed: " + (err?.reason || err?.message || err));
                        }
                        setEvolving(false);
                        setEvolveStatus("");
                      }}
                    >
                      {evolving ? 'EVOLVING...' : 'EVOLVE'}
                    </button>
                    {noEvolveTokenModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                        <div className="nes-container is-dark is-rounded w-full max-w-xs p-4 text-center">
                          <p className="text-error text-lg mb-2">No Evolve Tokens</p>
                          <p className="text-white text-sm mb-4">You need an evolve token to evolve this Zling.</p>
                          <button className="nes-btn is-primary w-full" onClick={() => setNoEvolveTokenModal(false)}>OK</button>
                        </div>
                      </div>
                    )}
                    <div className="text-2xs text-gray-400 mt-1">Evolve Tokens: {Number(creature.evolveTokens) || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Train Modal */}
        {trainModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="nes-container is-dark is-rounded w-full max-w-sm p-4">
              <p className="text-warning text-lg mb-2">Train Zling</p>
              <p className="text-success text-sm mb-2">Select traits to train (tokens left: {userTokens - Object.values(trainModal.traits).reduce((a,b)=>a+b,0)})</p>
              <div className="space-y-3 mb-4">
                {['Power','Speed','Defense','Intelligence'].map(trait => {
                  const traitColor = trait==='Power' ? 'text-red-400' : trait==='Speed' ? 'text-cyan-400' : trait==='Defense' ? 'text-green-400' : 'text-purple-400';
                  return (
                    <div key={trait} className="mb-2 w-full">
                      {/* Trait Name */}
                      <div className={`font-bold text-xs mb-0.5 ${traitColor} whitespace-nowrap`} style={{letterSpacing: '0.5px', minWidth: 0}}>{trait}:</div>
                      {/* Current value */}
                      <div className="text-xs text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{minWidth: 0}}>Current: {userCreatures.find(c=>c.id===trainModal.tokenId)?.attributes?.find(a=>a.trait_type===trait)?.value ?? 0}</div>
                      {/* Controls */}
                      <div className="grid grid-cols-12 gap-1 items-center w-full">
                        <div className="col-span-5 flex gap-1">
                          <button
                            className="nes-btn is-primary text-xs px-2 min-w-0 whitespace-nowrap"
                            disabled={userTokens - Object.values(trainModal.traits).reduce((a,b)=>a+b,0) <= 0}
                            onClick={() => setTrainModal(modal => ({ ...modal, traits: { ...modal.traits, [trait]: modal.traits[trait]+1 } }))}
                          >+
                          </button>
                          <button
                            className="nes-btn is-error text-xs px-2 min-w-0 whitespace-nowrap"
                            disabled={trainModal.traits[trait] <= 0}
                            onClick={() => setTrainModal(modal => ({ ...modal, traits: { ...modal.traits, [trait]: Math.max(modal.traits[trait]-1,0) } }))}
                          >-
                          </button>
                        </div>
                        <div className="col-span-7 text-xs text-center text-gray-200">+{trainModal.traits[trait]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="nes-btn is-success w-full mb-2"
                disabled={training || Object.values(trainModal.traits).reduce((a,b)=>a+b,0) === 0}
                onClick={async () => {
                  setTraining(true);
                  setErrorMsg("");
                  try {
                    const provider = new BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    // Add new ABI for multi-train
                    const contract = new Contract(
                      contractAddress,
                      [
                        ...contractABI,
                        "function trainTrait(uint256 tokenId, string trait, uint256 amount)"
                      ],
                      signer
                    );
                    // Only send a transaction for each trait with amount > 0
                    const traitsToTrain = Object.entries(trainModal.traits).filter(([trait, amount]) => amount > 0);
                    let totalTokensUsed = 0;
                    for (const [trait, amount] of traitsToTrain) {
                      const tx = await contract.trainTrait(trainModal.tokenId, trait, amount, { gasLimit: 200000 });
                      await tx.wait();
                      // Decrement tokens in Supabase for each token spent
                      for (let i = 0; i < amount; i++) {
                        await fetch("/api/useTrainingToken", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ wallet: address })
                        });
                        setUserTokens(t => t - 1);
                        totalTokensUsed++;
                        // Update quest progress for training a creature
                        await updateUserProgress(address, "creaturesTrained");
                        if (onProgressUpdate) onProgressUpdate();
                      }
                    }
                    // Add XP on-chain to NFT and to user profile (5 XP per token used)
                    if (totalTokensUsed > 0) {
                      try {
                        const addXpTx = await contract.addXP(trainModal.tokenId, totalTokensUsed * 5, { gasLimit: 200000 });
                        await addXpTx.wait();
                      } catch (err) {
                        console.error("Failed to add on-chain XP:", err);
                      }
                      try {
                        const xpRes = await fetch("/api/profile", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ wallet: address, addXp: totalTokensUsed * 5 })
                        });
                        const xpData = await xpRes.json();
                        setXpGained(totalTokensUsed * 5); // Show only gained XP, not total
                        setShowXpPopup(true);
                        console.log("showXpPopup:", showXpPopup);
                        setTimeout(() => setShowXpPopup(false), 2500);
                      } catch {}
                    }
                    setTrainModal({ open: false, tokenId: null, traits: { Power: 0, Speed: 0, Defense: 0, Intelligence: 0 } });
                    fetchCreatures();
                  {/* XP Gained Popup (global, always rendered at root) */}
                  <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                    {showXpPopup && xpGained > 0 && (
                      <div className="nes-container is-success is-rounded px-6 py-3 text-center animate-bounce shadow-lg">
                        <span className="text-lg font-bold">+{xpGained} XP</span>
                        <div className="text-xs mt-1 text-white">from training!</div>
                      </div>
                    )}
                  </div>
                  console.log("xpGained:", xpGained);
                  } catch (err) {
                    setErrorMsg(err.message || "Training failed");
                  }
                  setTraining(false);
                }}
              >
                {training ? "Training..." : `Train Selected`}
              </button>
              <button className="nes-btn is-error w-full" onClick={() => setTrainModal({ open: false, tokenId: null, traits: { Power: 0, Speed: 0, Defense: 0, Intelligence: 0 } })}>Cancel</button>
              {errorMsg && <p className="text-error text-xs mt-2">{errorMsg}</p>}
            </div>
          </div>
        )}

        {evolving && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="nes-container is-dark is-rounded">
              <p className="text-warning text-lg mb-2">Evolution in progress...</p>
              <p className="text-success text-sm">{evolveStatus}</p>
              <div className="mt-4 flex justify-center">
                <i className="nes-icon star is-large animate-spin"></i>
              </div>
            </div>
          </div>
        )}

        {minting && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="nes-container is-dark is-rounded">
              <p className="text-warning text-lg mb-2">Minting in progress...</p>
              <p className="text-success text-sm">{mintStatus}</p>
              <div className="mt-4 flex justify-center">
                <i className="nes-icon coin is-large animate-spin"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }