import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { getCompletedQuests, completeQuest } from "@/lib/supabase/questService";
import { getUserProgress } from "@/lib/supabase/userService";
import { dailyQuests } from "../questsData";

function checkQuestRequirement(quest, progress) {
  if (quest.id === "d1") return progress.creaturesTrained >= 1;
  if (quest.id === "d2") return progress.battlesWon >= 1;
  if (quest.id === "d3") return progress.marketplaceVisited;
  return false;
}

export function useQuests() {
  const { address } = useAccount();
  const [completed, setCompleted] = useState({ daily: [], weekly: [] });
  const [userProgress, setUserProgress] = useState({
    battlesWon: 0,
    creaturesTrained: 0,
    creaturesCollected: 0,
    marketplaceVisited: false,
  });

  const refreshQuests = useCallback(async () => {
    if (!address) return;
    try {
      const progress = await getUserProgress(address);
      setUserProgress(progress);

      const completedQuests = await getCompletedQuests(address);
      
      const autoCompletedQuests = [];
      for (const q of dailyQuests) {
        const meetsReq = checkQuestRequirement(q, progress);
        const alreadyCompleted = completedQuests.daily.includes(q.id);
        if (meetsReq && !alreadyCompleted) {
          await completeQuest(address, q.id, "daily");
          autoCompletedQuests.push(q.id);
        }
      }
      
      if (autoCompletedQuests.length > 0) {
        const updatedCompleted = await getCompletedQuests(address);
        setCompleted(updatedCompleted);
      } else {
        setCompleted(completedQuests);
      }
    } catch (error) {
      console.error("Error refreshing quests:", error);
      setUserProgress({
        battlesWon: 0,
        creaturesTrained: 0,
        creaturesCollected: 0,
        marketplaceVisited: false,
      });
      setCompleted({ daily: [], weekly: [] });
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      refreshQuests();
    }
  }, [address]);

  return { completed, userProgress, refreshQuests };
}
