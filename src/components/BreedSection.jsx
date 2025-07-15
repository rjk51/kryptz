"use client";
import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useAccount } from "wagmi";
import { creatureABI, creatureAddress } from "../lib/creatureABI";

export function BreedSection() {
  const { address, isConnected } = useAccount();
  const [creatures, setCreatures] = useState([]);
  const [parent1, setParent1] = useState("");
  const [parent2, setParent2] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [childPreview, setChildPreview] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  useEffect(() => {
    if (isConnected) loadCreatures();
  }, [isConnected]);

  useEffect(() => {
    if (parent1 && parent2 && parent1 !== parent2) {
      previewTraits(parent1, parent2);
    } else {
      setChildPreview(null);
    }
  }, [parent1, parent2]);

  async function loadCreatures() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(creatureAddress, creatureABI, provider);
      const balance = await contract.balanceOf(address);
      const count = Number(balance);

      const ids = [];
      const cooldownMap = {};
      for (let i = 0; i < count; i++) {
        const id = await contract.tokenOfOwnerByIndex(address, i);
        ids.push(id.toString());
        const ts = await contract.lastBredAt(id);
        cooldownMap[id.toString()] = Number(ts);
      }
      setCreatures(ids);
      setCooldowns(cooldownMap);
    } catch (err) {
      console.error("Error loading creatures:", err);
    }
  }

  async function previewTraits(id1, id2) {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(creatureAddress, creatureABI, provider);
      const [traits1, traits2] = await Promise.all([
        contract.getTraits(id1),
        contract.getTraits(id2),
      ]);

      const avg = (a, b) => Math.floor((Number(a) + Number(b)) / 2);
      setChildPreview({
        power: avg(traits1[0], traits2[0]),
        speed: avg(traits1[1], traits2[1]),
        defense: avg(traits1[2], traits2[2]),
        intelligence: avg(traits1[3], traits2[3]),
      });
    } catch (err) {
      console.error("Preview error:", err);
    }
  }

  const handleBreed = async () => {
    if (!parent1 || !parent2) {
      setStatus("❌ Select both parents");
      return;
    }
    if (parent1 === parent2) {
      setStatus("❌ Parents must be different");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Breeding...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(creatureAddress, creatureABI, signer);

      const newURI = "ipfs://bafkreie7newchildmeta";
      const rarity = "Rare";

      const tx = await contract.breedCreatures(parent1, parent2, newURI, rarity);
      await tx.wait();

      setStatus("✅ Creature bred successfully!");
      setParent1("");
      setParent2("");
      setChildPreview(null);
      loadCreatures();
    } catch (err) {
      console.error(err);
      setStatus("❌ Error breeding: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderCooldown = (id) => {
    const ts = cooldowns[id];
    if (!ts) return null;
    const elapsed = Date.now() / 1000 - ts;
    const remaining = 86400 - elapsed;
    return remaining > 0
      ? `🕒 ${Math.ceil(remaining / 60)} min cooldown`
      : "✅ Ready to breed";
  };

  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-warning">BREED CREATURES</p>

      <select
        className="nes-select"
        onChange={(e) => setParent1(e.target.value)}
        value={parent1}
        disabled={loading}
      >
        <option value="">Select Parent 1</option>
        {creatures.map((id) => (
          <option key={id} value={id}>
            Creature #{id} ({renderCooldown(id)})
          </option>
        ))}
      </select>

      <select
        className="nes-select mt-2"
        onChange={(e) => setParent2(e.target.value)}
        value={parent2}
        disabled={loading}
      >
        <option value="">Select Parent 2</option>
        {creatures.map((id) => (
          <option key={id} value={id}>
            Creature #{id} ({renderCooldown(id)})
          </option>
        ))}
      </select>

      <button
        className={`nes-btn is-success mt-4 ${loading ? "is-disabled" : ""}`}
        onClick={handleBreed}
      >
        {loading ? "Breeding..." : "BREED"}
      </button>

      {status && <p className="mt-2 text-xs text-success">{status}</p>}

      {childPreview && (
        <div className="mt-4 p-4 border-t border-gray-500">
          <h3 className="text-warning text-lg mb-2">👶 Predicted Traits</h3>
          <ul className="list-disc pl-5 text-success text-sm">
            <li>Power: {childPreview.power}</li>
            <li>Speed: {childPreview.speed}</li>
            <li>Defense: {childPreview.defense}</li>
            <li>Intelligence: {childPreview.intelligence}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
