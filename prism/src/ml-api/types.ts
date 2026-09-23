/**
 * PRISM ML — Types & Interfaces
 *
 * Clean interface between the ML prediction layer and the rest of PRISM.
 * The deterministic risk engine and ML predictor are kept completely separate
 * — they return different result types and the UI clearly labels each.
 */

export type MLTargetVariable = "COST_OVERRUN" | "SCHEDULE_DELAY";

export interface FeatureVector {
  /** Log-scaled original sanctioned cost. Reduces magnitude skew. */
  logOriginalCostCr: number;
  /** Physical progress percentage (0–1 normalized). */
  progressNorm: number;
  /** Months remaining to target date (negative = overdue). */
  monthsToTarget: number;
  /** Whether cost has already been revised upward. Binary. */
  hasAnyRevision: number;
}

/** A named feature with its importance weight and direction. */
export interface FeatureImportance {
  featureName: string;
  /** Human-readable label. */
  label: string;
  /** Model coefficient / weight. Positive = increases risk. */
  weight: number;
  /** Absolute importance (|weight|). */
  importance: number;
  /** Direction: "INCREASES_RISK" | "DECREASES_RISK" */
  direction: "INCREASES_RISK" | "DECREASES_RISK";
  /** The actual value of this feature for the current project. */
  projectValue: number;
  /** The contribution of this feature to the prediction (weight × value). */
  contribution: number;
}

/** Evaluation metrics actually computed from training/validation. */
export interface ModelEvaluation {
  /** Leave-one-out cross-validation accuracy, or null if not computable. */
  looAccuracy: number | null;
  /** Total training samples used. */
  trainingSamples: number;
  /** Positive class count in training data. */
  positiveCount: number;
  /** Negative class count in training data. */
  negativeCount: number;
  /** Majority-class baseline accuracy (what you'd get by always predicting the majority). */
  baselineAccuracy: number;
  /** Whether the sample is sufficient for reliable ML evaluation. */
  isSufficientSample: boolean;
  /** Human-readable assessment of sample adequacy. */
  sampleAdequacyNote: string;
  /** Number of LOO folds that were correct. */
  looCorrectCount: number | null;
}

/** The complete ML prediction result for a single project. */
export interface MLPrediction {
  /** Which target variable was predicted. */
  target: MLTargetVariable;
  /** Human-readable target description. */
  targetDescription: string;
  /** Binary prediction: true = positive class (overrun / delay). */
  prediction: boolean;
  /** Human-readable prediction label. */
  predictionLabel: string;
  /** Model-output probability (0–1). Only meaningful if model is calibrated. */
  probability: number;
  /** Confidence qualifier based on probability distance from 0.5. */
  confidenceLabel: "HIGH" | "MODERATE" | "LOW" | "UNCERTAIN";
  /** Ranked feature importances for this prediction. */
  topFeatures: FeatureImportance[];
  /** Evaluation metrics from training. */
  evaluation: ModelEvaluation;
  /** Model identifier for reproducibility. */
  modelId: string;
  /** Timestamp of prediction. */
  predictedAt: string;
  /** Whether the ML pipeline was able to produce a meaningful prediction. */
  isViable: boolean;
  /** If not viable, the reason. */
  nonViableReason: string | null;
}
