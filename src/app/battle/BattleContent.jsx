// 📁 src/components/BattleContent.jsx

"use client";
import { getAddress } from "ethers";
import { isAddress } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { battleGameABI, battleGameAddress } from "../../lib/battleABI";
import { creatureABI, creatureAddress } from "../../lib/creatureABI";
import { BrowserProvider, Contract } from "ethers";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";

export function BattleContents() {
  const { address, isConnected } = useAccount();
  const [opponent, setOpponent] = useState("");
  const [myCreatureId, setMyCreatureId] = useState("");
  const [battleId, setBattleId] = useState(null);
  const [battleData, setBattleData] = useState(null);
  const [myCreatures, setMyCreatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isConnected) loadMyCreatures();
  }, [isConnected]);

  async function loadMyCreatures() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(creatureAddress, creatureABI, provider);
      const balance = await contract.balanceOf(address);
      const count = typeof balance === "bigint" ? Number(balance) : balance;

      const ids = [];
      for (let i = 0; i < count; i++) {
        const id = await contract.tokenOfOwnerByIndex(address, i);
        ids.push(id.toString());
      }
      setMyCreatures(ids);
    } catch (err) {
      console.error("Error loading creatures:", err);
    }
  }

  async function handleInitiateBattle() {
    if (!myCreatureId || !opponent) return;

    if (!isAddress(opponent)) {
      alert("❌ Invalid opponent address! Please enter a valid 0x address.");
      return;
    }

    let checksummedOpponent;
    try {
      checksummedOpponent = getAddress(opponent);
    } catch (err) {
      alert("❌ Invalid address format!");
      return;
    }

    try {
      setLoading(true);
      setStatus("Initiating battle...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const battleGame = new Contract(battleGameAddress, battleGameABI, signer);

      const tx = await battleGame.initiateBattle(
        checksummedOpponent,
        myCreatureId,
        0,
        100,
        25,
        999,
        1,
        100,
        20
      );
      await tx.wait();
      setStatus("Battle initiated!");
      const newBattleId = await battleGame.battleId();
      const id = Number(newBattleId) - 1;
      setBattleId(id);
      setTimeout(() => loadBattleState(id), 3000); // ⏱ force refresh
    } catch (err) {
      alert("Error: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function loadBattleState(id) {
    const provider = new BrowserProvider(window.ethereum);
    const contract = new Contract(battleGameAddress, battleGameABI, provider);
    const battle = await contract.getBattle(id);
    setBattleData(battle);
  }

  async function handlePlayTurn() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(battleGameAddress, battleGameABI, signer);
      const tx = await contract.playTurn(battleId);
      await tx.wait();
      loadBattleState(battleId);
      // Update quest progress for winning a battle
      if (address) {
        await updateUserProgress(address, "battlesWon");
      }
    } catch (err) {
      alert("Error playing turn: " + err.message);
    }
  }

  useEffect(() => {
    if (battleId !== null) {
      loadBattleState(battleId);
    }
  }, [battleId]);

  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-warning">PVP BATTLE ARENA</p>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="nes-select"
            onChange={(e) => setMyCreatureId(e.target.value)}
          >
            <option value="">Choose Your Zling</option>
            {myCreatures.map((id) => (
              <option key={id} value={id}>
                Zling #{id}
              </option>
            ))}
          </select>
          <input
            className="nes-input"
            placeholder="Opponent Wallet"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
          <button
            className={`nes-btn is-warning ${loading ? "is-disabled" : ""}`}
            onClick={handleInitiateBattle}
          >
            START BATTLE
          </button>
        </div>
        {status && <p className="text-success text-xs">{status}</p>}

        {battleData && (
          <div className="mt-4">
            <div className="nes-container is-dark with-title">
              <p className="title text-success">Battle #{battleId}</p>
              <p className="text-xs text-gray-400 mb-2">
                Battle State: {battleData.state.toString()}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-warning">YOU</h4>
                  <p>ID: {battleData.creature1.id.toString()}</p>
                  <p>HP: {battleData.creature1.hp.toString()}</p>
                </div>
                <div>
                  <h4 className="text-error">OPPONENT</h4>
                  <p>ID: {battleData.creature2.id.toString()}</p>
                  <p>HP: {battleData.creature2.hp.toString()}</p>
                </div>
              </div>
              {!battleData.state.toString().includes("2") ? (
                <button
                  className="nes-btn is-primary mt-4"
                  onClick={handlePlayTurn}
                >
                  PLAY TURN
                </button>
              ) : (
                <p className="text-error text-sm mt-4">Battle has ended.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
