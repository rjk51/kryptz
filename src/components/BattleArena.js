'use client';

import { useState, useEffect } from 'react';

export default function BattleArena() {
  const [battleState, setBattleState] = useState('selecting'); // selecting, battling, result
  const [playerCreature, setPlayerCreature] = useState(null);
  const [enemyCreature, setEnemyCreature] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);

  const creatures = [
    { id: 1, name: 'FIRE SPRITE', type: 'FIRE', hp: 100, attack: 25, emoji: '🔥', moves: ['FLAME BURST', 'FIRE SPIN', 'EMBER'] },
    { id: 2, name: 'WATER GUARDIAN', type: 'WATER', hp: 120, attack: 20, emoji: '🌊', moves: ['WATER PULSE', 'HYDRO PUMP', 'BUBBLE BEAM'] },
    { id: 3, name: 'EARTH GOLEM', type: 'EARTH', hp: 150, attack: 30, emoji: '🗿', moves: ['ROCK THROW', 'EARTHQUAKE', 'STONE EDGE'] },
    { id: 4, name: 'AIR WISP', type: 'AIR', hp: 80, attack: 35, emoji: '💨', moves: ['GUST', 'TORNADO', 'AIR SLASH'] },
  ];

  const selectCreature = (creature) => {
    setPlayerCreature(creature);
    setPlayerHP(creature.hp);
    // Auto-select random enemy
    const availableEnemies = creatures.filter(c => c.id !== creature.id);
    const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    setEnemyCreature(randomEnemy);
    setEnemyHP(randomEnemy.hp);
    setBattleState('battling');
    setBattleLog(['Battle begins!']);
  };

  const performAttack = (move) => {
    if (battleState !== 'battling') return;

    const damage = Math.floor(Math.random() * 20) + 15;
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    
    const newLog = [...battleLog, `${playerCreature.name} used ${move}! Dealt ${damage} damage!`];
    
    if (newEnemyHP <= 0) {
      setBattleLog([...newLog, `${enemyCreature.name} fainted! You win!`]);
      setBattleState('result');
      return;
    }

    // Enemy counter-attack
    setTimeout(() => {
      const enemyMove = enemyCreature.moves[Math.floor(Math.random() * enemyCreature.moves.length)];
      const enemyDamage = Math.floor(Math.random() * 20) + 10;
      const newPlayerHP = Math.max(0, playerHP - enemyDamage);
      setPlayerHP(newPlayerHP);
      
      const finalLog = [...newLog, `${enemyCreature.name} used ${enemyMove}! Dealt ${enemyDamage} damage!`];
      
      if (newPlayerHP <= 0) {
        setBattleLog([...finalLog, `${playerCreature.name} fainted! You lose!`]);
        setBattleState('result');
      } else {
        setBattleLog(finalLog);
      }
    }, 1500);
  };

  const resetBattle = () => {
    setBattleState('selecting');
    setPlayerCreature(null);
    setEnemyCreature(null);
    setBattleLog([]);
    setPlayerHP(100);
    setEnemyHP(100);
  };

  if (battleState === 'selecting') {
    return (
      <div className="nes-container is-dark with-title">
        <p className="title text-success">SELECT YOUR CREATURE</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creatures.map((creature) => (
            <div 
              key={creature.id} 
              className="nes-container is-rounded cursor-pointer hover:transform hover:-translate-y-1 transition-all" 
              onClick={() => selectCreature(creature)}
              style={{
                background: 'linear-gradient(45deg, var(--background) 0%, var(--dark-bg) 100%)',
                border: '4px solid var(--pixel-border)'
              }}
            >
              <div className="text-center relative">
                <div className="absolute -top-2 -right-2">
                  <span className="nes-badge">
                    <span className="is-warning">Lv.1</span>
                  </span>
                </div>
                <div className="w-20 h-20 mx-auto bg-gray-800 border-4 border-black mb-2 flex items-center justify-center pixel-border">
                  <span className="text-2xl animate-pulse">{creature.emoji}</span>
                </div>
                <h3 className="text-xs mb-1 retro-glow">{creature.name}</h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="text-success">{creature.hp}</span>
                  </div>
                  <div className="w-full bg-gray-700 h-1">
                    <div className="h-1 bg-success" style={{ width: '100%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span>ATK:</span>
                    <span className="text-error">{creature.attack}</span>
                  </div>
                  <div className="w-full bg-gray-700 h-1">
                    <div className="h-1 bg-error" style={{ width: `${(creature.attack/100) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battle Arena */}
      <div className="nes-container is-dark with-title">
        <p className="title is-error">BATTLE ARENA</p>
        
        {/* Creatures Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          {/* Player Creature */}
          <div className="text-center">
            <div className="nes-container is-rounded is-dark mb-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-success opacity-50"></div>
              <h3 className="text-sm mb-2 retro-glow text-success">YOUR CREATURE</h3>
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-black mb-4 flex items-center justify-center pixel-border transform hover:scale-105 transition-transform">
                <span className="text-4xl animate-bounce">{playerCreature?.emoji}</span>
              </div>
              <div className="text-xs">
                <div className="mb-2 text-success">{playerCreature?.name}</div>
                <div className="mb-2">HP: <span className="text-success">{playerHP}</span>/<span className="text-success">{playerCreature?.hp}</span></div>
                <div className="nes-progress is-success">
                  <div 
                    className="nes-progress-value"
                    style={{ width: `${(playerHP / playerCreature?.hp) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full">
                <div className="h-1 bg-success opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Enemy Creature */}
          <div className="text-center">
            <div className="nes-container is-rounded is-dark mb-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-error opacity-50"></div>
              <h3 className="text-sm mb-2 retro-glow text-error">ENEMY CREATURE</h3>
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-900 to-gray-700 border-4 border-black mb-4 flex items-center justify-center pixel-border transform hover:scale-105 transition-transform">
                <span className="text-4xl animate-pulse">{enemyCreature?.emoji}</span>
              </div>
              <div className="text-xs">
                <div className="mb-2 text-error">{enemyCreature?.name}</div>
                <div className="mb-2">HP: <span className="text-error">{enemyHP}</span>/<span className="text-error">{enemyCreature?.hp}</span></div>
                <div className="nes-progress is-error">
                  <div 
                    className="nes-progress-value"
                    style={{ width: `${(enemyHP / enemyCreature?.hp) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full">
                <div className="h-1 bg-error opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Actions */}
        {battleState === 'battling' && (
          <div className="nes-container is-rounded is-dark mb-4">
            <h3 className="text-sm mb-4 text-warning retro-glow">CHOOSE YOUR MOVE</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {playerCreature?.moves.map((move, index) => (
                <button 
                  key={index}
                  className="nes-btn is-warning text-xs pixel-button hover:transform hover:-translate-y-1 transition-transform"
                  onClick={() => performAttack(move)}
                  style={{ textShadow: '2px 2px var(--pixel-border)' }}
                >
                  {move}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Battle Result */}
        {battleState === 'result' && (
          <div className="nes-container is-rounded is-dark mb-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-warning opacity-50"></div>
            <h3 className="text-lg mb-4 retro-glow animate-pulse">
              {playerHP > 0 ? '🏆 VICTORY!' : '💀 DEFEAT!'}
            </h3>
            <div className="space-y-2">
              <div className="text-sm retro-glow">
                {playerHP > 0 ? 'Congratulations! You won the battle!' : 'Better luck next time!'}
              </div>
              <div className="text-xs text-warning">
                <i className="nes-icon coin is-small"></i> 
                Rewards: +{playerHP > 0 ? '50' : '10'} XP, +{playerHP > 0 ? '25' : '5'} Coins
              </div>
              <button 
                className="nes-btn is-warning pixel-button hover:transform hover:-translate-y-1 transition-transform"
                onClick={resetBattle}
                style={{ textShadow: '2px 2px var(--pixel-border)' }}
              >
                BATTLE AGAIN
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-1 bg-warning opacity-50"></div>
            </div>
          </div>
        )}
      </div>

      {/* Battle Log */}
      <div className="nes-container is-rounded is-dark with-title">
        <p className="title text-success">BATTLE LOG</p>
        <div 
          className="bg-black p-4 font-mono text-xs h-32 overflow-y-auto border-4 border-gray-800"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)',
            boxShadow: 'inset 0 0 10px rgba(0,255,0,0.2)'
          }}
        >
          {battleLog.map((log, index) => (
            <div 
              key={index} 
              className="mb-1 text-success retro-glow"
              style={{ 
                opacity: 1 - (index * 0.1),
                textShadow: '0 0 5px rgba(0,255,0,0.5)'
              }}
            >
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}