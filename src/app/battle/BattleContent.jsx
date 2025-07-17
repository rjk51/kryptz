"use client";
import { useState } from "react";
import { ManualBattleSection } from "@/components/ManualBattleSection";
import { MatchmakingSection } from "@/components/MatchmakingSection";

export function BattleContents() {
  const [mode, setMode] = useState("manual");

  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-warning">⚔️ PVP BATTLE ARENA</p>

      <div className="flex gap-4 mb-6">
        <button
          className={`nes-btn ${mode === "manual" ? "is-warning" : ""}`}
          onClick={() => setMode("manual")}
        >
          Manual Battle
        </button>
        <button
          className={`nes-btn ${mode === "matchmaking" ? "is-primary" : ""}`}
          onClick={() => setMode("matchmaking")}
        >
          Matchmaking
        </button>
      </div>

      {mode === "manual" ? <ManualBattleSection /> : <MatchmakingSection />}
    </div>
  );
}
