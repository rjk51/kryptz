"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider, Contract } from "ethers";
import { battleGameABI, battleGameAddress } from "../lib/battleABI";
import { creatureABI, creatureAddress } from "../lib/creatureABI";

export function MatchmakingSection() {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [myCreatures, setMyCreatures] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadMyCreatures();
      checkIfInQueue();
    }
  }, [isConnected]);

  async function loadMyCreatures() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(creatureAddress, creatureABI, provider);
      const balance = await contract.balanceOf(address);
      const count = Number(balance);

      const ids = [];
      for (let i = 0; i < count; i++) {
        const id = await contract.tokenOfOwnerByIndex(address, i);
        ids.push(id.toString());
      }
      setMyCreatures(ids);
    } catch (err) {
      console.error("Failed to load creatures:", err);
    }
  }

  async function checkIfInQueue() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(battleGameAddress, battleGameABI, provider);
      const inQueue = await contract.inQueue(address);
      setAlreadyJoined(inQueue);
    } catch (err) {
      console.error("Failed to check queue status:", err);
    }
  }

  async function handleJoinQueue() {
    if (!selectedId) {
      setStatus("❌ Please select a creature");
      return;
    }

    try {
      setLoading(true);
      setStatus("Joining queue...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const battleGame = new Contract(battleGameAddress, battleGameABI, signer);

      const tx = await battleGame.joinQueue(selectedId);
      await tx.wait();
      setStatus("✅ Joined matchmaking queue!");
      setAlreadyJoined(true);
    } catch (err) {
      setStatus("❌ Error joining queue: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveQueue() {
    try {
      setLoading(true);
      setStatus("Leaving queue...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const battleGame = new Contract(battleGameAddress, battleGameABI, signer);

      const tx = await battleGame.leaveQueue();
      await tx.wait();
      setStatus("❎ Left matchmaking queue.");
      setAlreadyJoined(false);
    } catch (err) {
      setStatus("❌ Error leaving queue: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <select
        className="nes-select"
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Select Your Creature</option>
        {myCreatures.map((id) => (
          <option key={id} value={id}>
            Creature #{id}
          </option>
        ))}
      </select>

      <div className="flex gap-4">
        <button
          className={`nes-btn is-primary ${loading || alreadyJoined ? "is-disabled" : ""}`}
          onClick={handleJoinQueue}
        >
          JOIN QUEUE
        </button>

        <button
          className={`nes-btn is-error ${loading || !alreadyJoined ? "is-disabled" : ""}`}
          onClick={handleLeaveQueue}
        >
          LEAVE QUEUE
        </button>
      </div>

      {status && <p className="mt-2 text-xs text-success">{status}</p>}
    </div>
  );
}
