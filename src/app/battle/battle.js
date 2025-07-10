export function BattleContent() {
    return (
      <div className="space-y-8">
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">BATTLE ARENA</p>
          <div className="text-center">
            <p className="text-sm mb-6 text-success">
              Choose your battle mode and prove your skills!
            </p>
  
            <div className="grid md:grid-cols-2 gap-6">
              <div className="nes-container is-dark">
                <h3 className="text-sm mb-4">PVP BATTLES</h3>
                <p className="text-xs mb-4">
                  Challenge other trainers in real-time combat
                </p>
                <button className="nes-btn is-error w-full">FIND OPPONENT</button>
              </div>
  
              <div className="nes-container is-dark">
                <h3 className="text-sm mb-4">PVE QUESTS</h3>
                <p className="text-xs mb-4">
                  Train against AI opponents and earn rewards
                </p>
                <button className="nes-btn is-success w-full">START QUEST</button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Battle History */}
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">RECENT BATTLES</p>
          <div className="space-y-2">
            {[
              { opponent: "TRAINER_X", result: "WIN", reward: "+50 XP" },
              { opponent: "CRYPTO_MASTER", result: "LOSS", reward: "+10 XP" },
              { opponent: "PIXEL_WARRIOR", result: "WIN", reward: "+75 XP" },
            ].map((battle, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-900 border border-gray-700"
              >
                <span className="text-xs text-success">vs {battle.opponent}</span>
                <span
                  className={`text-xs ${
                    battle.result === "WIN" ? "text-success" : "text-error"
                  }`}
                >
                  {battle.result}
                </span>
                <span className="text-xs text-warning">{battle.reward}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  