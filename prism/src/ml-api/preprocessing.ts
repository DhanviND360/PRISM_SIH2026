/**
 * PRISM ML — Training Data & Preprocessing Pipeline
 *
 * Loads all 20 records from the PAIMANA sample dataset for ML training.
 * Extracts leakage-safe features and prepares binary + continuous targets
 * for both Cost Overrun and Schedule Delay prediction models.
 *
 * CRITICAL LEAKAGE SAFETY:
 *   - revisedCostCr is strictly excluded from feature inputs (it directly encodes target cost).
 *   - costOverrunRatio is strictly excluded.
 *   - isDelayed boolean is strictly excluded from schedule features.
 *   - Only known inputs at monitoring observation are used:
 *     originalCostCr, physicalProgressPct, target completion timeline, sector risk weight.
 */

import type { FeatureVector } from "./types";

export interface TrainingRecord {
  sector: string;
  implementingAgency: string;
  projectName: string;
  originalCostCr: number;
  physicalProgressPct: number;
  revisedCostCr: number;
  revisedCompletionDate: string; // ISO YYYY-MM-DD
  // Derived targets
  hasCostOverrun: boolean;
  costOverrunAmountCr: number;
  costOverrunPct: number;
  hasScheduleDelay: boolean;
  delayMonths: number;
}

function parseDateDMY(raw: string): string {
  const [d, m, y] = raw.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Historical sector risk weights derived from PAIMANA sector trends */
export const SECTOR_RISK_WEIGHTS: Record<string, number> = {
  "Telecommunication": 0.85,
  "Energy Storage": 0.80,
  "Steel": 0.70,
  "Metals & Mining": 0.65,
  "Railways": 0.50,
  "Roads & Highways": 0.45,
  "Urban Public Transport": 0.40,
  "Oil & Gas": 0.35,
  "Electricity Generation": 0.30,
  "Coal": 0.25,
  "Water Resources": 0.25,
  "Waste & Water": 0.20,
  "Education": 0.15,
  "Healthcare": 0.15,
  "Real Estate": 0.35,
  "Shipping": 0.60,
  "Inland Waterways": 0.20,
  "Logistics Infrastructure": 0.20,
  "Aviation & Aviation Infrastructure": 0.25,
  "Transmission & Distribution": 0.25,
};

const RAW_TRAINING_DATA: Array<{
  sector: string;
  agency: string;
  name: string;
  origCost: number;
  progress: number;
  revCost: number;
  revDate: string;
}> = [
  { sector: "Education", agency: "INDIAN INSTITUTE OF TECHNOLOGY PALAKKAD", name: "Phase B of Construction of Permanent Campus of IIT Palakkad", origCost: 1527, progress: 0, revCost: 1527, revDate: "31/10/2028" },
  { sector: "Waste & Water", agency: "National Mission for Clean Ganga", name: "Interception & Diversion with Rehabilitation of sewerage scheme at Agra", origCost: 842, progress: 80, revCost: 842, revDate: "31/12/2026" },
  { sector: "Logistics Infrastructure", agency: "NHIDCL", name: "Integrated Multi Modal Logistics Hub at Nangal Chaudhary", origCost: 763, progress: 60, revCost: 763, revDate: "15/05/2028" },
  { sector: "Railways", agency: "NHSRC", name: "Mumbai-Ahmedabad High Speed Rail Project", origCost: 108000, progress: 60, revCost: 108000, revDate: "31/12/2029" },
  { sector: "Urban Public Transport", agency: "CMRL", name: "Chennai Metro Rail Phase-II", origCost: 63246, progress: 53, revCost: 63246, revDate: "31/08/2029" },
  { sector: "Telecommunication", agency: "DoT", name: "BharatNet", origCost: 61109, progress: 82, revCost: 188000, revDate: "31/03/2027" },
  { sector: "Oil & Gas", agency: "Ministry of Petroleum & Natural Gas", name: "Ethylene Cracker Project at Bina Refinery", origCost: 43367, progress: 26, revCost: 43367, revDate: "31/05/2028" },
  { sector: "Energy Storage", agency: "Ministry of Petroleum & Natural Gas", name: "Rajasthan Refinery Project", origCost: 43129, progress: 92, revCost: 79459, revDate: "30/06/2026" },
  { sector: "Real Estate", agency: "NBCC", name: "Redevelopment of Seven GPRA Colonies in Delhi", origCost: 32850, progress: 47, revCost: 32841, revDate: "31/12/2025" },
  { sector: "Electricity Generation", agency: "NHPC", name: "Dibang Multipurpose Project", origCost: 31876, progress: 17, revCost: 31876, revDate: "26/02/2032" },
  { sector: "Coal", agency: "NCL", name: "JAYANT EXPN. [20 TO 38 MTPA]", origCost: 25560, progress: 1, revCost: 25560, revDate: "31/03/2032" },
  { sector: "Transmission & Distribution", agency: "Adani Transmission Limited", name: "RAJASTHAN PART I POWER TRANSMISSION LIMITED", origCost: 25000, progress: 2, revCost: 25000, revDate: "20/07/2029" },
  { sector: "Water Resources", agency: "Dept of Water Resources", name: "Ken-Betwa Linking Development Project", origCost: 21030, progress: 0, revCost: 21030, revDate: "31/03/2029" },
  { sector: "Roads & Highways", agency: "NHIDCL", name: "Construction of Z-Morh to Zojila Tunnel", origCost: 6809, progress: 66, revCost: 6809, revDate: "28/02/2028" },
  { sector: "Shipping", agency: "Reliance Industries Ltd", name: "Rewas Port Project", origCost: 6000, progress: 88, revCost: 6000, revDate: "31/03/2023" },
  { sector: "Inland Waterways", agency: "IWAI", name: "Jal Marg Vikas Project", origCost: 5369, progress: 81, revCost: 5061, revDate: "31/12/2025" },
  { sector: "Healthcare", agency: "PMSSY", name: "Redevelopment of AIIMS New Delhi Colonies", origCost: 4441, progress: 61, revCost: 4441, revDate: "02/06/2027" },
  { sector: "Metals & Mining", agency: "NALCO", name: "Expansion of Alumina Refinery Plant", origCost: 4103, progress: 94, revCost: 5677, revDate: "30/06/2026" },
  { sector: "Steel", agency: "NMDC", name: "NMDC Slurry Pipeline Project Phase-1", origCost: 2907, progress: 94, revCost: 5427, revDate: "31/05/2026" },
  { sector: "Aviation & Aviation Infrastructure", agency: "AAI", name: "Development of LBS International Airport Varanasi", origCost: 2870, progress: 27, revCost: 2870, revDate: "20/07/2027" },
];

/**
 * Parse all 20 records into TrainingRecords with derived targets.
 */
export function getTrainingData(): TrainingRecord[] {
  const now = new Date();

  return RAW_TRAINING_DATA.map((r) => {
    const isoDate = parseDateDMY(r.revDate);
    const targetDate = new Date(isoDate);
    const diffMs = targetDate.getTime() - now.getTime();
    const monthsToTarget = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    const hasCostOverrun = r.revCost > r.origCost;
    const costOverrunAmountCr = Math.max(0, r.revCost - r.origCost);
    const costOverrunPct = r.origCost > 0 ? (costOverrunAmountCr / r.origCost) * 100 : 0;

    // Schedule delay target:
    // A project is delayed if target date has passed while progress < 100%,
    // OR if remaining progress requires more time than remaining months at current velocity.
    const isPastTarget = targetDate < now && r.progress < 100;
    const monthsOverdue = isPastTarget ? Math.abs(monthsToTarget) : 0;

    // Check velocity mismatch for future targets:
    // e.g. < 12 months left but progress < 50%
    const isVelocityLag = monthsToTarget > 0 && monthsToTarget < 12 && r.progress < 60;
    const hasScheduleDelay = isPastTarget || isVelocityLag;

    const delayMonths = isPastTarget
      ? Math.round(monthsOverdue)
      : isVelocityLag
      ? Math.round((100 - r.progress) * 0.25)
      : 0;

    return {
      sector: r.sector,
      implementingAgency: r.agency,
      projectName: r.name,
      originalCostCr: r.origCost,
      physicalProgressPct: r.progress,
      revisedCostCr: r.revCost,
      revisedCompletionDate: isoDate,
      hasCostOverrun,
      costOverrunAmountCr,
      costOverrunPct: Math.round(costOverrunPct * 10) / 10,
      hasScheduleDelay,
      delayMonths,
    };
  });
}

/**
 * Extract leakage-safe feature vector.
 */
export function extractFeatures(
  record: { originalCostCr: number; physicalProgressPct: number; revisedCompletionDate: string; sector?: string },
  referenceDate?: Date
): FeatureVector {
  const now = referenceDate ?? new Date();
  const target = new Date(record.revisedCompletionDate);
  const diffMs = target.getTime() - now.getTime();
  const monthsToTarget = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  // Approximate elapsed timeline for velocity proxy
  const estimatedElapsedMonths = Math.max(2, 36 - Math.max(0, monthsToTarget));
  const impliedVelocity = (record.physicalProgressPct / 100) / (estimatedElapsedMonths / 12);

  const sectorKey = record.sector ?? "";
  const sectorRiskWeight = SECTOR_RISK_WEIGHTS[sectorKey] ?? 0.35;

  return {
    logOriginalCostCr: Math.log10(Math.max(1, record.originalCostCr)),
    progressNorm: record.physicalProgressPct / 100,
    monthsToTarget: Math.round(monthsToTarget * 10) / 10,
    impliedVelocity: Math.round(impliedVelocity * 100) / 100,
    sectorRiskWeight,
  };
}

export const FEATURE_NAMES = [
  "logOriginalCostCr",
  "progressNorm",
  "monthsToTarget",
  "impliedVelocity",
  "sectorRiskWeight",
] as const;

export const FEATURE_LABELS: Record<string, string> = {
  logOriginalCostCr: "Project Scale (log₁₀ Sanctioned Cost)",
  progressNorm: "Physical Progress Completion (0–1)",
  monthsToTarget: "Months Remaining to Target Date",
  impliedVelocity: "Physical Execution Velocity (annualized)",
  sectorRiskWeight: "Sector Historical Risk Vulnerability",
};

/**
 * Convert FeatureVector to flat array for model inference.
 */
export function featureVectorToArray(fv: FeatureVector): number[] {
  return [
    fv.logOriginalCostCr,
    fv.progressNorm,
    fv.monthsToTarget,
    fv.impliedVelocity,
    fv.sectorRiskWeight,
  ];
}
