// src/hooks/useNFTData.js
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CREATURE_ABI } from "../contract/abi";
import { CONTRACT_ADDRESS } from "../contract/contract-address";

export const useNFTData = (walletAddress) => {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        if (!walletAddress || !window.ethereum) {
          console.warn("Wallet not connected or MetaMask not found.");
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log("🔍 Fetching NFTs for wallet:", walletAddress);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CREATURE_ABI, provider);

        const balance = await contract.balanceOf(walletAddress);
        console.log("🧾 NFT Balance:", balance.toString());

        const owned = [];

        for (let i = 0; i < Number(balance); i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
          const tokenURI = await contract.tokenURI(tokenId);
          console.log(`📦 Token #${tokenId.toString()} URI:`, tokenURI);

          const metadataURL = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
          const response = await fetch(metadataURL);
          const metadata = await response.json();

          console.log(`✅ Metadata for Token #${tokenId}:`, metadata);

          owned.push({
            tokenId: tokenId.toString(),
            ...metadata,
          });
        }

        setCreatures(owned);
      } catch (err) {
        console.error("❌ Error fetching NFT data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  return { creatures, loading };
};
