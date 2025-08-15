"use client";

import { useState, useEffect, useCallback } from "react";
import { HomeContent } from "./home/home";
import { CreaturesContent } from "./creatures/creatures";
import { BattleContents } from "./battle/BattleContent";
import { MarketplaceContent } from "./marketplace/marketplace";
import { ProfileContent } from "./profile/profile";
import { QuestsContent } from "./quests/QuestsContent";
import { getOrCreateUser } from "@/lib/supabase/userService";
import { useAccount } from "wagmi";
import { getUserProgress } from "@/lib/supabase/userService";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("home");
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ xp: 0, currentLevelXp: 0, xpForNextLevel: 100, tokens: 0, evolveTokens: 0, level: 1 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      getOrCreateUser(address)
        .then((userData) => {
          setUser(userData);
          // Fetch stats after user is created/fetched
          setTimeout(fetchUserStats, 500); // Small delay to ensure user is created
        })
        .catch((err) => {
          console.error("Supabase user error:", err);
        });
    } else {
      setUser(null);
      setUserStats({ xp: 0, currentLevelXp: 0, xpForNextLevel: 100, tokens: 0, evolveTokens: 0, level: 1 });
    }
  }, [isConnected, address]);

  useEffect(() => {
    // mark mounted on client to avoid rendering browser-only state during SSR
    setMounted(true);
  }, []);

  // Additional effect to fetch stats when user changes
  useEffect(() => {
    if (user && address) {
      fetchUserStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserStats = useCallback(async () => {
    if (!address) return;
    try {
      console.log('[STATS] Fetching stats for address:', address);
      
      // Fetch basic profile data
      const res = await fetch(`/api/profile?wallet=${address}`);
      const data = await res.json();
      console.log('[STATS] Profile API response:', data);
      
      if (data.error) {
        console.error('[STATS] Profile API error:', data.error);
        return;
      }
      
      // Fetch evolve tokens separately to ensure accuracy
      let evolveTokens = 0;
      try {
        const evolveRes = await fetch(`/api/evolveToken?wallet=${address}`);
        const evolveData = await evolveRes.json();
        console.log('[STATS] Evolve token API response:', evolveData);
        evolveTokens = evolveData.evolveTokens || 0;
      } catch (evolveErr) {
        console.warn('[STATS] Failed to fetch evolve tokens:', evolveErr);
        evolveTokens = data.evolveTokens || 0; // Fallback to profile data
      }
      
      const totalXp = data.xp || 0;
      const level = Math.floor(totalXp / 100) + 1;
      const currentLevelXp = totalXp % 100; // XP progress in current level
      const xpForNextLevel = 100; // XP needed per level
      
      const newStats = {
        xp: totalXp,
        currentLevelXp,
        xpForNextLevel,
        tokens: data.tokens || 0,
        evolveTokens,
        level
      };
      console.log('[STATS] Setting new stats:', newStats);
      setUserStats(newStats);
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  }, [address]);

  async function refreshProgress() {
    if (!address) return;
    // Refresh user stats in header when progress updates
    await fetchUserStats();
    await getUserProgress(address);
  }

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
            ZLING BATTLE ARENA
          </h1>
          <p className="text-sm text-success">
            Collect <span className="text-warning">•</span> Train{" "}
            <span className="text-warning">•</span> Evolve{" "}
            <span className="text-warning">•</span> Battle
          </p>
        </div>
        
        {/* Stats Bar (render only after client mount to avoid hydration mismatch) */}
        {mounted && isConnected && (
          <div className="mt-4 flex justify-center">
            <div className="flex gap-4 items-center text-xs">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                <span>⚡</span>
                <div className="flex flex-col">
                  <span className="text-yellow-400">{userStats.currentLevelXp}/{userStats.xpForNextLevel} XP</span>
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(userStats.currentLevelXp / userStats.xpForNextLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                <span>🏆</span>
                <span className="text-green-400">LVL {userStats.level}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                <span>🎯</span>
                <span className="text-blue-400">{userStats.tokens}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                <span>🌟</span>
                <span className="text-purple-400">{userStats.evolveTokens}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="h-1 bg-warning opacity-50"></div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nes-container is-dark is-rounded mb-8 p-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { id: "home", label: "HOME", icon: "🏠" },
            { id: "creatures", label: "ZLINGS", icon: "🐉" },
            { id: "battle", label: "BATTLE", icon: "⚔️" },

            { id: "marketplace", label: "MARKET", icon: "🏪" },
            { id: "profile", label: "PROFILE", icon: "👤" },
            { id: "quests", label: "QUESTS", icon: "🎯" },
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
          {selectedTab === "creatures" && <CreaturesContent onProgressUpdate={refreshProgress} />}
          {selectedTab === "battle" && <BattleContents />}

          {selectedTab === "marketplace" && <MarketplaceContent />}
          {selectedTab === "profile" && <ProfileContent user={user} />}
          {selectedTab === "quests" && <QuestsContent user={user} onQuestComplete={async (quest) => {
            // Grant XP and tokens via API
            if (!user) return;
            await fetch("/api/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wallet: user.wallet, addXp: quest.xp })
            });
            for (let i = 0; i < quest.tokens; i++) {
              await fetch("/api/useTrainingToken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: user.wallet })
              });
            }
          }} />}
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
