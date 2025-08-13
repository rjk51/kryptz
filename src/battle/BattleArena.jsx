import React, { useState, useEffect } from 'react';
import BattleField from './BattleField';
import { useNFTData } from '../hooks/useNFTData';

const BattleArena = () => {
  const [battleStarted, setBattleStarted] = useState(false);
  const [opponentCreatures] = useState([
    { id: 'op1', name: 'Griffin', power: 80 },
    { id: 'op2', name: 'Hydra', power: 88 },
  ]);

  // Get wallet address from MetaMask
  const [walletAddress, setWalletAddress] = useState('');
  useEffect(() => {
    async function getWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    }
    getWallet();
  }, []);

  const { creatures: myCreatures, loading } = useNFTData(walletAddress);

  return (
    <div>
      {!battleStarted ? (
        <button onClick={() => setBattleStarted(true)}>
          Start Battle
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 16, fontWeight: 'bold', color: '#fff' }}>Battle initiated!</div>
          <BattleField key={battleStarted ? 'battle' : 'none'} myCreatures={myCreatures} opponentCreatures={opponentCreatures} />
        </>
      )}
    </div>
  );
};

export default BattleArena;
