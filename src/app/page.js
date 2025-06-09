"use client";

import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { BrowserProvider, Contract } from "ethers";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("home");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="nes-container is-dark is-rounded with-title is-centered mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-warning opacity-50"></div>
        <p className="title text-warning">KRYPTZ</p>
        <div className="text-center relative">
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className="w-full h-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,0,0.1) 0%, rgba(0,0,0,0) 70%)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            ></div>
          </div>
          <h1 className="text-2xl mb-4 text-warning retro-glow animate-pulse">
            NFT CREATURE BATTLE ARENA
          </h1>
          <p className="text-sm text-success">
            Collect <span className="text-warning">•</span> Train{" "}
            <span className="text-warning">•</span> Evolve{" "}
            <span className="text-warning">•</span> Battle
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <div className="h-1 bg-warning opacity-50"></div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nes-container is-dark is-rounded mb-8 p-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { id: "home", label: "HOME", icon: "🏠" },
            { id: "creatures", label: "CREATURES", icon: "🐉" },
            { id: "battle", label: "BATTLE", icon: "⚔️" },
            { id: "marketplace", label: "MARKET", icon: "🏪" },
            { id: "profile", label: "PROFILE", icon: "👤" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nes-btn ${
                selectedTab === tab.id ? "is-warning" : "is-error"
              } hover:transform hover:-translate-y-1 transition-transform`}
              onClick={() => setSelectedTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="text-white">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="nes-container is-dark is-rounded p-4">
        <div className="bg-opacity-75">
          {selectedTab === "home" && <HomeContent />}
          {selectedTab === "creatures" && <CreaturesContent />}
          {selectedTab === "battle" && <BattleContent />}
          {selectedTab === "marketplace" && <MarketplaceContent />}
          {selectedTab === "profile" && <ProfileContent />}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center mt-16 text-xs">
        <div className="nes-container is-rounded is-dark py-4">
          <p className="text-success">
            Powered by <span className="text-warning">Core Blockchain</span> •
            Built with <i className="nes-icon is-small heart"></i> for Web3
            Gaming
          </p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" className="nes-icon github is-small"></a>
            <a href="#" className="nes-icon twitter is-small"></a>
            <a href="#" className="nes-icon discord is-small"></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeContent() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Welcome Section */}
      <div className="nes-container is-dark is-rounded">
        <div className="space-y-4">
          <h2 className="text-lg text-warning mb-4 retro-glow">
            WELCOME TRAINER!
          </h2>
          <p className="text-sm leading-relaxed text-success">
            Enter the world of Kryptz, where digital creatures live on the
            blockchain! Each NFT is unique with special traits, abilities, and
            evolution paths.
          </p>
          <div className="nes-container is-dark with-title">
            <p className="title text-warning">FEATURES</p>
            <div className="text-xs space-y-2">
              <p>
                <i className="nes-icon star is-small"></i> COLLECT rare
                creatures with unique DNA
              </p>
              <p>
                <i className="nes-icon trophy is-small"></i> BATTLE other
                trainers in PvP arena
              </p>
              <p>
                <i className="nes-icon coin is-small"></i> EVOLVE your creatures
                through training
              </p>
              <p>
                <i className="nes-icon coin is-small"></i> TRADE on the
                decentralized marketplace
              </p>
            </div>
          </div>
          <button className="nes-btn is-success w-full">
            START YOUR JOURNEY
          </button>
        </div>
      </div>

      {/* Featured Creature */}
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">FEATURED CREATURE</p>
        <div className="text-center">
          <div className="pixel-card mb-4 bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="w-32 h-32 mx-auto bg-gray-800 border-4 border-black mb-4 flex items-center justify-center">
              <span className="text-4xl">🐉</span>
            </div>
            <h3 className="text-sm mb-2">CYBER DRAGON #001</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>TYPE:</span>
                <span className="text-red-400">FIRE/TECH</span>
              </div>
              <div className="flex justify-between">
                <span>LEVEL:</span>
                <span className="text-yellow-400">25</span>
              </div>
              <div className="flex justify-between">
                <span>RARITY:</span>
                <span className="text-purple-400">LEGENDARY</span>
              </div>
            </div>
          </div>
          <button className="nes-btn is-warning">VIEW DETAILS</button>
        </div>
      </div>

      {/* Game Stats */}
      <div className="nes-container is-dark with-title md:col-span-2">
        <p className="title text-warning">GAME STATISTICS</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="nes-container is-dark">
            <p className="text-xs mb-1">TOTAL CREATURES</p>
            <p className="text-lg text-yellow-400">1,337</p>
          </div>
          <div className="nes-container is-dark">
            <p className="text-xs mb-1">ACTIVE TRAINERS</p>
            <p className="text-lg text-green-400">420</p>
          </div>
          <div className="nes-container is-dark">
            <p className="text-xs mb-1">BATTLES TODAY</p>
            <p className="text-lg text-red-400">89</p>
          </div>
          <div className="nes-container is-dark">
            <p className="text-xs mb-1">MARKET VOLUME</p>
            <p className="text-lg text-blue-400">12.5 CORE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreaturesContent() {
  const { isConnected, address } = useAccount();
  const [userCreatures, setUserCreatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  // Contract details (update with your actual values)
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contractABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function mintFirstCreature() public",
  ];

  async function fetchCreatures() {
    if (!isConnected || !address) return;
    setLoading(true);
    try {
      console.log("Fetching creatures for address:", address);
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, contractABI, provider);
      const balance = await contract.balanceOf(address);
      // Convert balance to number (ethers v6 returns BigInt)
      const balanceNum =
        typeof balance === "bigint" ? Number(balance) : balance;
      console.log("NFT balance (number):", balanceNum);
      const creatureList = [];
      for (let i = 0; i < balanceNum; i++) {
        let tokenId, tokenURI;
        try {
          tokenId = await contract.tokenOfOwnerByIndex(address, i);
        } catch (err) {
          console.error(
            `Error fetching tokenOfOwnerByIndex for index ${i}:`,
            err
          );
          continue;
        }
        console.log(`Token #${i} ID:`, tokenId);
        try {
          tokenURI = await contract.tokenURI(tokenId);
        } catch (err) {
          console.error(`Error fetching tokenURI for tokenId ${tokenId}:`, err);
          continue;
        }
        console.log(`Token #${tokenId} URI:`, tokenURI);
        if (!tokenURI) {
          console.error(`No tokenURI for tokenId ${tokenId}`);
          continue;
        }
        // Convert ipfs:// to https://ipfs.io/ipfs/ if needed
        if (tokenURI.startsWith("ipfs://")) {
          tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        try {
          const res = await fetch(tokenURI);
          if (!res.ok) {
            console.error(
              `Failed to fetch metadata for token ${tokenId}:`,
              res.status,
              res.statusText
            );
            continue;
          }
          const meta = await res.json();
          console.log(`Token #${tokenId} metadata:`, meta);
          creatureList.push({ id: tokenId.toString(), ...meta });
        } catch (err) {
          console.error(
            `Error fetching or parsing metadata for token ${tokenId}:`,
            err
          );
        }
      }
      setUserCreatures(creatureList);
      console.log("Final creatureList:", creatureList);
    } catch (err) {
      console.error("Error in fetchCreatures:", err);
      setUserCreatures([]);
    }
    setLoading(false);
  }

  async function handleMint() {
    if (!isConnected || userCreatures.length > 0) return;
    setMinting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);
      const tx = await contract.mintFirstCreature();
      await tx.wait();
      // Wait a bit for the chain to update, then refetch
      setTimeout(fetchCreatures, 3000);
    } catch (err) {
      alert("Mint failed: " + (err?.reason || err?.message || err));
    }
    setMinting(false);
  }

  useEffect(() => {
    fetchCreatures();
    // eslint-disable-next-line
  }, [isConnected, address]);

  // Demo creatures (remove when integrating with backend)
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
        <p className="title text-warning">YOUR CREATURE COLLECTION</p>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-success">
            Creatures Owned: {userCreatures.length}/∞
          </p>
          {isConnected && userCreatures.length === 0 ? (
            <button
              className={`nes-btn is-success animate-pulse ${
                minting ? "is-disabled" : ""
              }`}
              onClick={handleMint}
              disabled={minting}
            >
              {minting ? "MINTING..." : "ADD YOUR FIRST CREATURE"}
            </button>
          ) : (
            <button className="nes-btn is-primary">CATCH NEW</button>
          )}
        </div>
      </div>

      {userCreatures.length === 0 && isConnected ? (
        <div className="text-center text-warning mb-8">
          <p>Welcome! Mint your first creature to begin your adventure.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatures.map((creature) => (
            <div key={creature.id} className="nes-container is-dark">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black mb-4 flex items-center justify-center">
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
                </div>
                <div className="space-y-2">
                  <button className="nes-btn is-success w-full text-xs">
                    TRAIN
                  </button>
                  <button className="nes-btn is-warning w-full text-xs">
                    EVOLVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BattleContent() {
  return (
    <div className="space-y-8">
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">BATTLE ARENA</p>
        <div className="text-center">
          <p className="text-sm mb-6 text-success">
            Choose your battle mode and prove your skills!
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="nes-container is-dark">
              <h3 className="text-sm mb-4">PVP BATTLES</h3>
              <p className="text-xs mb-4">
                Challenge other trainers in real-time combat
              </p>
              <button className="nes-btn is-error w-full">FIND OPPONENT</button>
            </div>

            <div className="nes-container is-dark">
              <h3 className="text-sm mb-4">PVE QUESTS</h3>
              <p className="text-xs mb-4">
                Train against AI opponents and earn rewards
              </p>
              <button className="nes-btn is-success w-full">START QUEST</button>
            </div>
          </div>
        </div>
      </div>

      {/* Battle History */}
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">RECENT BATTLES</p>
        <div className="space-y-2">
          {[
            { opponent: "TRAINER_X", result: "WIN", reward: "+50 XP" },
            { opponent: "CRYPTO_MASTER", result: "LOSS", reward: "+10 XP" },
            { opponent: "PIXEL_WARRIOR", result: "WIN", reward: "+75 XP" },
          ].map((battle, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-900 border border-gray-700"
            >
              <span className="text-xs text-success">vs {battle.opponent}</span>
              <span
                className={`text-xs ${
                  battle.result === "WIN" ? "text-success" : "text-error"
                }`}
              >
                {battle.result}
              </span>
              <span className="text-xs text-warning">{battle.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceContent() {
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
          <button className="nes-btn is-primary">LIST CREATURE</button>
        </div>
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

function ProfileContent() {
  return (
    <div className="space-y-8">
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">TRAINER PROFILE</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="nes-container is-dark mb-4">
              <h3 className="text-sm mb-2 text-success">TRAINER INFO</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>NAME:</span>
                  <span className="text-yellow-400">PIXEL_MASTER</span>
                </div>
                <div className="flex justify-between">
                  <span>LEVEL:</span>
                  <span className="text-green-400">42</span>
                </div>
                <div className="flex justify-between">
                  <span>RANK:</span>
                  <span className="text-purple-400">ELITE</span>
                </div>
                <div className="flex justify-between">
                  <span>BATTLES WON:</span>
                  <span className="text-blue-400">127</span>
                </div>
              </div>
            </div>

            <button className="nes-btn is-warning w-full">
              CONNECT WALLET
            </button>
          </div>

          <div>
            <div className="nes-container is-dark">
              <h3 className="text-sm mb-2 text-success">ACHIEVEMENTS</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span className="text-warning">First Victory</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span className="text-warning">10 Win Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💎</span>
                  <span className="text-warning">Legendary Collector</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span className="text-warning">Speed Demon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
