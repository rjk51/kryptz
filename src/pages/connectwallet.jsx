// src/pages/ConnectWallet.jsx (or any component)

import React, { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Failed to connect MetaMask.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Connect Wallet</h1>
      {walletAddress ? (
        <p><strong>Connected Wallet:</strong> {walletAddress}</p>
      ) : (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
