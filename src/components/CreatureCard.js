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
        {/* Creature Image/Avatar */}
        <div className="relative mb-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black flex items-center justify-center pixel-border">
            <span className="text-3xl">{creature.emoji || '❓'}</span>
          </div>
          
          {/* Level Badge */}
          <div className="absolute -top-2 -right-2 nes-badge is-splited">
            <span className="is-dark">LV</span>
            <span className="is-primary">{creature.level || 1}</span>
          </div>
          
          {/* Shiny/Special Effect */}
          {creature.isShiny && (
            <div className="absolute -top-1 -left-1 text-yellow-400 text-xs animate-pulse">
              ✨
            </div>
          )}
        </div>

        {/* Creature Name */}
        <h3 className="text-xs mb-2 font-bold tracking-wider">
          {creature.name || 'UNKNOWN'}
        </h3>

        {/* Creature ID */}
        <div className="text-xs text-gray-500 mb-3">
          #{creature.id?.toString().padStart(4, '0') || '0000'}
        </div>

        {/* Stats Section */}
        <div className="text-xs space-y-2 mb-4">
          {/* Type and Rarity */}
          <div className="flex justify-between items-center">
            <span>TYPE:</span>
            <span className={getTypeColor(creature.type)}>
              {creature.type?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>RARITY:</span>
            <span className={getRarityColor(creature.rarity)}>
              {creature.rarity?.toUpperCase() || 'COMMON'}
            </span>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="text-green-400">
                {creature.currentHP || creature.hp || 100}/{creature.hp || 100}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  getStatBarColor(creature.currentHP || creature.hp || 100, creature.hp || 100)
                }`}
                style={{ 
                  width: `${((creature.currentHP || creature.hp || 100) / (creature.hp || 100)) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Attack Stat */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>ATK:</span>
              <span className="text-red-400">{creature.attack || 50}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  getStatBarColor(creature.attack || 50)
                }`}
                style={{ width: `${((creature.attack || 50) / 100) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Defense Stat */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>DEF:</span>
              <span className="text-blue-400">{creature.defense || 50}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  getStatBarColor(creature.defense || 50)
                }`}
                style={{ width: `${((creature.defense || 50) / 100) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Speed Stat */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>SPD:</span>
              <span className="text-yellow-400">{creature.speed || 50}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  getStatBarColor(creature.speed || 50)
                }`}
                style={{ width: `${((creature.speed || 50) / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Experience Bar */}
        {creature.experience !== undefined && (
          <div className="mb-4">
            <div className="text-xs mb-1 flex justify-between">
              <span>EXP:</span>
              <span className="text-purple-400">
                {creature.experience}/{creature.experienceToNext || 100}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(creature.experience / (creature.experienceToNext || 100)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Special Abilities */}
        {creature.abilities && creature.abilities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs mb-2">ABILITIES:</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {creature.abilities.slice(0, 2).map((ability, index) => (
                <span 
                  key={index} 
                  className="nes-badge is-dark text-xs px-1"
                  title={ability.description}
                >
                  {ability.name || ability}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
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
        )}              {/* Status Effects */}
        {creature.statusEffects && creature.statusEffects.length > 0 && (
          <div className="mt-3 text-xs">
            <div className="flex flex-wrap gap-1 justify-center">
              {creature.statusEffects.map((effect, index) => (
                <span 
                  key={index}
                  className={`nes-badge ${
                    effect.type === 'positive' ? 'is-success' : 'is-error'
                  } text-xs`}
                >
                  {effect.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pixel Border Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-transparent">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 50%, var(--pixel-border) 50%, var(--pixel-border) 100%)',
            backgroundSize: '4px 4px'
          }}></div>
        </div>
      </div>
    </div>
  );
}

// Example usage component
export function CreatureCardExample() {
  const exampleCreature = {
    id: 1337,
    name: 'CYBER DRAGON',
    emoji: '🐉',
    type: 'fire',
    rarity: 'legendary',
    level: 25,
    hp: 150,
    currentHP: 120,
    attack: 85,
    defense: 70,
    speed: 60,
    experience: 750,
    experienceToNext: 1000,
    isShiny: true,
    canEvolve: true,
    abilities: [
      { name: 'FLAME BURST', description: 'Deals fire damage to all enemies' },
      { name: 'DRAGON RAGE', description: 'Increases attack when HP is low' }
    ],
    statusEffects: [
      { name: 'BURN', type: 'negative' },
      { name: 'BLESSED', type: 'positive' }
    ]
  };

  return (
    <div className="max-w-xs">
      <CreatureCard 
        creature={exampleCreature}
        onTrain={(creature) => console.log('Training:', creature.name)}
        onEvolve={(creature) => console.log('Evolving:', creature.name)}
        onBattle={(creature) => console.log('Battling with:', creature.name)}
      />
    </div>
  );
}