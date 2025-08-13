import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";

export function MarketplaceContent() {
    const { address } = useAccount();
    useEffect(() => {
      if (address) {
        updateUserProgress(address, "marketplaceVisited", true);
      }
    }, [address]);
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