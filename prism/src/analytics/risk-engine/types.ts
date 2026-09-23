/**
 * PRISM Risk Engine — Core Types & Interfaces
 *
 * Every risk computation is expressed through these types.
 * The engine is modular: each risk dimension is an independent
 * predictor function, replaceable by a trained ML model later.
 */

import type { RiskLevel } from "@/analytics/portfolio-stats";

// ── Data-completeness ───────────────────────────────────────────────────

/** Which PAIMANA fields were available vs. required for the computation. */
export interface DataCompleteness {
  /** Total fields the engine attempted to use. */
  totalFields: number;
  /** Fields that had valid, non-null data. */
  availableFields: number;
  /** Human-readable percentage string. */
  completenessPercent: number;
  /** List of fields that were missing or unusable. */
  missingFields: string[];
  /** List of fields that contributed to the score. */
  usedFields: string[];
}

// ── Evidence ────────────────────────────────────────────────────────────

/** A single piece of evidence supporting a risk assessment. */
export interface EvidenceItem {
  /** Human-readable label for the metric. */
  label: string;
  /** Source field from PAIMANA / Project schema. */
  sourceField: string;
  /** The actual raw value observed. */
  observedValue: string;
  /** The baseline or expected value. */
  baselineValue: string;
  /** Deviation from baseline (positive = worse). */
  deviationPercent: number;
  /** Whether this evidence contributed to risk. */
  isRiskContributor: boolean;
}

// ── Contributing Factor ─────────────────────────────────────────────────

/** A structured explanation of WHY a dimension is flagged. */
export interface ContributingFactor {
  /** Human-readable factor title. */
  title: string;
  /** Detailed description with actual numbers. */
  description: string;
  /** Risk severity of this specific factor. */
  severity: RiskLevel;
  /** Contribution weight to the dimension score (0-1). */
  weight: number;
  /** Raw numerical impact value (₹ Cr or % or months). */
  impactValue: number;
  /** Unit of the impact value. */
  impactUnit: string;
}

// ── Individual Risk Dimension ───────────────────────────────────────────

/** Result from a single risk-dimension predictor. */
export interface RiskDimensionResult {
  /** Dimension identifier. */
  dimension: "COST" | "SCHEDULE" | "IMPLEMENTATION";
  /** Human-readable dimension name. */
  label: string;
  /** Score 0–100 (0 = no risk, 100 = critical). */
  score: number;
  /** Classified level. */
  level: RiskLevel;
  /** Evidence items that produced this score. */
  evidence: EvidenceItem[];
  /** Structured factors explaining the score. */
  contributingFactors: ContributingFactor[];
  /** Method used: "DETERMINISTIC" for baseline calcs, "ML_MODEL" later. */
  method: "DETERMINISTIC" | "ML_MODEL";
  /** Short description of the calculation methodology. */
  methodDescription: string;
}

// ── Overall Project Risk Assessment ─────────────────────────────────────

export interface ProjectRiskAssessment {
  /** Project ID this assessment belongs to. */
  projectId: string;
  /** Timestamp of computation (ISO-8601). */
  computedAt: string;

  /** Composite risk score 0–100. */
  overallScore: number;
  /** Overall risk level. */
  overallLevel: RiskLevel;

  /** Individual dimension results (always 3). */
  dimensions: RiskDimensionResult[];

  /** Data completeness indicator. */
  dataCompleteness: DataCompleteness;

  /** WHAT is happening — plain-language summary. */
  whatSummary: string;
  /** WHY the system considers it risky — plain-language summary. */
  whySummary: string;
  /** EVIDENCE — plain-language summary of supporting data points. */
  evidenceSummary: string;

  /** Engine version for reproducibility tracking. */
  engineVersion: string;
}
