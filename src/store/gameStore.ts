import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Beast,
  Bed,
  Staff,
  MedicalRecord,
  Transaction,
  BeastRelationship,
  Notification,
  DiseaseType,
  Severity,
  WeatherType,
  Prescription,
  TreatmentResult,
  SubstitutionRecord,
} from "@/types/game";
import {
  BREEDS,
  HERBS,
  PRESCRIPTIONS,
  INITIAL_STAFF,
  INITIAL_BEDS,
  DISEASE_SYMPTOMS,
  OWNER_NAMES,
  BEAST_NAMES,
  NOTES_SUCCESS,
  NOTES_FAIL,
  DISEASE_NAMES,
  SUBSTITUTION_REASON_TEXT,
} from "@/data/gameData";

const DISEASE_TYPES: DiseaseType[] = [
  "fever", "cold", "poisoning", "fatigue", "fracture",
  "mana_disorder", "curse", "parasite", "dehydration", "allergy",
];

const SEVERITIES: { sev: Severity; hours: number }[] = [
  { sev: "mild", hours: 6 },
  { sev: "moderate", hours: 9 },
  { sev: "severe", hours: 12 },
  { sev: "critical", hours: 14 },
];

const WEATHERS: WeatherType[] = ["sunny", "cloudy", "rainy", "stormy", "misty"];

function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomBeast(day: number, time: number): Beast {
  const breed = rand(BREEDS.filter(b => b.rarity <= Math.min(5, 2 + Math.floor(day / 5))));
  const disease = rand(DISEASE_TYPES);
  const sevIdx = Math.min(3, Math.floor(Math.random() * Math.min(4, 1 + Math.floor(day / 4))));
  const severity = SEVERITIES[sevIdx].sev;
  const allSyms = DISEASE_SYMPTOMS[disease];
  const symCount = randomInt(2, 4);
  const picked: string[] = [];
  while (picked.length < symCount) {
    const s = rand(allSyms);
    if (!picked.includes(s)) picked.push(s);
  }
  return {
    id: uid("beast"),
    breedId: breed.id,
    name: rand(BEAST_NAMES),
    age: randomInt(1, 10),
    stage: 0,
    disease,
    severity,
    symptoms: picked,
    trustLevel: randomInt(0, 20),
    waitHours: 0,
    satisfaction: 100,
    ownerName: rand(OWNER_NAMES),
    arrivedAt: time,
  };
}

function calcTreatmentHours(severity: Severity, staffBoost: boolean): number {
  const base = SEVERITIES.find(s => s.sev === severity)?.hours ?? 8;
  return staffBoost ? Math.ceil(base * 0.7) : base;
}

export function guessDiseaseFromSymptoms(symptoms: string[]): { disease: DiseaseType; matchRate: number }[] {
  const results: { disease: DiseaseType; matchRate: number }[] = [];
  for (const disease of DISEASE_TYPES) {
    const diseaseSyms = DISEASE_SYMPTOMS[disease];
    const matched = symptoms.filter(s => diseaseSyms.includes(s)).length;
    const matchRate = Math.floor((matched / symptoms.length) * 100);
    results.push({ disease, matchRate });
  }
  return results.sort((a, b) => b.matchRate - a.matchRate);
}

export interface GameState {
  money: number;
  reputation: number;
  currentDay: number;
  currentTime: number;
  weather: WeatherType;
  isPaused: boolean;
  speed: number;
  waitingQueue: Beast[];
  beds: Bed[];
  inventory: Record<string, number>;
  staff: Staff[];
  discoveredBreeds: string[];
  medicalRecords: MedicalRecord[];
  beastRelationships: Record<string, BeastRelationship>;
  transactions: Transaction[];
  notifications: Notification[];
  selectedBeastId: string | null;
  selectedBedId: string | null;
  lastBeastSpawn: number;

  // Actions
  togglePause: () => void;
  setSpeed: (s: number) => void;
  selectBeast: (id: string | null) => void;
  selectBed: (id: string | null) => void;
  dismissBeast: (id: string) => void;
  assignBedAndTreat: (beastId: string, bedId: string, staffId: string | null, herbIds: string[], playerDiagnosis: DiseaseType | null, substitutions?: SubstitutionRecord[]) => void;
  purchaseHerb: (herbId: string, qty: number) => void;
  collectFromBed: (bedId: string) => void;
  addNotification: (type: Notification["type"], message: string) => void;
  clearNotification: (id: string) => void;
  resetGame: () => void;
  tickGame: (steps?: number) => void;
  _spawnInitialBeasts: () => void;
  _addTransaction: (type: Transaction["type"], category: string, amount: number, description: string) => void;
  _dailySettlement: () => void;
}

function createInitialBeds(): Bed[] {
  return INITIAL_BEDS.map(b => ({
    id: b.id,
    name: b.name,
    status: "empty",
    assignedBeastId: null,
    assignedStaffId: null,
    treatmentProgress: 0,
    treatmentTotal: 0,
    result: "pending",
    currentPrescriptionHerbs: [],
    substitutions: [],
    playerDiagnosis: null,
    startedAt: null,
    beastSnapshot: null,
  }));
}

function createInitialInventory(): Record<string, number> {
  const inv: Record<string, number> = {};
  HERBS.forEach(h => { inv[h.id] = 5; });
  return inv;
}

function buildInitialState() {
  return {
    money: 500,
    reputation: 50,
    currentDay: 1,
    currentTime: 8,
    weather: "sunny" as WeatherType,
    isPaused: false,
    speed: 1,
    waitingQueue: [] as Beast[],
    beds: createInitialBeds(),
    inventory: createInitialInventory(),
    staff: JSON.parse(JSON.stringify(INITIAL_STAFF)),
    discoveredBreeds: [] as string[],
    medicalRecords: [] as MedicalRecord[],
    beastRelationships: {} as Record<string, BeastRelationship>,
    transactions: [] as Transaction[],
    notifications: [] as Notification[],
    selectedBeastId: null,
    selectedBedId: null,
    lastBeastSpawn: 8,
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      togglePause: () => set(s => ({ isPaused: !s.isPaused })),
      setSpeed: (s: number) => set({ speed: s }),
      selectBeast: (id) => set({ selectedBeastId: id, selectedBedId: null }),
      selectBed: (id) => set({ selectedBedId: id, selectedBeastId: null }),

      addNotification: (type, message) => set(s => ({
        notifications: [{
          id: uid("notif"),
          type, message, timestamp: Date.now(),
        }, ...s.notifications].slice(0, 30),
      })),
      clearNotification: (id) => set(s => ({
        notifications: s.notifications.filter(n => n.id !== id),
      })),

      _addTransaction: (type, category, amount, description) => {
        const { currentDay, currentTime } = get();
        set(s => ({
          transactions: [...s.transactions, {
            id: uid("tx"),
            date: `第${currentDay}天 ${Math.floor(currentTime).toString().padStart(2, "0")}:${(Math.floor(currentTime % 1 * 60)).toString().padStart(2, "0")}`,
            day: currentDay,
            type, category, amount, description,
          }],
        }));
      },

      _spawnInitialBeasts: () => {
        const { currentDay, currentTime } = get();
        const initial: Beast[] = [];
        const count = randomInt(1, 2);
        for (let i = 0; i < count; i++) initial.push(generateRandomBeast(currentDay, currentTime));
        set({ waitingQueue: initial });
      },

      dismissBeast: (id) => {
        const s = get();
        const beast = s.waitingQueue.find(b => b.id === id);
        if (!beast) return;
        const breed = BREEDS.find(b => b.id === beast.breedId);
        const loss = Math.min(s.reputation, 5 + Math.ceil(beast.satisfaction / 50));
        set(st => ({
          waitingQueue: st.waitingQueue.filter(b => b.id !== id),
          reputation: Math.max(0, st.reputation - loss),
          selectedBeastId: st.selectedBeastId === id ? null : st.selectedBeastId,
        }));
        get().addNotification("warning", `拒绝治疗${breed?.name || "灵兽"}(名：${beast.name})，声望-${loss}`);
      },

      purchaseHerb: (herbId, qty) => {
        const herb = HERBS.find(h => h.id === herbId);
        if (!herb) return;
        const totalCost = herb.price * qty;
        const s = get();
        if (s.money < totalCost) {
          s.addNotification("error", "金钱不足，无法采购药材");
          return;
        }
        set(st => ({
          money: st.money - totalCost,
          inventory: { ...st.inventory, [herbId]: (st.inventory[herbId] ?? 0) + qty },
        }));
        get()._addTransaction("expense", "药材采购", totalCost, `采购 ${herb.name} x${qty}`);
        get().addNotification("success", `采购 ${herb.name} x${qty}，花费${totalCost}金`);
      },

      assignBedAndTreat: (beastId, bedId, staffId, herbIds, playerDiagnosis, substitutions = []) => {
        const s = get();
        const beast = s.waitingQueue.find(b => b.id === beastId);
        const bed = s.beds.find(b => b.id === bedId);
        if (!beast || !bed || bed.status !== "empty") {
          s.addNotification("error", "分配失败：灵兽或床位不可用");
          return;
        }
        for (const hid of herbIds) {
          if ((s.inventory[hid] ?? 0) < 1) {
            s.addNotification("error", `药材不足`);
            return;
          }
        }
        if (staffId) {
          const st = s.staff.find(x => x.id === staffId);
          if (!st || st.status !== "idle") {
            s.addNotification("error", "该护理员当前不可用");
            return;
          }
        }

        const newInventory = { ...s.inventory };
        herbIds.forEach(hid => { newInventory[hid] = (newInventory[hid] ?? 0) - 1; });
        let herbsCost = herbIds.reduce((sum, hid) => {
          const h = HERBS.find(x => x.id === hid);
          return sum + (h?.price ?? 0);
        }, 0);

        for (const sub of substitutions) {
          const subHerb = HERBS.find(h => h.id === sub.substituteHerbId);
          const origHerb = HERBS.find(h => h.id === sub.originalHerbId);
          if (subHerb && origHerb) {
            herbsCost = herbsCost - origHerb.price + subHerb.price;
          }
        }

        const hasStaff = !!staffId;
        const staffSkillBonus = staffId ? (s.staff.find(x => x.id === staffId)?.skillLevel ?? 1) * 5 : 0;
        void staffSkillBonus;

        let totalHours = calcTreatmentHours(beast.severity, hasStaff);
        let durationMultTotal = 1;
        for (const sub of substitutions) {
          durationMultTotal *= sub.durationChange;
        }
        totalHours = Math.ceil(totalHours * durationMultTotal);

        const newBeds = s.beds.map(b => b.id === bedId ? {
          ...b,
          status: "occupied" as const,
          assignedBeastId: beastId,
          assignedStaffId: staffId,
          treatmentProgress: 0,
          treatmentTotal: totalHours,
          result: "pending" as const,
          currentPrescriptionHerbs: [...herbIds],
          substitutions: [...substitutions],
          playerDiagnosis,
          startedAt: s.currentTime,
          beastSnapshot: {
            id: beast.id,
            breedId: beast.breedId,
            name: beast.name,
            disease: beast.disease,
            severity: beast.severity,
            satisfaction: beast.satisfaction,
            symptoms: beast.symptoms,
          },
        } : b);

        const newStaff = s.staff.map(st => st.id === staffId ? { ...st, status: "working" as const, assignedBedId: bedId } : st);

        const newDiscovered = s.discoveredBreeds.includes(beast.breedId)
          ? s.discoveredBreeds : [...s.discoveredBreeds, beast.breedId];

        set(st => ({
          waitingQueue: st.waitingQueue.filter(b => b.id !== beastId),
          beds: newBeds,
          staff: newStaff,
          inventory: newInventory,
          money: st.money - herbsCost,
          discoveredBreeds: newDiscovered,
          selectedBeastId: null,
        }));
        get()._addTransaction("expense", "药材消耗", herbsCost, `${beast.name} 治疗消耗药材`);
        const subNote = substitutions.length > 0 ? `（含${substitutions.length}味替代药材）` : "";
        get().addNotification("info", `${beast.name} 已入住 ${bed.name}，预计${totalHours}小时治疗${subNote}`);
      },

      collectFromBed: (bedId) => {
        const s = get();
        const bed = s.beds.find(b => b.id === bedId);
        if (!bed || bed.result === "pending" || !bed.beastSnapshot) return;
        const beast = bed.beastSnapshot;

        const bedBeastId = bed.assignedBeastId;
        const treatmentHerbs = bed.currentPrescriptionHerbs;
        const matchedPresc = PRESCRIPTIONS.find(p =>
          JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...treatmentHerbs].sort())
        );
        const usedPrescNames = matchedPresc ? matchedPresc.name : "自拟方";
        void usedPrescNames;

        const breed = BREEDS.find(b => b.id === (beast?.breedId || ""));

        if (bed.result === "success" && beast && breed) {
          const severityMult = { mild: 1, moderate: 1.4, severe: 1.8, critical: 2.3 }[beast.severity] || 1;
          const satMult = beast.satisfaction / 100;
          const reputationBonus = s.reputation / 100;
          const revenue = Math.floor(breed.baseFees * severityMult * (0.8 + 0.4 * satMult) * (1 + reputationBonus * 0.3));
          let repGain = Math.ceil(3 * severityMult * satMult);
          const trustGain = Math.ceil(10 * severityMult * satMult);

          const diagnosisCorrect = bed.playerDiagnosis === beast.disease;
          if (diagnosisCorrect) {
            repGain += 2;
          }

          let evolved = false;
          let newStage = 0;
          const prevRel = s.beastRelationships[breed.id];
          const prevVisits = prevRel?.visits ?? 0;
          const prevTrust = prevRel?.trust ?? 0;
          const newVisits = prevVisits + 1;
          const newTrust = prevTrust + trustGain;
          const nextStage = Math.floor(newTrust / 25);
          if (nextStage > (prevRel?.highestStage ?? 0) && breed.evolutionEmojis[nextStage]) {
            evolved = true;
            newStage = nextStage;
          }
          void newStage;

          const notes = rand(NOTES_SUCCESS);
          const days = 1;
          const daysToHeal = days;

          const record: MedicalRecord = {
            id: uid("rec"),
            beastId: bedBeastId!,
            breedId: breed.id,
            beastName: beast.name,
            date: `第${s.currentDay}天`,
            disease: beast.disease,
            severity: beast.severity,
            prescriptions: treatmentHerbs,
            substitutions: bed.substitutions || [],
            success: true,
            revenue,
            daysToHeal,
            evolved,
            notes: evolved ? `${notes} 灵兽发生了进化！` : notes,
          };

          const newRel: BeastRelationship = {
            breedId: breed.id,
            trust: newTrust,
            visits: newVisits,
            evolved: evolved || prevRel?.evolved || false,
            highestStage: Math.max(nextStage, prevRel?.highestStage ?? 0),
          };

          set(st => ({
            money: st.money + revenue,
            reputation: Math.min(100, st.reputation + repGain),
            beastRelationships: { ...st.beastRelationships, [breed.id]: newRel },
            medicalRecords: [record, ...st.medicalRecords],
          }));
          get()._addTransaction("income", "诊金收入", revenue, `治愈 ${breed.name}·${beast.name}${evolved ? "(进化加成)" : ""}`);
          const evolveMsg = evolved ? " 🎉灵兽发生进化！额外获得加成！" : "";
          const diagMsg = diagnosisCorrect ? " 🔍诊断正确！" : "";
          get().addNotification("success", `治愈成功！获得 ${revenue} 金，声望+${repGain}，亲密度+${trustGain}${diagMsg}${evolveMsg}`);
        } else if (bed.result === "fail" && beast) {
          const penaltyMoney = Math.floor(s.money * 0.05) + 20;
          const penaltyRep = 5;
          const breedName = breed?.name || "灵兽";

          const notes = rand(NOTES_FAIL);
          const record: MedicalRecord = {
            id: uid("rec"),
            beastId: bedBeastId!,
            breedId: beast.breedId,
            beastName: beast.name,
            date: `第${s.currentDay}天`,
            disease: beast.disease,
            severity: beast.severity,
            prescriptions: treatmentHerbs,
            substitutions: bed.substitutions || [],
            success: false,
            revenue: -penaltyMoney,
            daysToHeal: Math.max(1, Math.ceil((s.currentTime - (bed.startedAt ?? s.currentTime)) / 24) || 1),
            evolved: false,
            notes,
          };

          set(st => ({
            money: Math.max(0, st.money - penaltyMoney),
            reputation: Math.max(0, st.reputation - penaltyRep),
            medicalRecords: [record, ...st.medicalRecords],
          }));
          get()._addTransaction("expense", "误诊赔偿", penaltyMoney, `${breedName}·${beast.name} 治疗失败赔偿`);
          const realDiseaseName = DISEASE_NAMES[beast.disease];
          get().addNotification("error", `治疗失败！确诊为「${realDiseaseName}」。赔偿 ${penaltyMoney} 金，声望-${penaltyRep}`);
        }

        // Release staff & bed
        const newBeds = s.beds.map(b => b.id === bedId ? {
          ...b,
          status: "empty" as const,
          assignedBeastId: null,
          assignedStaffId: null,
          treatmentProgress: 0,
          treatmentTotal: 0,
          result: "pending" as const,
          currentPrescriptionHerbs: [],
          substitutions: [],
          playerDiagnosis: null,
          startedAt: null,
          beastSnapshot: null,
        } : b);
        const staffToRelease = bed.assignedStaffId;
        const newStaff = s.staff.map(st => st.id === staffToRelease ? {
          ...st, status: "idle" as const, assignedBedId: null,
        } : st);

        set({ beds: newBeds, staff: newStaff, selectedBedId: null });
      },

      _dailySettlement: () => {
        const s = get();
        const totalWage = s.staff.reduce((sum, st) => sum + st.dailyWage, 0);
        const day = s.currentDay;
        const newWeather = rand(WEATHERS);

        // 天气事件
        let eventMsg = "";
        let bonusMoney = 0;
        if (newWeather === "misty") { bonusMoney = -20; eventMsg = "大雾天气，客人稀少。"; }
        else if (newWeather === "stormy") { bonusMoney = -30; eventMsg = "雷暴天气，采购运输受阻。"; }
        else if (newWeather === "sunny") { bonusMoney = 10; eventMsg = "晴朗天气，心情舒畅。"; }

        const newRelStaff = s.staff.map(st => {
          const isAssignedToActiveBed = s.beds.some(b =>
            b.status === "occupied" && b.result === "pending" && b.assignedStaffId === st.id
          );
          if (isAssignedToActiveBed) return st;
          return { ...st, status: "idle" as const, assignedBedId: null };
        });

        set(st => ({
          currentDay: day + 1,
          currentTime: 8,
          weather: newWeather,
          staff: newRelStaff,
          money: Math.max(0, st.money - totalWage + bonusMoney),
          lastBeastSpawn: 8,
        }));
        get()._addTransaction("expense", "员工工资", totalWage, `第${day}天员工薪资`);
        if (bonusMoney !== 0) {
          get()._addTransaction(
            bonusMoney >= 0 ? "income" : "expense",
            "天气事件",
            Math.abs(bonusMoney),
            `第${day}天结算：${eventMsg} (${bonusMoney >= 0 ? "+" : ""}${bonusMoney}金)`
          );
        }
        get().addNotification("info", `=== 第${day}天结算 === 支付薪资${totalWage}金。${eventMsg} 新的一天开始啦！`);
      },

      resetGame: () => {
        set(buildInitialState());
        setTimeout(() => get()._spawnInitialBeasts(), 100);
      },

      tickGame: (steps = 1) => {
        for (let i = 0; i < steps; i++) {
          const s = get();
          if (s.isPaused) return;

          let newTime = s.currentTime + 1;
          let dayPassed = false;
          if (newTime >= 24) { dayPassed = true; }

          let state = { ...s };

          // 1. 队列恶化
          const newQueue: Beast[] = state.waitingQueue.map(b => {
            const waited = b.waitHours + 1;
            let sev = b.severity;
            let sat = Math.max(0, b.satisfaction - randomInt(2, 5));
            if (waited > 4 && sev === "mild") sev = "moderate";
            else if (waited > 7 && sev === "moderate") sev = "severe";
            else if (waited > 10 && sev === "severe") sev = "critical";
            return { ...b, waitHours: waited, severity: sev, satisfaction: sat };
          });
          const stillWaiting: Beast[] = [];
          let repLossQueue = 0;
          for (const b of newQueue) {
            if (b.waitHours > 14) {
              repLossQueue += 8;
              const breedName = BREEDS.find(x => x.id === b.breedId)?.name || "灵兽";
              get().addNotification("warning", `${breedName}·${b.name} 等待太久，失望离去。声望-8`);
            } else stillWaiting.push(b);
          }
          state.waitingQueue = stillWaiting;
          state.reputation = Math.max(0, state.reputation - repLossQueue);

          // 2. 治疗进度
          const newBeds = state.beds.map(b => {
            if (b.status !== "occupied" || b.result !== "pending") return b;
            const staffBonus = b.assignedStaffId ? 1.3 : 1;
            const newProgress = b.treatmentProgress + staffBonus;
            let result: TreatmentResult = b.result;
            if (newProgress >= b.treatmentTotal) {
              // 判定
              const herbs = b.currentPrescriptionHerbs;
              const matchedPresc = PRESCRIPTIONS.find(p =>
                JSON.stringify([...p.herbIds].sort()) === JSON.stringify([...herbs].sort())
              );
              let finalRate = matchedPresc ? matchedPresc.successRate : 30;
              // 员工加成
              if (b.assignedStaffId) {
                const stf = state.staff.find(x => x.id === b.assignedStaffId);
                finalRate += (stf?.skillLevel ?? 1) * 5;
              }
              // 疾病严重度减成
              const sev = b.beastSnapshot?.severity ?? "mild";
              const sevDebuff = { mild: 0, moderate: -5, severe: -10, critical: -15 }[sev] || 0;
              finalRate += sevDebuff;
              // 替代药材惩罚
              for (const sub of (b.substitutions || [])) {
                finalRate += sub.successRateChange;
              }
              finalRate = Math.max(5, Math.min(98, finalRate));
              result = Math.random() * 100 <= finalRate ? "success" : "fail";
            }
            return { ...b, treatmentProgress: Math.min(newProgress, b.treatmentTotal), result };
          });
          state.beds = newBeds;

          // 3. 新灵兽生成
          if (!dayPassed && newTime >= 8 && newTime < 21) {
            const chance = 0.25 + Math.min(0.3, state.currentDay * 0.015);
            if (newTime - state.lastBeastSpawn >= randomInt(1, 2) && Math.random() <= chance && state.waitingQueue.length < 6) {
              const nb = generateRandomBeast(state.currentDay, newTime);
              state.waitingQueue = [...state.waitingQueue, nb];
              state.lastBeastSpawn = newTime;
              const breed = BREEDS.find(b => b.id === nb.breedId);
              get().addNotification("info", `新客人：${breed?.name || "灵兽"}·${nb.name} 前来就诊`);
            }
          }

          state.currentTime = dayPassed ? 8 : newTime;

          set(state);
          if (dayPassed) get()._dailySettlement();
        }
      },
    }),
    {
      name: "beast-clinic-save",
      version: 1,
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
      onRehydrateStorage: () => (state) => {
        if (state && state.waitingQueue.length === 0 && state.medicalRecords.length === 0) {
          // 全新存档
          setTimeout(() => state._spawnInitialBeasts(), 100);
        }
      },
    }
  )
);
