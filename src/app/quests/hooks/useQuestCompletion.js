import { useState } from "react";
import { useAccount } from "wagmi";
import { completeQuest } from "@/lib/supabase/questService";
import { updateUserProgress } from "@/lib/supabase/updateUserProgress";
import { getUserProgress, addXpAndTokens } from "@/lib/supabase/userService";

function checkQuestRequirement(quest, type, progress) {
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

export function useQuestCompletion(onQuestComplete, refreshQuests) {
    const { address } = useAccount();
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({ open: false, title: "", message: "" });

    const handleComplete = async (quest, type) => {
        const progress = await getUserProgress(address);
        if (!checkQuestRequirement(quest, type, progress)) {
            setPopup({ open: true, title: "Quest Not Completed", message: "You have not met the requirements for this quest yet." });
            return;
        }
        setLoading(true);
        try {
            await completeQuest(address, quest.id, type);
            await addXpAndTokens(address, quest.xp, quest.tokens);
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
            await refreshQuests();
            setPopup({ open: true, title: "Quest Completed!", message: `You completed: ${quest.title} and earned ${quest.xp} XP & ${quest.tokens} Tokens.` });
        } catch (err) {
            setPopup({ open: true, title: "Error", message: "Failed to complete quest. Please try again." });
        }
        setLoading(false);
    };

    return { loading, popup, setPopup, handleComplete };
}
