export type Element = "fire" | "water" | "wood" | "thunder" | "earth" | "light" | "dark";

export type DiseaseType =
  | "fever"
  | "cold"
  | "poisoning"
  | "fatigue"
  | "fracture"
  | "mana_disorder"
  | "curse"
  | "parasite"
  | "dehydration"
  | "allergy";

export type Severity = "mild" | "moderate" | "severe" | "critical";

export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "misty";

export type StaffStatus = "idle" | "working" | "resting";

export type BedStatus = "empty" | "occupied" | "cleaning";

export type TreatmentResult = "pending" | "success" | "fail" | "worsen";

export interface Breed {
  id: string;
  name: string;
  emoji: string;
  element: Element;
  rarity: 1 | 2 | 3 | 4 | 5;
  description: string;
  evolutionEmojis: string[];
  evolvesAt: number;
  baseFees: number;
}

export interface Herb {
  id: string;
  name: string;
  emoji: string;
  element: Element | "neutral";
  price: number;
  description: string;
}

export interface Prescription {
  id: string;
  disease: DiseaseType;
  herbIds: string[];
  successRate: number;
  name: string;
}

export interface Beast {
  id: string;
  breedId: string;
  name: string;
  age: number;
  stage: number;
  disease: DiseaseType;
  severity: Severity;
  symptoms: string[];
  trustLevel: number;
  waitHours: number;
  satisfaction: number;
  ownerName: string;
  arrivedAt: number;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  emoji: string;
  skillLevel: number;
  status: StaffStatus;
  assignedBedId: string | null;
  dailyWage: number;
}

export interface Bed {
  id: string;
  name: string;
  status: BedStatus;
  assignedBeastId: string | null;
  assignedStaffId: string | null;
  treatmentProgress: number;
  treatmentTotal: number;
  result: TreatmentResult;
  currentPrescriptionHerbs: string[];
  substitutions: SubstitutionRecord[];
  playerDiagnosis: DiseaseType | null;
  startedAt: number | null;
  beastSnapshot: {
    id: string;
    breedId: string;
    name: string;
    disease: DiseaseType;
    severity: Severity;
    satisfaction: number;
    symptoms: string[];
  } | null;
}

export interface Treatment {
  id: string;
  beastId: string;
  bedId: string;
  prescriptionHerbs: string[];
  progress: number;
  total: number;
  result: TreatmentResult;
  staffAssigned: boolean;
}

export interface MedicalRecord {
  id: string;
  beastId: string;
  breedId: string;
  beastName: string;
  date: string;
  disease: DiseaseType;
  severity: Severity;
  prescriptions: string[];
  substitutions: SubstitutionRecord[];
  success: boolean;
  revenue: number;
  daysToHeal: number;
  evolved: boolean;
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  day: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

export interface BeastRelationship {
  breedId: string;
  trust: number;
  visits: number;
  evolved: boolean;
  highestStage: number;
}

export type SubstitutionReason = "same_element" | "similar_effect";

export interface SubstitutionRule {
  originalHerbId: string;
  substituteHerbId: string;
  reason: SubstitutionReason;
  costMultiplier: number;
  successRatePenalty: number;
  durationMultiplier: number;
}

export interface SubstitutionRecord {
  originalHerbId: string;
  substituteHerbId: string;
  reason: SubstitutionReason;
  reasonText: string;
  costChange: number;
  successRateChange: number;
  durationChange: number;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
}
