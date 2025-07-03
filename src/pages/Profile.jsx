import React, { useEffect, useState } from "react";
import { useNFTData } from "../hooks/useNFTData";
import CreatureCard from "../components/CreatureCard";
import { ethers } from "ethers";


const Profile = () => {
  const [wallet, setWallet] = useState(null);
  const { creatures, loading } = useNFTData(wallet);

  // Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWallet(accounts[0]);
      console.log("✅ Connected wallet:", accounts[0]);
    } catch (err) {
      console.error("❌ MetaMask connection failed:", err);
      alert("Connection failed. Check MetaMask.");
    }
  };

  // Auto-connect if already approved
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) setWallet(accounts[0]);
      }
    };
    checkConnection();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Creature Collection</h2>

      {!wallet && (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            background: "#222",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          Connect Wallet
        </button>
      )}

      {wallet && <p><strong>Connected:</strong> {wallet}</p>}
      {wallet && loading && <p>Loading your creatures...</p>}

      {wallet && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
          {!loading && creatures.length === 0 && <p>No creatures owned yet.</p>}
          {creatures.map((creature, i) => {
            const fixedCreature = {
              ...creature,
              image: creature.image?.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
            };
            return (
              <CreatureCard
                key={i}
                creature={fixedCreature} // ✅ Pass entire creature object
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profile;
