export function HomeContent() {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        {/* Welcome Section */}
        <div className="nes-container is-dark is-rounded">
          <div className="space-y-4">
            <h2 className="text-lg text-warning mb-4 retro-glow">
              WELCOME TO KRYPTZ!
            </h2>
            <p className="text-sm leading-relaxed text-success">
              Enter the mystical realm of Kryptz, where powerful digital beings called 
              <span className="text-warning"> ZLINGS</span> roam the blockchain! Each Zling is a unique NFT 
              with special abilities, elemental powers, and evolutionary potential.
            </p>
            <div className="nes-container is-dark with-title">
              <p className="title text-warning">WHAT ARE ZLINGS?</p>
              <div className="text-xs space-y-2">
                <p>
                  <i className="nes-icon star is-small"></i> <span className="text-warning">UNIQUE BEINGS:</span> Every Zling has randomized traits (Power, Speed, Defense, Intelligence)
                </p>
                <p>
                  <i className="nes-icon trophy is-small"></i> <span className="text-warning">EVOLUTIONARY:</span> Train your Zling to level up and evolve through 3 stages with animated flame auras
                </p>
                <p>
                  <i className="nes-icon coin is-small"></i> <span className="text-warning">TRAINABLE:</span> Use training tokens to boost traits and gain XP
                </p>
                <p>
                  <i className="nes-icon sword is-small"></i> <span className="text-warning">BATTLERS:</span> Fight other trainers in PvP arena battles
                </p>
              </div>
            </div>
            <div className="nes-container is-dark with-title">
              <p className="title text-warning">HOW TO PLAY</p>
              <div className="text-xs space-y-2">
                <p><span className="text-yellow-400">1.</span> Connect your wallet and mint your first Zling</p>
                <p><span className="text-yellow-400">2.</span> Train daily using your training tokens to boost stats</p>
                <p><span className="text-yellow-400">3.</span> Evolve your Zling using evolve tokens (Stage 1 → 2 → 3)</p>
                <p><span className="text-yellow-400">4.</span> Battle other players and complete quests</p>
                <p><span className="text-yellow-400">5.</span> Trade on the marketplace</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Evolution Showcase */}
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">EVOLUTION STAGES</p>
          <div className="text-center space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gray-800 border-4 border-black flex items-center justify-center">
                  <span className="text-2xl">🐣</span>
                </div>
                <span className="text-xs">STAGE 1</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gray-800 stage-2-frame flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <span className="text-xs text-yellow-400">STAGE 2 (Golden Flames)</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gray-800 stage-3-frame flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="text-xs text-orange-400">STAGE 3 (Inferno Aura)</span>
              </div>
            </div>
            <div className="text-xs text-success">
              Higher stages = stronger stats + animated frames!
            </div>
          </div>
        </div>
  
        {/* Game Economy */}
        <div className="nes-container is-dark with-title md:col-span-2">
          <p className="title text-warning">GAME ECONOMY</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="nes-container is-dark">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-xs mb-1">TRAINING TOKENS</p>
              <p className="text-sm text-yellow-400">Daily Refresh</p>
              <p className="text-xs text-gray-400">Boost Zling stats</p>
            </div>
            <div className="nes-container is-dark">
              <div className="text-2xl mb-2">🌟</div>
              <p className="text-xs mb-1">EVOLVE TOKENS</p>
              <p className="text-sm text-green-400">Quest Rewards</p>
              <p className="text-xs text-gray-400">Unlock next stage</p>
            </div>
            <div className="nes-container is-dark">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs mb-1">EXPERIENCE POINTS</p>
              <p className="text-sm text-blue-400">Train & Battle</p>
              <p className="text-xs text-gray-400">Level progression</p>
            </div>
            <div className="nes-container is-dark">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-xs mb-1">BLOCKCHAIN OWNED</p>
              <p className="text-sm text-purple-400">True Ownership</p>
              <p className="text-xs text-gray-400">Trade anytime</p>
            </div>
          </div>
        </div>
      </div>
    );
  }