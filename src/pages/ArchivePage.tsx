import { useMemo, useState } from "react";
import { BookOpen, Heart, Star, Award, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { BREEDS, DISEASE_NAMES, SEVERITY_NAMES, HERBS } from "@/data/gameData";
import { ELEMENT_EMOJI, ELEMENT_NAMES } from "@/data/gameData";

export default function ArchivePage() {
  const discovered = useGameStore(s => s.discoveredBreeds);
  const relationships = useGameStore(s => s.beastRelationships);
  const records = useGameStore(s => s.medicalRecords);
  const reputation = useGameStore(s => s.reputation);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalCured = records.filter(r => r.success).length;
  const totalEvolved = records.filter(r => r.evolved).length;
  const totalRevenue = records.filter(r => r.success).reduce((s, r) => s + r.revenue, 0);

  const sortedBreeds = useMemo(() => {
    return [...BREEDS].sort((a, b) => {
      const da = discovered.includes(a.id) ? 0 : 1;
      const db = discovered.includes(b.id) ? 0 : 1;
      if (da !== db) return da - db;
      return b.rarity - a.rarity;
    });
  }, [discovered]);

  return (
    <div className="container px-4 py-6 space-y-6 animate-fade">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: "发现品种", val: `${discovered.length}/${BREEDS.length}`, color: "text-clinic-jade", bg: "from-teal-50" },
          { icon: Award, label: "成功治愈", val: totalCured, color: "text-emerald-600", bg: "from-emerald-50" },
          { icon: Star, label: "进化次数", val: totalEvolved, color: "text-clinic-amber", bg: "from-amber-50" },
          { icon: Heart, label: "累计诊金", val: totalRevenue, color: "text-clinic-crisis", bg: "from-rose-50" },
        ].map((m, i) => (
          <div key={i} className={`card p-4 bg-gradient-to-br ${m.bg} to-white`}>
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className="text-xs text-gray-600">{m.label}</span>
            </div>
            <div className={`text-2xl font-display font-bold tabular-nums ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-display text-xl text-clinic-deep flex items-center gap-2 mb-4">
          <span>📖</span> 灵兽品种图鉴
          <span className="ml-auto text-sm font-normal text-gray-500">
            诊所声望 <span className="text-clinic-amber font-semibold">{reputation}</span>
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedBreeds.map(breed => {
            const isFound = discovered.includes(breed.id);
            const rel = relationships[breed.id];
            const emoji = isFound
              ? (rel?.evolved && rel.highestStage > 0 ? breed.evolutionEmojis[Math.min(rel.highestStage, breed.evolutionEmojis.length - 1)] : breed.emoji)
              : "❓";
            const trust = rel?.trust ?? 0;
            const nextStage = Math.floor(trust / 25) + 1;
            const nextAt = nextStage * 25;
            const progress = ((trust % 25) / 25) * 100;
            const canEvolve = isFound && trust >= 25 && nextStage < breed.evolutionEmojis.length;
            return (
              <div
                key={breed.id}
                className={`relative rounded-xl border-2 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isFound
                    ? "bg-white border-clinic-border/60"
                    : "bg-gray-100/50 border-gray-200 opacity-70"
                }`}
              >
                <div className="text-4xl text-center mb-1" style={{ filter: isFound ? "none" : "grayscale(1)" }}>
                  {emoji}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-clinic-deep">
                    {isFound ? breed.name : "未知品种"}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                    {isFound ? (
                      <>
                        {ELEMENT_EMOJI[breed.element]} {ELEMENT_NAMES[breed.element]}系
                        <span className="ml-1">{"⭐".repeat(breed.rarity)}</span>
                      </>
                    ) : (
                      <span className="italic">继续接诊以解锁…</span>
                    )}
                  </div>
                </div>
                {isFound && (
                  <div className="mt-2 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-pink-400" />亲密度</span>
                      <span className="tabular-nums">{trust}</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-clinic-amber transition-all"
                        style={{ width: canEvolve ? "100%" : `${progress}%` }}
                      />
                    </div>
                    {rel?.evolved ? (
                      <div className="text-center text-clinic-amber font-semibold flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3" />
                        已进化至 Lv.{rel.highestStage}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 italic">
                        {canEvolve ? "🐣 下次治愈可触发进化！" : `升至下一阶段需 ${nextAt}`}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 text-center pt-0.5 border-t border-gray-100 mt-1">
                      就诊 {rel?.visits ?? 0} 次
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-xl text-clinic-deep flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-clinic-jade" />
          诊疗档案（{records.length} 条）
        </h2>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">还没有诊疗记录</p>
            <p className="text-xs mt-1 opacity-75">成功治愈或治疗失败的灵兽都会记录在此</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map(r => {
              const breed = BREEDS.find(b => b.id === r.breedId);
              const isOpen = expandedId === r.id;
              const herbs = r.prescriptions.map(id => HERBS.find(h => h.id === id)).filter(Boolean);
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    r.success ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : r.id)}
                    className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/40 transition-colors"
                  >
                    <div className="text-3xl w-12 h-12 rounded-xl bg-white/70 border border-white flex items-center justify-center">
                      {breed?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-clinic-deep">{r.beastName}</span>
                        <span className="text-xs text-gray-500">{breed?.name}</span>
                        <span className={`tag border ${r.success ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-rose-100 text-rose-700 border-rose-300"}`}>
                          {r.success ? "✓ 治愈" : "✗ 失败"}
                        </span>
                        {r.evolved && (
                          <span className="tag bg-clinic-amber/30 text-clinic-deep border-clinic-amber/50">
                            ✨ 发生进化
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{r.date}</span>
                        <span>·</span>
                        <span>{DISEASE_NAMES[r.disease]}</span>
                        <span>·</span>
                        <span>{SEVERITY_NAMES[r.severity]}</span>
                        <span>·</span>
                        <span className={r.success ? "text-emerald-600" : "text-rose-600"}>
                          {r.success ? "+" : ""}{r.revenue} 金
                        </span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-0 border-t border-gray-200/60 text-xs animate-fade">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="p-2 rounded-lg bg-white/60">
                          <div className="text-gray-500 mb-1">💊 使用药材</div>
                          <div className="flex flex-wrap gap-1">
                            {herbs.length > 0 ? herbs.map((h, i) => h && (
                              <span key={i} className="tag bg-clinic-amber/20 text-clinic-deep border-clinic-amber/40">
                                {h.emoji} {h.name}
                              </span>
                            )) : (
                              <span className="italic text-gray-400">无记录</span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/60">
                          <div className="text-gray-500 mb-1">📝 医师手记</div>
                          <div className="text-clinic-deep italic">「{r.notes}」</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
