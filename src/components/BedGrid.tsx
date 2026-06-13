import { BedDouble, UserPlus, CheckCircle2, XCircle, Clock, Loader2, Search } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { BREEDS, SEVERITY_NAMES, SEVERITY_BORDER, DISEASE_NAMES, HERBS } from "@/data/gameData";
import type { Bed } from "@/types/game";

interface BedGridProps {
  onBedClick: (bed: Bed) => void;
}

export function BedGrid({ onBedClick }: BedGridProps) {
  const beds = useGameStore(s => s.beds);
  const staff = useGameStore(s => s.staff);
  const selectedBedId = useGameStore(s => s.selectedBedId);
  const selectBed = useGameStore(s => s.selectBed);
  const collectFromBed = useGameStore(s => s.collectFromBed);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-clinic-deep flex items-center gap-2">
          <span>🛏️</span> 治疗区
          <span className="ml-2 text-sm bg-clinic-amber/20 text-clinic-deep px-2 py-0.5 rounded-full font-medium">
            {beds.filter(b => b.status === "occupied").length}/{beds.length} 床位
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {beds.map(bed => {
          const isSelected = selectedBedId === bed.id;
          const isEmpty = bed.status === "empty";
          const snapshot = bed.beastSnapshot;
          const breed = snapshot ? BREEDS.find(b => b.id === snapshot.breedId) : null;
          const assignedStaff = bed.assignedStaffId ? staff.find(s => s.id === bed.assignedStaffId) : null;
          const progress = bed.treatmentTotal > 0 ? (bed.treatmentProgress / bed.treatmentTotal) * 100 : 0;
          const herbsUsed = bed.currentPrescriptionHerbs.map(id => {
            const h = HERBS.find(x => x.id === id);
            return h ? h.emoji + h.name : "";
          }).filter(Boolean);

          const resolved = bed.result !== "pending";
          const isSuccess = bed.result === "success";

          return (
            <div
              key={bed.id}
              onClick={() => {
                if (isEmpty) {
                  selectBed(isSelected ? null : bed.id);
                  onBedClick(bed);
                } else if (resolved) {
                  collectFromBed(bed.id);
                } else {
                  selectBed(isSelected ? null : bed.id);
                  onBedClick(bed);
                }
              }}
              className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 bg-gradient-to-br ${
                isEmpty
                  ? "from-gray-50 to-gray-100 border-dashed border-gray-300 hover:border-clinic-jade/60 hover:from-clinic-jade/5"
                  : snapshot
                  ? `from-white to-clinic-bg border-2 ${SEVERITY_BORDER[snapshot.severity]} ${
                      resolved
                        ? isSuccess
                          ? "animate-heal-glow"
                          : "animate-shake"
                        : ""
                    }`
                  : "from-white to-gray-50 border-gray-300"
              } ${isSelected ? "ring-2 ring-clinic-amber shadow-glow -translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-md"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BedDouble className={`w-4 h-4 ${isEmpty ? "text-gray-400" : "text-clinic-jade"}`} />
                <span className="text-sm font-semibold text-clinic-deep">{bed.name}</span>
                {!isEmpty && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    resolved
                      ? isSuccess
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                      : "bg-clinic-jade/15 text-clinic-jade"
                  }`}>
                    {resolved ? (isSuccess ? "✓ 可领取" : "✗ 处理") : "治疗中"}
                  </span>
                )}
              </div>

              {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-1">
                    <BedDouble className="w-6 h-6" />
                  </div>
                  <p className="text-xs">空闲床位</p>
                  <p className="text-[10px] opacity-70 mt-1">点击分配灵兽</p>
                </div>
              ) : snapshot && breed ? (
                <div>
                  <div className="flex gap-2">
                    <div className="text-3xl w-12 h-12 self-center flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-inner border border-clinic-border/40">
                      {breed.emoji}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="font-semibold text-sm text-clinic-deep truncate">
                        {snapshot.name}
                        <span className="ml-1 text-xs text-gray-500">{breed.name}</span>
                      </div>
                      <div className="text-[11px] flex items-center gap-1 flex-wrap">
                        <span className={`tag border ${
                          snapshot.severity === "mild" ? "bg-clinic-jade/10 text-clinic-jade border-clinic-jade/30" :
                          snapshot.severity === "moderate" ? "bg-amber-100/60 text-amber-700 border-amber-300" :
                          snapshot.severity === "severe" ? "bg-orange-100/60 text-orange-700 border-orange-300" :
                          "bg-red-100/60 text-clinic-crisis border-clinic-crisis/40"
                        }`}>
                          {SEVERITY_NAMES[snapshot.severity]}
                        </span>
                        {resolved ? (
                          <span className="text-clinic-crisis flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            确诊 {DISEASE_NAMES[snapshot.disease]}
                          </span>
                        ) : bed.playerDiagnosis ? (
                          <span className="text-gray-600 flex items-center gap-0.5">
                            <Search className="w-3 h-3" />
                            拟诊 {DISEASE_NAMES[bed.playerDiagnosis]}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">观察中...</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        💊 {herbsUsed.join(" ")}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        {assignedStaff ? (
                          <span className="flex items-center gap-0.5 bg-clinic-light-jade/10 px-1.5 rounded">
                            <UserPlus className="w-3 h-3" />
                            {assignedStaff.emoji} {assignedStaff.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">未分配护理员</span>
                        )}
                      </div>
                    </div>
                    <div className="self-start">
                      {resolved ? (
                        isSuccess ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-clinic-crisis" />
                        )
                      ) : (
                        <Loader2 className="w-5 h-5 text-clinic-jade animate-spin" />
                      )}
                    </div>
                  </div>

                  {!resolved && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          治疗进度
                        </span>
                        <span className="tabular-nums font-medium">{Math.floor(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clinic-jade via-clinic-light-jade to-clinic-amber transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {resolved && (
                    <div className={`mt-2 text-center text-xs font-semibold py-1.5 rounded-lg animate-fade ${
                      isSuccess
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700"
                    }`}>
                      {isSuccess ? "🎉 点击领取诊金！" : "⚠️ 治疗失败，点击处理"}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
