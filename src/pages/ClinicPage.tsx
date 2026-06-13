import { useState } from "react";
import { WaitingQueue } from "@/components/WaitingQueue";
import { BedGrid } from "@/components/BedGrid";
import { InventoryPanel } from "@/components/InventoryPanel";
import { TreatmentModal } from "@/components/TreatmentModal";
import { useGameStore } from "@/store/gameStore";
import type { Bed } from "@/types/game";
import { useGameLoop } from "@/hooks/useGameLoop";

export default function ClinicPage() {
  useGameLoop();
  const [modalOpen, setModalOpen] = useState(false);
  const selectedBeastId = useGameStore(s => s.selectedBeastId);
  const selectedBedId = useGameStore(s => s.selectedBedId);
  const beds = useGameStore(s => s.beds);

  const targetBed: Bed | null = selectedBedId ? beds.find(b => b.id === selectedBedId) ?? null : null;

  const handleBedClick = (bed: Bed) => {
    if (bed.status !== "empty") return;
    // If a beast is selected, open modal directly with this bed
    if (selectedBeastId) {
      setModalOpen(true);
    } else {
      // No beast selected yet, remind user
      useGameStore.getState().addNotification("info", "请先在左侧候诊队列中选择一位灵兽");
    }
  };

  return (
    <div className="container px-4 py-4 animate-fade">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: "calc(100vh - 150px)", minHeight: "600px" }}>
        <div className="lg:col-span-3 h-full overflow-hidden">
          <div className="h-full">
            <WaitingQueue />
          </div>
        </div>
        <div className="lg:col-span-6 h-full overflow-y-auto space-y-4 pr-1">
          <BedGrid onBedClick={handleBedClick} />

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-clinic-deep flex items-center gap-2">
                <span>💡</span> 游戏玩法提示
              </h3>
            </div>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>先在左侧<span className="font-semibold text-clinic-deep">候诊队列</span>中点击选择一位灵兽（危重者优先）</li>
              <li>再在<span className="font-semibold text-clinic-deep">治疗区</span>点击一张空闲的床位</li>
              <li>在诊断弹窗中观察症状 → 选择合适的药材配方（最多3味）→ 可分配护理员</li>
              <li>点击「开始治疗」，治疗完成后点击床位领取诊金或处理失败</li>
              <li>药材不够时在右侧仓库采购，每晚 24:00 自动结算日薪</li>
            </ol>
            <div className="mt-3 p-2 rounded-lg bg-clinic-amber/10 border border-clinic-amber/30 text-[11px] text-clinic-deep">
              <span className="font-semibold">⚠️ 注意：</span>
              药方与疾病完全匹配时成功率最高（75-92%）；错误搭配仅 30% 成功率，误诊会扣钱扣声望！
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 h-full overflow-hidden">
          <InventoryPanel />
        </div>
      </div>

      <TreatmentModal
        open={modalOpen && !!targetBed}
        onClose={() => {
          setModalOpen(false);
          useGameStore.getState().selectBeast(null);
          useGameStore.getState().selectBed(null);
        }}
        targetBed={targetBed}
      />
    </div>
  );
}
