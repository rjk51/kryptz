"use client";
import {
  getAddress,
  isAddress,
  Contract,
  BrowserProvider
} from "ethers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { battleGameABI, battleGameAddress } from "../lib/battleABI";
import { creatureABI } from "../lib/creatureABI";

const creatureAddress = "0x74c1444D2Dc18433514883A39BBEda3C9815593f";

// Convert IPFS URI to HTTP gateway URL
function ipfsToHttp(uri) {
  return uri.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri;
}

export function ManualBattleSection() {
  const { address, isConnected } = useAccount();
  const [opponent, setOpponent] = useState("");
  const [myCreatureId, setMyCreatureId] = useState("");
  const [battleId, setBattleId] = useState(null);
  const [battleData, setBattleData] = useState(null);
  const [myCreatures, setMyCreatures] = useState([]);
  const [myCreature, setMyCreature] = useState(null); // Store selected creature metadata
  const [opponentCreatureId, setOpponentCreatureId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isConnected) loadMyCreatures();
  }, [isConnected]);

  async function loadMyCreatures() {
    try {
      if (!address) return;

      const provider = new ethers.JsonRpcProvider("https://rpc.test2.btcs.network");
      const contract = new Contract(creatureAddress, creatureABI, provider);

      const balance = await contract.balanceOf(address);
      const count = Number(balance);
      const ids = [];

      for (let i = 0; i < count; i++) {
        const id = await contract.tokenOfOwnerByIndex(address, i);
        const uri = await contract.tokenURI(id);
        const metadataRes = await fetch(ipfsToHttp(uri));
        const metadata = await metadataRes.json();
        ids.push({
          id: id.toString(),
          name: metadata.name || `Creature #${id}`,
          image: metadata.image ? ipfsToHttp(metadata.image) : '/globe.svg',
        });
      }

      setMyCreatures(ids);
    } catch (err) {
      console.error("Error loading creatures:", err);
    }
  }

  async function handleInitiateBattle() {
    if (!myCreatureId || !opponent || !opponentCreatureId) return;
    if (!isAddress(opponent)) return alert("❌ Invalid opponent address!");

    let checksummedOpponent;
    try {
      checksummedOpponent = getAddress(opponent);
    } catch {
      return alert("❌ Invalid address format!");
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
        opponentCreatureId,
        1,
        100,
        20
      );
      await tx.wait();

      setStatus("Battle initiated!");
      const newBattleId = await battleGame.battleId();
      const id = Number(newBattleId) - 1;
      setBattleId(id);
      setTimeout(() => loadBattleState(id), 3000);
    } catch (err) {
      alert("Error: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }

  const [opponentCreature, setOpponentCreature] = useState(null);

  async function loadBattleState(id) {
    const provider = new BrowserProvider(window.ethereum);
    const contract = new Contract(battleGameAddress, battleGameABI, provider);
    const battle = await contract.getBattle(id);
    setBattleData(battle);
    // Fetch opponent's creature details using opponent's address and creature ID
    try {
      const opponentAddress = battle.opponent || battle.player2 || null;
      const opponentCreatureId = battle.creature2.id?.toString?.() || battle.creature2.id;
      if (opponentAddress && opponentCreatureId && opponentCreatureId !== "0" && opponentCreatureId !== "999") {
        const creatureProvider = new ethers.JsonRpcProvider("https://rpc.test2.btcs.network");
        const creatureContract = new Contract(creatureAddress, creatureABI, creatureProvider);
        // Fetch the tokenURI for the opponent's creature
        const uri = await creatureContract.tokenURI(opponentCreatureId);
        const metadataRes = await fetch(ipfsToHttp(uri));
        const metadata = await metadataRes.json();
        setOpponentCreature({
          id: opponentCreatureId,
          name: metadata.name || `Creature #${opponentCreatureId}`,
          image: metadata.image ? ipfsToHttp(metadata.image) : '/globe.svg',
          address: opponentAddress,
        });
      } else {
        setOpponentCreature(null);
      }
    } catch (err) {
      setOpponentCreature(null);
    }
  }

  async function handlePlayTurn() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(battleGameAddress, battleGameABI, signer);
      const tx = await contract.playTurn(battleId);
      await tx.wait();
      loadBattleState(battleId);
    } catch (err) {
      alert("Error playing turn: " + err.message);
    }
  }

  // Track selected myCreatureId and set myCreature metadata
  useEffect(() => {
    if (myCreatureId && myCreatures.length > 0) {
      const found = myCreatures.find((c) => c.id === myCreatureId);
      setMyCreature(found || null);
    } else {
      setMyCreature(null);
    }
  }, [myCreatureId, myCreatures]);

  useEffect(() => {
    if (battleId !== null) {
      loadBattleState(battleId);
    }
  }, [battleId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <select
          className="nes-select"
          onChange={(e) => setMyCreatureId(e.target.value)}
        >
          <option value="">Choose Your Creature</option>
          {myCreatures.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <input
          className="nes-input"
          placeholder="Opponent Wallet"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />
        <input
          className="nes-input"
          placeholder="Opponent Creature ID"
          value={opponentCreatureId}
          onChange={(e) => setOpponentCreatureId(e.target.value)}
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
                {myCreature ? (
                  <>
                    <img
                      src={myCreature.image}
                      alt={myCreature.name}
                      style={{ width: 120, height: 120, marginBottom: 8, borderRadius: 12, objectFit: 'contain', background: '#333', border: '4px solid #fff', boxShadow: '0 0 12px #fff', transition: 'all 0.3s' }}
                    />
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>{myCreature.name}</p>
                  </>
                ) : (
                  <p>ID: {battleData.creature1.id.toString()}</p>
                )}
                {/* HP Bar for YOU */}
                <div style={{ margin: '8px 0 4px 0', width: 120 }}>
                  <div style={{
                    background: '#222',
                    borderRadius: 6,
                    height: 16,
                    width: '100%',
                    border: '1px solid #555',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(0, Math.min(100, (Number(battleData.creature1.hp) / 100) * 100))}%`,
                      background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ color: '#fff', fontSize: 12 }}>HP: {battleData.creature1.hp.toString()}</span>
                </div>
              </div>
              <div>
                <h4 className="text-error">OPPONENT</h4>
                {opponentCreature ? (
                  <>
                    <img
                      src={opponentCreature.image}
                      alt={opponentCreature.name}
                      style={{ width: 120, height: 120, marginBottom: 8, borderRadius: 12, objectFit: 'contain', background: '#333', border: '4px solid #fff', boxShadow: '0 0 12px #fff', transition: 'all 0.3s' }}
                    />
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>{opponentCreature.name}</p>
                    <p style={{ color: '#aaa', fontSize: 12, wordBreak: 'break-all' }}>Address: {opponentCreature.address}</p>
                  </>
                ) : (
                  <>
                    <img
                      src={'/globe.svg'}
                      alt="Opponent Creature"
                      style={{ width: 120, height: 120, marginBottom: 8, borderRadius: 12, objectFit: 'contain', background: '#333', border: '4px solid #fff', boxShadow: '0 0 12px #fff', transition: 'all 0.3s' }}
                    />
                    <p>ID: {battleData.creature2.id.toString()}</p>
                  </>
                )}
                {/* HP Bar for OPPONENT */}
                <div style={{ margin: '8px 0 4px 0', width: 120 }}>
                  <div style={{
                    background: '#222',
                    borderRadius: 6,
                    height: 16,
                    width: '100%',
                    border: '1px solid #555',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(0, Math.min(100, (Number(battleData.creature2.hp) / 100) * 100))}%`,
                      background: 'linear-gradient(90deg, #f44336, #ff9800)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ color: '#fff', fontSize: 12 }}>HP: {battleData.creature2.hp.toString()}</span>
                </div>
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
  );
}
