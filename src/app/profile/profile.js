import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function ProfileContent({ user }) {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState(user?.tokens ?? 0);
  const [xp, setXp] = useState(user?.xp ?? 0);
  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      try {
        const res = await fetch(`/api/profile?wallet=${address}`);
        const data = await res.json();
        setTokens(data.tokens || 0);
        if (typeof data.xp === 'number') setXp(data.xp);
      } catch {
        setTokens(0);
        setXp(0);
      }
    }
    if (isConnected && address) fetchProfile();
  }, [address, isConnected]);

  if (!user) {
    return (
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">TRAINER PROFILE</p>
        <div className="text-center py-8 text-success">Connect your wallet to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="nes-container is-dark with-title">
        <p className="title text-warning">TRAINER PROFILE</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="nes-container is-dark mb-4">
              <h3 className="text-sm mb-2 text-success">TRAINER INFO</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>WALLET:</span>
                  <span
                    className="text-yellow-400 max-w-[120px] truncate inline-block align-bottom"
                    title={user.wallet}
                  >
                    {user.wallet}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>LEVEL:</span>
                  <span className="text-green-400">{user.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>XP:</span>
                  <span className="text-blue-400">{xp}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRAINING TOKENS:</span>
                  <span className="text-pink-400">{tokens} </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-warning">
                <span>You get 3 tokens every day!</span>
              </div>
            </div>
          </div>
          <div>
            <div className="nes-container is-dark">
              <h3 className="text-sm mb-2 text-success">ACHIEVEMENTS</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span className="text-warning">First Victory</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span className="text-warning">10 Win Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💎</span>
                  <span className="text-warning">Legendary Collector</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span className="text-warning">Speed Demon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  