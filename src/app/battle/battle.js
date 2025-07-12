import { battleGameABI, battleGameAddress } from "@/lib/battleABI";
import { useAccount } from "wagmi";
import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";

export function BattleContent() {
  const { address, isConnected } = useAccount();
  const [opponent, setOpponent] = useState("");
  const [status, setStatus] = useState("");

  async function initiateBattle() {
    if (!isConnected || !opponent) return alert("Enter opponent address");

    try {
      setStatus("Initiating battle...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(battleGameAddress, battleGameABI, signer);

      const tx = await contract.initiateBattle(
        opponent,
        1, 0, 50, 100, // Player1: id, type, attack, hp
        2, 1, 40, 120  // Player2: id, type, attack, hp
      );
      await tx.wait();

      setStatus("Battle started!");
    } catch (err) {
      console.error("Error initiating battle:", err);
      setStatus("Failed to start battle.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">BATTLE ARENA</p>
        <div className="text-center">
          <p className="text-sm mb-6 text-success">
            Choose your battle mode and prove your skills!
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PVP BATTLES */}
            <div className="nes-container is-dark">
              <h3 className="text-sm mb-4 text-white">PVP BATTLES</h3>
              <p className="text-xs mb-4 text-success">
                Challenge other trainers in real-time combat
              </p>
              <input
                className="nes-input is-dark w-full mb-2"
                placeholder="Opponent address"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
              <button className="nes-btn is-error w-full" onClick={initiateBattle}>
                FIND OPPONENT
              </button>
              {status && <p className="text-xs text-success mt-2">{status}</p>}
            </div>

            {/* PVE QUESTS */}
            <div className="nes-container is-dark">
              <h3 className="text-sm mb-4 text-white">PVE QUESTS</h3>
              <p className="text-xs mb-4 text-success">
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