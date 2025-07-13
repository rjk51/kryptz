"use client";

import { useState, useEffect } from "react";
import { HomeContent } from "./home/home";
import { CreaturesContent } from "./creatures/creatures";
import { BattleContents } from "./battle/BattleContent";
import { MarketplaceContent } from "./marketplace/marketplace";
import { ProfileContent } from "./profile/profile";
import { getOrCreateUser } from "@/lib/supabase/userService";
import { useAccount } from "wagmi";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("home");
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      getOrCreateUser(address)
        .then(setUser)
        .catch((err) => {
          console.error("Supabase user error:", err);
        });
    } else {
      setUser(null);
    }
  }, [isConnected, address]);

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
          {selectedTab === "battle" && <BattleContents />}
          {selectedTab === "marketplace" && <MarketplaceContent />}
          {selectedTab === "profile" && <ProfileContent user={user} />}
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
