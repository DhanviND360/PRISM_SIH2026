/**
 * PRISM ML — Types & Interfaces
 *
 * Clean interface for all PRISM predictive models and technical dimensions:
 *   - Cost Overrun Predictor (Binary Likelihood + ₹ Cr Magnitude)
 *   - Time Overrun Predictor (Delay Likelihood + Slippage in Months)
 *   - AI/ML vs. Conventional Statistical Benchmarking (Technical Dimension b)
 *   - Common Upload Form (CUF) Attribution & Gap Analysis (Technical Dimension c)
 */

export type MLTargetVariable = "COST_OVERRUN" | "SCHEDULE_DELAY";

export interface FeatureVector {
  /** Log-scaled original sanctioned cost */
  logOriginalCostCr: number;
  /** Physical progress percentage (0–1 normalized) */
  progressNorm: number;
  /** Months remaining to target date (negative = overdue) */
  monthsToTarget: number;
  /** Implied progress velocity: progress / elapsed time proxy */
  impliedVelocity: number;
  /** Sector historical risk weight */
  sectorRiskWeight: number;
}

/** A named feature with its importance weight and direction */
export interface FeatureImportance {
  featureName: string;
  label: string;
  weight: number;
  importance: number;
  direction: "INCREASES_RISK" | "DECREASES_RISK";
  projectValue: number;
  contribution: number;
}

/** Evaluation metrics computed from cross-validation */
export interface ModelEvaluation {
  looAccuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  mae: number | null;
  rmse: number | null;
  trainingSamples: number;
  positiveCount: number;
  negativeCount: number;
  baselineAccuracy: number;
  isSufficientSample: boolean;
  sampleAdequacyNote: string;
}

/** The complete Cost Overrun prediction result */
export interface MLCostPrediction {
  target: "COST_OVERRUN";
  targetDescription: string;
  prediction: boolean;
  predictionLabel: string;
  probability: number;
  confidenceLabel: "HIGH" | "MODERATE" | "LOW" | "UNCERTAIN";
  /** Continuous predicted cost escalation in ₹ Crore */
  predictedEscalationCr: number;
  /** Predicted overrun percentage */
  predictedOverrunPct: number;
  topFeatures: FeatureImportance[];
  evaluation: ModelEvaluation;
  modelId: string;
  predictedAt: string;
  isViable: boolean;
  nonViableReason: string | null;
}

/** The complete Schedule Delay prediction result */
export interface MLSchedulePrediction {
  target: "SCHEDULE_DELAY";
  targetDescription: string;
  prediction: boolean;
  predictionLabel: string;
  probability: number;
  confidenceLabel: "HIGH" | "MODERATE" | "LOW" | "UNCERTAIN";
  /** Continuous predicted delay in months beyond revised date */
  predictedDelayMonths: number;
  /** Projected revised date based on ML velocity extrapolation */
  projectedCompletionDate: string;
  velocityPaceStatus: "ON_TRACK" | "AT_RISK" | "CRITICAL_LAG";
  topFeatures: FeatureImportance[];
  evaluation: ModelEvaluation;
  modelId: string;
  predictedAt: string;
  isViable: boolean;
  nonViableReason: string | null;
}

// Backward compatibility alias for single prediction
export type MLPrediction = MLCostPrediction;

// ── Technical Dimension (b): AI/ML vs Conventional Statistical Baseline ─

export interface MetricComparisonRow {
  metricName: string;
  conventionalStatistical: string | number;
  machineLearningModel: string | number;
  gainDescription: string;
  mlOutperforms: boolean;
}

export interface MLBenchmarkReport {
  generatedAt: string;
  datasetSize: number;
  comparisonTable: MetricComparisonRow[];
  executiveSummary: string;
  methodologyNote: string;
  statisticalModelsEvaluated: string[];
  mlModelsEvaluated: string[];
}

// ── Technical Dimension (c): CUF Field Attribution Analysis ─────────────

export interface CUFFeatureAttributionItem {
  fieldName: string;
  category: "CURRENT_CUF" | "DESIRABLE_LATENT";
  varianceExplainedPct: number;
  description: string;
  dataStatus: "CAPTURED" | "PARTIALLY_CAPTURED" | "RECOMMENDED_FOR_CUF_V2";
}

export interface CUFAttributionReport {
  generatedAt: string;
  totalVarianceExplainedByCurrentCUF: number; // e.g. 61.4%
  totalVarianceUnexplainedOrLatent: number;  // e.g. 38.6%
  attributions: CUFFeatureAttributionItem[];
  keyMissingVariables: {
    field: string;
    impactRationale: string;
    suggestedIngestionMechanism: string;
  }[];
  policyRecommendationsForMoSPI: string[];
}
