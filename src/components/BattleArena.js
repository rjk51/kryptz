// src/components/BattleArena.js
import { useState } from "react";

const TYPE_EFFECTIVENESS = {
  fire: { grass: 2, water: 0.5, fire: 1 },
  water: { fire: 2, grass: 0.5, water: 1 },
  grass: { water: 2, fire: 0.5, grass: 1 },
  electric: { water: 2, ground: 0, electric: 1 },
  // add more as needed
};

const BattleArena = ({ player1, player2, onBattleEnd }) => {
  const [turn, setTurn] = useState("player1");
  const [log, setLog] = useState([]);
  const [p1HP, setP1HP] = useState(player1.hp);
  const [p2HP, setP2HP] = useState(player2.hp);

  const calculateDamage = (attacker, defender) => {
    const base = attacker.attack || 10;
    const multiplier =
      TYPE_EFFECTIVENESS[attacker.type]?.[defender.type] || 1;
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    return Math.floor(base * multiplier * randomFactor);
  };

  const attack = () => {
    let damage;
    if (turn === "player1") {
      damage = calculateDamage(player1, player2);
      setP2HP((hp) => Math.max(0, hp - damage));
      setLog((prev) => [...prev, `${player1.name} hits ${player2.name} for ${damage} HP`]);
      setTurn("player2");
    } else {
      damage = calculateDamage(player2, player1);
      setP1HP((hp) => Math.max(0, hp - damage));
      setLog((prev) => [...prev, `${player2.name} hits ${player1.name} for ${damage} HP`]);
      setTurn("player1");
    }
  };


  const isBattleOver = p1HP <= 0 || p2HP <= 0;
  if (isBattleOver) {
    if (p1HP > 0) {
      setLog((prev) => [...prev, `${player1.name} wins!`]);
    } else {
      setLog((prev) => [...prev, `${player2.name} wins!`]);
    }
    onBattleEnd(p1HP > 0 ? player1 : player2);
  }

  return (
    <div className="p-4 border rounded bg-gray-900 text-white max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">⚔️ Battle Arena</h2>

      <div className="mb-4">
        <p>{player1.name}: {p1HP} HP</p>
        <p>{player2.name}: {p2HP} HP</p>
      </div>

      {!isBattleOver ? (
        <button onClick={attack} className="nes-btn is-primary mb-4">
          {turn === "player1" ? `${player1.name}'s Attack` : `${player2.name}'s Attack`}
        </button>
      ) : (
        <div className="text-green-400 font-bold">
          🎉 {p1HP > 0 ? player1.name : player2.name} Wins!
        </div>
      )}

      <div className="mt-4 bg-gray-800 p-2 text-xs rounded h-40 overflow-y-auto">
        {log.map((entry, index) => (
          <div key={index} className="mb-1">{entry}</div>
        ))}
      </div>
    </div>
  );
};

export default BattleArena;
