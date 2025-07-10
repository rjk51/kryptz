export function HomeContent() {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        {/* Welcome Section */}
        <div className="nes-container is-dark is-rounded">
          <div className="space-y-4">
            <h2 className="text-lg text-warning mb-4 retro-glow">
              WELCOME TRAINER!
            </h2>
            <p className="text-sm leading-relaxed text-success">
              Enter the world of Kryptz, where digital creatures live on the
              blockchain! Each NFT is unique with special traits, abilities, and
              evolution paths.
            </p>
            <div className="nes-container is-dark with-title">
              <p className="title text-warning">FEATURES</p>
              <div className="text-xs space-y-2">
                <p>
                  <i className="nes-icon star is-small"></i> COLLECT rare
                  creatures with unique DNA
                </p>
                <p>
                  <i className="nes-icon trophy is-small"></i> BATTLE other
                  trainers in PvP arena
                </p>
                <p>
                  <i className="nes-icon coin is-small"></i> EVOLVE your creatures
                  through training
                </p>
                <p>
                  <i className="nes-icon coin is-small"></i> TRADE on the
                  decentralized marketplace
                </p>
              </div>
            </div>
            <button className="nes-btn is-success w-full">
              START YOUR JOURNEY
            </button>
          </div>
        </div>
  
        {/* Featured Creature */}
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">FEATURED CREATURE</p>
          <div className="text-center">
            <div className="pixel-card mb-4 bg-gradient-to-br from-purple-600 to-pink-600">
              <div className="w-32 h-32 mx-auto bg-gray-800 border-4 border-black mb-4 flex items-center justify-center">
                <span className="text-4xl">🐉</span>
              </div>
              <h3 className="text-sm mb-2">CYBER DRAGON #001</h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>TYPE:</span>
                  <span className="text-red-400">FIRE/TECH</span>
                </div>
                <div className="flex justify-between">
                  <span>LEVEL:</span>
                  <span className="text-yellow-400">25</span>
                </div>
                <div className="flex justify-between">
                  <span>RARITY:</span>
                  <span className="text-purple-400">LEGENDARY</span>
                </div>
              </div>
            </div>
            <button className="nes-btn is-warning">VIEW DETAILS</button>
          </div>
        </div>
  
        {/* Game Stats */}
        <div className="nes-container is-dark with-title md:col-span-2">
          <p className="title text-warning">GAME STATISTICS</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="nes-container is-dark">
              <p className="text-xs mb-1">TOTAL CREATURES</p>
              <p className="text-lg text-yellow-400">1,337</p>
            </div>
            <div className="nes-container is-dark">
              <p className="text-xs mb-1">ACTIVE TRAINERS</p>
              <p className="text-lg text-green-400">420</p>
            </div>
            <div className="nes-container is-dark">
              <p className="text-xs mb-1">BATTLES TODAY</p>
              <p className="text-lg text-red-400">89</p>
            </div>
            <div className="nes-container is-dark">
              <p className="text-xs mb-1">MARKET VOLUME</p>
              <p className="text-lg text-blue-400">12.5 CORE</p>
            </div>
          </div>
        </div>
      </div>
    );
  }