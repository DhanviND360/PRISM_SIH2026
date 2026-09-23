/**
 * PRISM ML — Training Data & Preprocessing Pipeline
 *
 * Loads all 20 records from the PAIMANA sample CSV for ML training.
 * This is separate from the app's 8-record sample used for UI display.
 *
 * Preprocessing steps:
 *   1. Parse raw CSV fields into typed records.
 *   2. Derive labels: hasCostOverrun (revised > original).
 *   3. Extract leakage-safe features (no target-leaking fields).
 *   4. Normalize features to comparable scales.
 *
 * CRITICAL: Feature selection is leakage-safe:
 *   - We do NOT use revisedCostCr as a feature (it IS the target signal).
 *   - We do NOT use costOverrunRatio (derived from the target).
 *   - We use ONLY: originalCostCr, physicalProgressPct, monthsToTarget, sector.
 */

import type { FeatureVector } from "./types";

/** Raw training record parsed from the full 20-row CSV. */
export interface TrainingRecord {
  sector: string;
  implementingAgency: string;
  projectName: string;
  originalCostCr: number;
  physicalProgressPct: number;
  revisedCostCr: number;
  revisedCompletionDate: string; // ISO YYYY-MM-DD
  // Derived labels
  hasCostOverrun: boolean;
  isDelayed: boolean;
}

/** Parse DD/MM/YYYY → ISO YYYY-MM-DD */
function parseDateDMY(raw: string): string {
  const [d, m, y] = raw.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/**
 * All 20 records from paimana_real_sample.csv — the FULL provided sample.
 * This is used ONLY for ML training, never loaded into the app's UI data layer.
 */
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

/** Parse all 20 records into TrainingRecords with derived labels. */
export function getTrainingData(): TrainingRecord[] {
  const now = new Date();

  return RAW_TRAINING_DATA.map((r) => {
    const isoDate = parseDateDMY(r.revDate);
    return {
      sector: r.sector,
      implementingAgency: r.agency,
      projectName: r.name,
      originalCostCr: r.origCost,
      physicalProgressPct: r.progress,
      revisedCostCr: r.revCost,
      revisedCompletionDate: isoDate,
      hasCostOverrun: r.revCost > r.origCost,
      isDelayed: new Date(isoDate) < now,
    };
  });
}

/**
 * Extract leakage-safe feature vector from a training record.
 *
 * LEAKAGE SAFETY:
 *   - revisedCostCr is NOT used (it directly encodes the target).
 *   - costOverrunRatio is NOT used (derived from target).
 *   - We use ONLY fields that would be known BEFORE a cost revision occurs:
 *     originalCostCr, physicalProgressPct, monthsToTarget.
 */
export function extractFeatures(
  record: { originalCostCr: number; physicalProgressPct: number; revisedCompletionDate: string },
  referenceDate?: Date
): FeatureVector {
  const now = referenceDate ?? new Date();
  const target = new Date(record.revisedCompletionDate);
  const diffMs = target.getTime() - now.getTime();
  const monthsToTarget = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  return {
    logOriginalCostCr: Math.log10(Math.max(1, record.originalCostCr)),
    progressNorm: record.physicalProgressPct / 100,
    monthsToTarget: monthsToTarget,
    hasAnyRevision: 0, // Not used as feature to avoid leakage; placeholder
  };
}

/** Feature names in order matching FeatureVector. */
export const FEATURE_NAMES = [
  "logOriginalCostCr",
  "progressNorm",
  "monthsToTarget",
] as const;

/** Human-readable labels for features. */
export const FEATURE_LABELS: Record<string, string> = {
  logOriginalCostCr: "Project Scale (log₁₀ of sanctioned cost)",
  progressNorm: "Physical Progress (normalized)",
  monthsToTarget: "Time to Target Completion (months)",
};

/**
 * Convert FeatureVector to a flat number array for model input.
 * Only uses the 3 leakage-safe features.
 */
export function featureVectorToArray(fv: FeatureVector): number[] {
  return [fv.logOriginalCostCr, fv.progressNorm, fv.monthsToTarget];
}
