import { useState, useEffect } from "react";
import Popup from "@/components/Popup";
import { dailyQuests, weeklyQuests } from "./questsData";
import { useAccount } from "wagmi";
import { getCompletedQuests, completeQuest } from "@/lib/supabase/questService";
import { getUserProgress } from "@/lib/supabase/userService";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";

export function QuestsContent({ user, onQuestComplete }) {
  const { address, isConnected } = useAccount();
  const [completed, setCompleted] = useState({ daily: [], weekly: [] });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, title: "", message: "" });
  const [userProgress, setUserProgress] = useState({
    battlesWon: 0,
    creaturesTrained: 0,
    creaturesCollected: 0,
    marketplaceVisited: false,
});

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const progress = await getUserProgress(address);
        setUserProgress(progress);
        // Get completed quests from backend only
        const completedQuests = await getCompletedQuests(address);
        setCompleted(completedQuests);
        // Auto-complete daily quests if requirements met and not already completed
        for (const q of dailyQuests) {
          const meetsReq = checkQuestRequirement(q, "daily", progress);
          const alreadyCompleted = completedQuests.daily.includes(q.id);
          if (meetsReq && !alreadyCompleted) {
            await completeQuest(address, q.id, "daily");
          }
        }
        // Refetch completed quests after possible updates
        const updatedCompleted = await getCompletedQuests(address);
        setCompleted(updatedCompleted);
      } catch {
        setUserProgress({
          battlesWon: 0,
          creaturesTrained: 0,
          creaturesCollected: 0,
          marketplaceVisited: false,
        });
        setCompleted({ daily: [], weekly: [] });
      }
    })();
  }, [address]);

  function checkQuestRequirement(quest, type, progress = userProgress) {
    if (type === "daily") {
      if (quest.id === "d1") return progress.creaturesTrained >= 1;
      if (quest.id === "d2") return progress.battlesWon >= 1;
      if (quest.id === "d3") return progress.marketplaceVisited;
    }
    if (type === "weekly") {
      if (quest.id === "w1") return progress.battlesWon >= 5;
      if (quest.id === "w2") return progress.creaturesTrained >= 10;
      if (quest.id === "w3") return progress.creaturesCollected >= 3;
    }
    return false;
  }

  async function handleComplete(quest, type) {
    if (!checkQuestRequirement(quest, type)) {
      setPopup({ open: true, title: "Quest Not Completed", message: "You have not met the requirements for this quest yet." });
      return;
    }
    setLoading(true);
    try {
      await completeQuest(address, quest.id, type);
      if (onQuestComplete) {
        await onQuestComplete(quest);
      }
      // Update progress in Supabase
      let progressField = null;
      let progressValue = undefined;
      if (type === "daily") {
        if (quest.id === "d1") progressField = "creaturesTrained";
        if (quest.id === "d2") progressField = "battlesWon";
        if (quest.id === "d3") { progressField = "marketplaceVisited"; progressValue = true; }
      }
      if (type === "weekly") {
        if (quest.id === "w1") progressField = "battlesWon";
        if (quest.id === "w2") progressField = "creaturesTrained";
        if (quest.id === "w3") progressField = "creaturesCollected";
      }
      if (progressField) {
        await updateUserProgress(address, progressField, progressValue);
      }
      // Refetch progress
      const progress = await getUserProgress(address);
      setUserProgress(progress);
      setCompleted((prev) => ({
        ...prev,
        [type]: [...prev[type], quest.id],
      }));
      setPopup({ open: true, title: "Quest Completed!", message: `You completed: ${quest.title} and earned ${quest.xp} XP & ${quest.tokens} Tokens.` });
    } catch (err) {
      setPopup({ open: true, title: "Error", message: "Failed to complete quest. Please try again." });
    }
    setLoading(false);
  }

  return (
    <>
      <Popup open={popup.open} onClose={() => setPopup({ ...popup, open: false })} title={popup.title}>
        {popup.message}
      </Popup>
      <div className="space-y-8">
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">DAILY QUESTS</p>
          <div className="space-y-4">
        {dailyQuests.map((q) => {
          const isCompleted = completed.daily.includes(q.id);
          return (
            <div key={q.id} className="nes-container is-rounded is-dark flex flex-col md:flex-row justify-between items-center py-2">
              <div>
                <div className="font-bold text-warning text-sm">{q.title}</div>
                <div className="text-xs text-white mb-1">{q.description}</div>
                <div className="text-xs text-success">Reward: <span className="text-yellow-400">{q.xp} XP</span> & <span className="text-pink-400">{q.tokens} Tokens</span></div>
              </div>
              <button
                className={`nes-btn ${isCompleted ? "is-disabled" : "is-success"} text-xs mt-2 md:mt-0`}
                disabled={isCompleted || loading}
                onClick={() => handleComplete(q, "daily")}
              >
                {isCompleted ? "Completed" : "Complete"}
              </button>
            </div>
          );
        })}
          </div>
        </div>
        <div className="nes-container is-dark with-title">
          <p className="title text-warning">WEEKLY QUESTS</p>
          <div className="space-y-4">
            {weeklyQuests.map((q) => (
              <div key={q.id} className="nes-container is-rounded is-dark flex flex-col md:flex-row justify-between items-center py-2">
                <div>
                  <div className="font-bold text-warning text-sm">{q.title}</div>
                  <div className="text-xs text-white mb-1">{q.description}</div>
                  <div className="text-xs text-success">Reward: <span className="text-yellow-400">{q.xp} XP</span> & <span className="text-pink-400">{q.tokens} Tokens</span></div>
                </div>
                <button
                  className={`nes-btn ${completed.weekly.includes(q.id) ? "is-disabled" : "is-warning"} text-xs mt-2 md:mt-0`}
                  disabled={completed.weekly.includes(q.id) || loading}
                  onClick={() => handleComplete(q, "weekly")}
                >
                  {completed.weekly.includes(q.id) ? "Completed" : "Complete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
