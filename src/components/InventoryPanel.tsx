import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { HERBS, ELEMENT_EMOJI } from "@/data/gameData";

export function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory);
  const money = useGameStore(s => s.money);
  const purchaseHerb = useGameStore(s => s.purchaseHerb);
  const transactions = useGameStore(s => s.transactions);
  const currentDay = useGameStore(s => s.currentDay);

  const todayIncome = transactions
    .filter(t => t.type === "income" && t.day === currentDay)
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = transactions
    .filter(t => t.type === "expense" && t.day === currentDay)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-clinic-deep flex items-center gap-2">
          <span>🧪</span> 药材仓库
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="text-[10px] text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />今日收入
          </div>
          <div className="text-lg font-semibold text-emerald-700 tabular-nums">+{todayIncome}</div>
        </div>
        <div className="p-2 rounded-lg bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200">
          <div className="text-[10px] text-rose-700 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />今日支出
          </div>
          <div className="text-lg font-semibold text-rose-700 tabular-nums">-{todayExpense}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {HERBS.map(h => {
          const count = inventory[h.id] ?? 0;
          const low = count <= 2;
          return (
            <div
              key={h.id}
              className={`p-2 rounded-lg border transition-colors ${
                low
                  ? "bg-clinic-crisis/5 border-clinic-crisis/30"
                  : "bg-white/60 border-clinic-border/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center border border-clinic-border/30">
                  {h.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-clinic-deep">{h.name}</span>
                    <span className="text-[10px] text-gray-400">{ELEMENT_EMOJI[h.element]}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{h.description}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold tabular-nums ${low ? "text-clinic-crisis" : "text-clinic-deep"}`}>
                    x{count}
                  </div>
                  <div className="text-[10px] text-gray-500 tabular-nums">💰{h.price}</div>
                </div>
                <div className="flex flex-col gap-1">
                  {[1, 5].map(qty => (
                    <button
                      key={qty}
                      onClick={() => purchaseHerb(h.id, qty)}
                      disabled={money < h.price * qty}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-clinic-amber/80 text-clinic-deep font-semibold hover:bg-clinic-amber disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-0.5"
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-clinic-border/30 flex items-center gap-1 text-[10px] text-gray-500">
        <Package className="w-3 h-3" />
        <span>点击 +1 / +5 按钮快速采购药材</span>
      </div>
    </div>
  );
}
