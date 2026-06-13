import { Clock, AlertTriangle, User, Heart, X } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { BREEDS } from "@/data/gameData";
import { SEVERITY_NAMES, SEVERITY_COLORS, SEVERITY_BORDER, DISEASE_NAMES, ELEMENT_EMOJI } from "@/data/gameData";

export function WaitingQueue() {
  const queue = useGameStore(s => s.waitingQueue);
  const selectedId = useGameStore(s => s.selectedBeastId);
  const selectBeast = useGameStore(s => s.selectBeast);
  const dismissBeast = useGameStore(s => s.dismissBeast);

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-clinic-deep flex items-center gap-2">
          <span>📋</span> 候诊队列
          <span className="ml-auto text-sm bg-clinic-jade/15 text-clinic-jade px-2 py-0.5 rounded-full font-medium">
            {queue.length} 位
          </span>
        </h2>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {queue.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🪴</div>
            <p className="text-sm">暂无候诊灵兽</p>
            <p className="text-xs mt-1 opacity-75">营业时段会有客人上门…</p>
          </div>
        )}
        {queue.map(beast => {
          const breed = BREEDS.find(b => b.id === beast.breedId);
          const isSelected = selectedId === beast.id;
          const critical = beast.severity === "critical";
          const waitRatio = Math.min(1, beast.waitHours / 14);
          return (
            <div
              key={beast.id}
              onClick={() => selectBeast(isSelected ? null : beast.id)}
              className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 bg-white/70 backdrop-blur ${
                SEVERITY_BORDER[beast.severity]
              } ${isSelected ? "ring-2 ring-clinic-amber shadow-glow -translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-md"} ${
                critical ? "animate-pulse-danger" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="text-4xl flex-shrink-0 self-center w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-inner border border-clinic-border/40">
                  {breed?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-clinic-deep truncate">{beast.name}</span>
                    <span className="text-xs">{ELEMENT_EMOJI[breed?.element || "neutral"]}</span>
                    <span className={`tag border ${SEVERITY_COLORS[beast.severity]}`}>
                      {critical && <AlertTriangle className="w-3 h-3" />}
                      {SEVERITY_NAMES[beast.severity]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">品种：</span>
                      <span className="font-medium">{breed?.name}</span>
                      <span className="opacity-70">·</span>
                      <span className="opacity-70">⭐{"★".repeat(breed?.rarity || 1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>💊</span>
                      <span className="font-medium text-clinic-crisis">{DISEASE_NAMES[beast.disease]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span className="truncate">{beast.ownerName}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismissBeast(beast.id); }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full text-gray-400 hover:text-clinic-crisis hover:bg-red-50 transition-colors"
                  title="拒诊"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-gray-500" />
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      waitRatio < 0.5 ? "bg-clinic-jade" : waitRatio < 0.8 ? "bg-clinic-amber" : "bg-clinic-crisis"
                    }`}
                    style={{ width: `${waitRatio * 100}%` }}
                  />
                </div>
                <span className={`font-semibold tabular-nums ${waitRatio > 0.8 ? "text-clinic-crisis" : "text-gray-600"}`}>
                  等{beast.waitHours}h
                </span>
                <Heart className={`w-3 h-3 ${beast.satisfaction < 50 ? "text-clinic-crisis" : "text-pink-400"}`} />
                <span className="tabular-nums text-gray-600">{beast.satisfaction}</span>
              </div>
              {isSelected && (
                <div className="mt-2 p-2 rounded-lg bg-clinic-jade/5 border border-clinic-jade/20 text-xs space-y-1 animate-fade">
                  <div className="font-semibold text-clinic-deep flex items-center gap-1">
                    <span>🩺</span> 症状表现：
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {beast.symptoms.map(s => (
                      <span key={s} className="tag bg-white border border-clinic-border/60 text-clinic-deep">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-500 italic mt-1">
                    💡 提示：根据症状选择正确的药材组合才能治愈哦
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
