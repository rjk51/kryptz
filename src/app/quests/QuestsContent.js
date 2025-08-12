import { useCallback } from "react";
import Popup from "@/components/Popup";
import { dailyQuests, weeklyQuests } from "./questsData";
import { useQuests } from "./hooks/useQuests";
import { useQuestCompletion } from "./hooks/useQuestCompletion";
import { QuestList } from "./components/QuestList";

export function QuestsContent({ onQuestComplete }) {
  const { completed, refreshQuests } = useQuests();

  const memoizedOnQuestComplete = useCallback((quest) => {
    if (onQuestComplete) {
      onQuestComplete(quest);
    }
  }, [onQuestComplete]);

  const { loading, popup, setPopup, handleComplete } = useQuestCompletion(memoizedOnQuestComplete, refreshQuests);

  return (
    <>
      <Popup open={popup.open} onClose={() => setPopup({ ...popup, open: false })} title={popup.title}>
        {popup.message}
      </Popup>
      <div className="space-y-8">
        <QuestList
          quests={dailyQuests}
          completedQuests={completed.daily}
          onComplete={handleComplete}
          loading={loading}
          type="daily"
        />
        <QuestList
          quests={weeklyQuests}
          completedQuests={completed.weekly}
          onComplete={handleComplete}
          loading={loading}
          type="weekly"
        />
      </div>
    </>
  );
}
