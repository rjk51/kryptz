import Popup from "@/components/Popup";
import { dailyQuests, weeklyQuests } from "../questsData";

export function QuestList({ quests, completedQuests, onComplete, loading, type }) {
  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-warning">{type.toUpperCase()} QUESTS</p>
      <div className="space-y-4">
        {quests.map((q) => {
          const isCompleted = completedQuests.includes(q.id);
          return (
            <div key={q.id} className="nes-container is-rounded is-dark flex flex-col md:flex-row justify-between items-center py-2">
              <div>
                <div className="font-bold text-warning text-sm">{q.title}</div>
                <div className="text-xs text-white mb-1">{q.description}</div>
                <div className="text-xs text-success">Reward: <span className="text-yellow-400">{q.xp} XP</span> & <span className="text-pink-400">{q.tokens} Tokens</span></div>
              </div>
              <button
                className={`nes-btn ${isCompleted ? "is-disabled" : "is-error"} text-xs mt-2 md:mt-0`}
                disabled={isCompleted || loading}
                onClick={() => onComplete(q, type)}
              >
                {isCompleted ? "Completed" : "Not Completed"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
