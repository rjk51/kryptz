'use client';

import { useState } from 'react';

export default function CreatureCard({ creature, onTrain, onEvolve, onBattle, showActions = true }) {
  const [isHovered, setIsHovered] = useState(false);

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'mythic': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire': return 'text-red-400';
      case 'water': return 'text-blue-400';
      case 'earth': return 'text-yellow-600';
      case 'air': return 'text-cyan-400';
      case 'electric': return 'text-yellow-400';
      case 'ice': return 'text-blue-200';
      case 'dark': return 'text-purple-400';
      case 'light': return 'text-yellow-200';
      default: return 'text-gray-400';
    }
  };

  const getStatBarColor = (stat, maxStat = 100) => {
    const percentage = (stat / maxStat) * 100;
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 60) return 'bg-yellow-400';
    if (percentage >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div 
      className={`nes-container is-rounded with-title transition-all duration-200 ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="title">{creature.name || 'UNKNOWN'}</p>
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black flex items-center justify-center pixel-border">
            <span className="text-3xl">{creature.emoji || '❓'}</span>
          </div>
          <div className="absolute -top-2 -right-2 nes-badge is-splited">
            <span className="is-dark">LV</span>
            <span className="is-primary">{creature.level || 1}</span>
          </div>
          {creature.isShiny && (
            <div className="absolute -top-1 -left-1 text-yellow-400 text-xs animate-pulse">
              ✨
            </div>
          )}
        </div>

        <h3 className="text-xs mb-2 font-bold tracking-wider">
          {creature.name || 'UNKNOWN'}
        </h3>
        <div className="text-xs text-gray-500 mb-3">
          #{creature.id?.toString().padStart(4, '0') || '0000'}
        </div>

        <div className="text-xs space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span>TYPE:</span>
            <span className={getTypeColor(creature.type)}>{creature.type?.toUpperCase() || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>RARITY:</span>
            <span className={getRarityColor(creature.rarity)}>{creature.rarity?.toUpperCase() || 'COMMON'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="nes-btn is-success text-xs"
                onClick={() => onTrain?.(creature)}
                disabled={creature.isTraining}
              >
                {creature.isTraining ? 'TRAINING...' : 'TRAIN'}
              </button>
              <button 
                className="nes-btn is-warning text-xs"
                onClick={() => onEvolve?.(creature)}
                disabled={!creature.canEvolve}
              >
                EVOLVE
              </button>
            </div>
            <button 
              className="nes-btn is-error w-full text-xs"
              onClick={() => onBattle?.(creature)}
              disabled={creature.currentHP === 0}
            >
              BATTLE
            </button>
          </div>
        )}

        {/* ✅ Always Visible: View Metadata Button */}
        <button
          className="nes-btn is-primary w-full text-xs mt-2"
          onClick={() => {
            console.log("📦 Metadata for creature:", creature);
            alert(JSON.stringify(creature, null, 2));
          }}
        >
          View Metadata
        </button>
      </div>
    </div>
  );
}
