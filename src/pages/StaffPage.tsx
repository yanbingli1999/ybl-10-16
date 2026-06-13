import { Users, Award, Briefcase, Clock, DollarSign, PlusCircle } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { BREEDS } from "@/data/gameData";
import type { Bed } from "@/types/game";

const STATUS_INFO = {
  idle: { label: "空闲中", cls: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
  working: { label: "工作中", cls: "bg-clinic-jade/15 text-clinic-jade border-clinic-jade/40", dot: "bg-clinic-jade animate-pulse" },
  resting: { label: "休息中", cls: "bg-gray-100 text-gray-600 border-gray-300", dot: "bg-gray-400" },
};

export default function StaffPage() {
  const staff = useGameStore(s => s.staff);
  const beds = useGameStore(s => s.beds);
  const totalWage = staff.reduce((s, x) => s + x.dailyWage, 0);
  const workingCount = staff.filter(s => s.status === "working").length;
  const money = useGameStore(s => s.money);

  const hire = () => {
    if (money < 200) {
      alert("招募资金不足（需 200 金）");
      return;
    }
    const names = ["子墨", "婉清", "书瑶", "景天", "长卿", "雪见", "紫萱", "云霆"];
    const titles = ["护理员", "药童", "见习护士"];
    const emojis = ["👩‍⚕️", "👨‍⚕️", "👩‍🔬", "🧑‍⚕️", "👩‍🎓"];
    const newStaff = {
      id: `staff_${Date.now()}`,
      name: names[Math.floor(Math.random() * names.length)],
      title: titles[Math.floor(Math.random() * titles.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      skillLevel: 1,
      status: "idle" as const,
      assignedBedId: null,
      dailyWage: 25,
    };
    useGameStore.setState(s => ({
      money: s.money - 200,
      staff: [...s.staff, newStaff],
    }));
    useGameStore.getState()._addTransaction("expense", "招募员工", 200, `招募新员工：${newStaff.name}`);
    useGameStore.getState().addNotification("success", `🎉 成功招募员工 ${newStaff.name}！`);
  };

  const getBedInfo = (bedId: string | null): Bed | null => bedId ? beds.find(b => b.id === bedId) ?? null : null;

  return (
    <div className="container px-4 py-6 space-y-6 animate-fade">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "员工总数", val: staff.length, color: "text-clinic-jade" },
          { icon: Briefcase, label: "在岗人数", val: `${workingCount}/${staff.length}`, color: "text-blue-600" },
          { icon: DollarSign, label: "日薪总额", val: `${totalWage}金/天`, color: "text-clinic-amber" },
          { icon: Award, label: "平均技能", val: (staff.reduce((s, x) => s + x.skillLevel, 0) / Math.max(1, staff.length)).toFixed(1), color: "text-clinic-crisis" },
        ].map((m, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className="text-xs text-gray-600">{m.label}</span>
            </div>
            <div className={`text-2xl font-display font-bold tabular-nums ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-xl text-clinic-deep flex items-center gap-2">
            <Users className="w-6 h-6 text-clinic-light-jade" />
            员工名册
          </h2>
          <button
            onClick={hire}
            className="btn-amber flex items-center gap-1.5 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            招募新员工（💰200）
          </button>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm">还没有员工，快去招募吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staff.map(s => {
              const info = STATUS_INFO[s.status];
              const bed = getBedInfo(s.assignedBedId);
              const snapshot = bed?.beastSnapshot;
              const breed = snapshot ? BREEDS.find(b => b.id === snapshot.breedId) : null;
              return (
                <div key={s.id} className="rounded-xl border-2 border-clinic-border/50 bg-gradient-to-br from-white to-clinic-bg p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="text-4xl w-14 h-14 rounded-2xl bg-white/80 border border-clinic-border/40 shadow-inner flex items-center justify-center">
                        {s.emoji}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${info.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-clinic-deep text-lg">{s.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{s.title}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`tag border ${info.cls}`}>
                          <Clock className="w-3 h-3" /> {info.label}
                        </span>
                        <span className="tag bg-clinic-amber/20 text-clinic-deep border-clinic-amber/40">
                          <Award className="w-3 h-3" /> Lv.{s.skillLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/60 border border-clinic-border/30">
                      <div className="text-gray-500">成功率加成</div>
                      <div className="text-clinic-jade font-semibold text-sm">+{s.skillLevel * 5}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 border border-clinic-border/30">
                      <div className="text-gray-500">日薪</div>
                      <div className="text-clinic-amber font-semibold text-sm">💰 {s.dailyWage}</div>
                    </div>
                  </div>

                  {s.status === "working" && snapshot && (
                    <div className="mt-3 p-2 rounded-lg bg-clinic-jade/10 border border-clinic-jade/30 text-xs">
                      <div className="font-semibold text-clinic-deep mb-0.5">正在护理：</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{breed?.emoji}</span>
                        <span>
                          {snapshot.name}（{breed?.name}）
                        </span>
                      </div>
                    </div>
                  )}

                  {s.status === "idle" && (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 text-center">
                      ✓ 随时可以分配到床位
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
