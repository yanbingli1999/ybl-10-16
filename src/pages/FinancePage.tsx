import { useMemo } from "react";
import { Receipt, TrendingUp, TrendingDown, Calendar, DollarSign, PiggyBank } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

export default function FinancePage() {
  const transactions = useGameStore(s => s.transactions);
  const money = useGameStore(s => s.money);
  const currentDay = useGameStore(s => s.currentDay);
  const records = useGameStore(s => s.medicalRecords);

  // Group transactions by day (reverse order)
  const byDay = useMemo(() => {
    const map = new Map<number, typeof transactions>();
    for (const t of transactions) {
      const arr = map.get(t.day) ?? [];
      arr.push(t);
      map.set(t.day, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [transactions]);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  // Per-day summary for the simple chart
  const dailyStats = useMemo(() => {
    return byDay.map(([day, list]) => {
      const inc = list.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = list.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { day, inc, exp, net: inc - exp };
    });
  }, [byDay]);

  const maxVal = Math.max(1, ...dailyStats.map(d => Math.max(d.inc, d.exp)));
  const cureRate = records.length > 0 ? Math.round((records.filter(r => r.success).length / records.length) * 100) : 0;

  return (
    <div className="container px-4 py-6 space-y-6 animate-fade">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: PiggyBank, label: "当前余额", val: `${money}金`, color: "text-clinic-amber", cls: "from-amber-50" },
          { icon: TrendingUp, label: "累计收入", val: `+${totalIncome}`, color: "text-emerald-600", cls: "from-emerald-50" },
          { icon: TrendingDown, label: "累计支出", val: `-${totalExpense}`, color: "text-rose-600", cls: "from-rose-50" },
          { icon: DollarSign, label: "净收益", val: `${net >= 0 ? "+" : ""}${net}`, color: net >= 0 ? "text-clinic-jade" : "text-clinic-crisis", cls: net >= 0 ? "from-teal-50" : "from-red-50" },
          { icon: Receipt, label: "治愈成功率", val: `${cureRate}%`, color: "text-blue-600", cls: "from-blue-50" },
        ].map((m, i) => (
          <div key={i} className={`card p-4 bg-gradient-to-br ${m.cls} to-white`}>
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className="text-xs text-gray-600">{m.label}</span>
            </div>
            <div className={`text-2xl font-display font-bold tabular-nums ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {dailyStats.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-xl text-clinic-deep flex items-center gap-2 mb-4">
            <span>📊</span> 每日收支趋势
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-3 min-w-[500px] h-48">
              {dailyStats.slice(0, 14).reverse().map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-full flex items-end justify-center gap-0.5 relative">
                    <div className="flex flex-col justify-end gap-0.5 w-full">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t transition-all"
                        style={{ height: `${(d.inc / maxVal) * 100}%`, minHeight: d.inc > 0 ? "2px" : "0" }}
                        title={`收入 +${d.inc}`}
                      />
                      <div
                        className="w-full bg-gradient-to-t from-rose-500 to-rose-300 rounded-t transition-all"
                        style={{ height: `${(d.exp / maxVal) * 100}%`, minHeight: d.exp > 0 ? "2px" : "0" }}
                        title={`支出 -${d.exp}`}
                      />
                    </div>
                  </div>
                  <div className={`text-[10px] tabular-nums font-semibold ${d.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {d.net >= 0 ? "+" : ""}{d.net}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    D{d.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded" />
              收入
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-gradient-to-t from-rose-500 to-rose-300 rounded" />
              支出
            </span>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-display text-xl text-clinic-deep flex items-center gap-2 mb-4">
          <Receipt className="w-6 h-6 text-clinic-amber" />
          交易明细流水
          <span className="ml-auto text-sm font-normal text-gray-500">
            共 {transactions.length} 条记录 · 经营至 第{currentDay}天
          </span>
        </h2>

        {byDay.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📒</div>
            <p className="text-sm">暂无交易记录</p>
            <p className="text-xs mt-1 opacity-75">开始接诊灵兽后会自动记录收支</p>
          </div>
        ) : (
          <div className="space-y-6">
            {byDay.map(([day, list]) => {
              const inc = list.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
              const exp = list.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
              return (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinic-deep text-white text-sm font-semibold">
                      <Calendar className="w-4 h-4" />
                      第 {day} 天
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">收入 +{inc}</span>
                    <span className="text-xs text-rose-600 font-medium">支出 -{exp}</span>
                    <span className={`text-xs font-bold tabular-nums ${inc - exp >= 0 ? "text-clinic-jade" : "text-clinic-crisis"}`}>
                      净额 {inc - exp >= 0 ? "+" : ""}{inc - exp}
                    </span>
                  </div>
                  <div className="ml-2 border-l-2 border-clinic-border/60 pl-4 space-y-1.5">
                    {list.map(t => (
                      <div
                        key={t.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${
                          t.type === "income"
                            ? "bg-emerald-50/60 border-emerald-400"
                            : "bg-rose-50/60 border-rose-400"
                        }`}
                      >
                        {t.type === "income" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        <span className="text-[10px] text-gray-500 font-mono min-w-[55px]">{t.date}</span>
                        <span className="tag bg-white/80 text-gray-700 border border-gray-200 text-[10px]">
                          {t.category}
                        </span>
                        <span className="text-xs text-gray-700 flex-1 min-w-0 truncate">
                          {t.description}
                        </span>
                        <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                          t.type === "income" ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          {t.type === "income" ? "+" : "-"}{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
