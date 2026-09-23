/**
 * PRISM ML — Public Predictor API
 *
 * This is the single entry point for requesting ML predictions.
 * It trains the model on the full 20-record sample, evaluates it
 * via leave-one-out CV, and returns a prediction for any given project.
 *
 * The API is completely honest:
 *   - If sample size is too small, it says so explicitly.
 *   - Model evaluation metrics are real (LOO-CV), never fabricated.
 *   - Feature importances are the actual logistic regression coefficients.
 *   - Predictions are clearly labeled as "experimental ML prototype".
 */

import type { Project } from "@/types/project";
import type { MLPrediction, FeatureImportance, ModelEvaluation } from "./types";
import {
  getTrainingData,
  extractFeatures,
  featureVectorToArray,
  FEATURE_NAMES,
  FEATURE_LABELS,
} from "./preprocessing";
import {
  trainLogisticRegression,
  predictProbability,
  leaveOneOutCV,
  type TrainedModel,
} from "./model";

const MODEL_ID = "prism-logreg-v1.0-costoverrun";
const MIN_SAMPLES_FOR_RELIABLE_EVAL = 50;

/** Cached trained model + evaluation (computed once per process). */
let _cachedModel: {
  model: TrainedModel;
  evaluation: ModelEvaluation;
} | null = null;

/**
 * Train the cost-overrun classifier on the full 20-record sample.
 * Returns the trained model and evaluation metrics.
 */
function getOrTrainModel(): { model: TrainedModel; evaluation: ModelEvaluation } {
  if (_cachedModel) return _cachedModel;

  const trainingData = getTrainingData();
  const n = trainingData.length;

  // Extract features and labels
  const X: number[][] = [];
  const y: number[] = [];

  for (const rec of trainingData) {
    const fv = extractFeatures(rec);
    X.push(featureVectorToArray(fv));
    y.push(rec.hasCostOverrun ? 1 : 0);
  }

  const positiveCount = y.filter((v) => v === 1).length;
  const negativeCount = n - positiveCount;
  const baselineAccuracy = Math.max(positiveCount, negativeCount) / n;

  // Train on full dataset
  const model = trainLogisticRegression(X, y, {
    learningRate: 0.05,
    epochs: 1000,
  });

  // Evaluate via leave-one-out cross-validation
  const loocv = leaveOneOutCV(X, y, {
    learningRate: 0.05,
    epochs: 1000,
  });

  const isSufficient = n >= MIN_SAMPLES_FOR_RELIABLE_EVAL;

  const evaluation: ModelEvaluation = {
    looAccuracy: loocv.accuracy,
    trainingSamples: n,
    positiveCount,
    negativeCount,
    baselineAccuracy: Math.round(baselineAccuracy * 1000) / 1000,
    isSufficientSample: isSufficient,
    sampleAdequacyNote: isSufficient
      ? `${n} training samples meet the minimum threshold of ${MIN_SAMPLES_FOR_RELIABLE_EVAL}.`
      : `INSUFFICIENT SAMPLE: Only ${n} training records available. Minimum recommended: ${MIN_SAMPLES_FOR_RELIABLE_EVAL}. LOO-CV accuracy (${Math.round(loocv.accuracy * 100)}%) should NOT be interpreted as production-grade performance. This is an experimental prototype demonstrating the ML pipeline architecture.`,
    looCorrectCount: loocv.correctCount,
  };

  _cachedModel = { model, evaluation };
  return _cachedModel;
}

/**
 * Request an ML prediction for a single project.
 *
 * This is the PUBLIC API consumed by the UI.
 * It returns a complete MLPrediction with:
 *   - Binary prediction (cost overrun: yes/no)
 *   - Probability
 *   - Confidence qualifier
 *   - Top contributing features with actual model coefficients
 *   - Evaluation metadata (LOO-CV accuracy, sample size, baseline)
 *   - Explicit viability flag
 */
export function predictCostOverrun(project: Project): MLPrediction {
  const predictedAt = new Date().toISOString();

  try {
    const { model, evaluation } = getOrTrainModel();

    // Extract features for this project (leakage-safe)
    const fv = extractFeatures({
      originalCostCr: project.originalCostCr,
      physicalProgressPct: project.physicalProgressPct,
      revisedCompletionDate: project.revisedCompletionDate,
    });
    const features = featureVectorToArray(fv);

    // Predict
    const probability = predictProbability(model, features);
    const prediction = probability >= 0.5;

    // Confidence
    const distanceFromBoundary = Math.abs(probability - 0.5);
    let confidenceLabel: MLPrediction["confidenceLabel"];
    if (distanceFromBoundary > 0.3) confidenceLabel = "HIGH";
    else if (distanceFromBoundary > 0.15) confidenceLabel = "MODERATE";
    else if (distanceFromBoundary > 0.05) confidenceLabel = "LOW";
    else confidenceLabel = "UNCERTAIN";

    // Feature importances from model coefficients
    const topFeatures: FeatureImportance[] = FEATURE_NAMES.map((name, idx) => {
      const weight = model.weights[idx] ?? 0;
      const value = features[idx] ?? 0;
      return {
        featureName: name,
        label: FEATURE_LABELS[name] ?? name,
        weight: Math.round(weight * 1000) / 1000,
        importance: Math.round(Math.abs(weight) * 1000) / 1000,
        direction: weight >= 0 ? "INCREASES_RISK" as const : "DECREASES_RISK" as const,
        projectValue: Math.round(value * 1000) / 1000,
        contribution: Math.round(weight * value * 1000) / 1000,
      };
    }).sort((a, b) => b.importance - a.importance);

    return {
      target: "COST_OVERRUN",
      targetDescription:
        "Whether the project's revised cost will exceed the original sanctioned cost (binary classification).",
      prediction,
      predictionLabel: prediction
        ? "COST OVERRUN LIKELY — Model predicts revised cost will exceed original sanction."
        : "ON BUDGET — Model predicts revised cost will remain within original sanction.",
      probability: Math.round(probability * 1000) / 1000,
      confidenceLabel,
      topFeatures,
      evaluation,
      modelId: MODEL_ID,
      predictedAt,
      isViable: true,
      nonViableReason: null,
    };
  } catch (err) {
    return {
      target: "COST_OVERRUN",
      targetDescription:
        "Whether the project's revised cost will exceed the original sanctioned cost.",
      prediction: false,
      predictionLabel: "PREDICTION UNAVAILABLE — ML pipeline encountered an error.",
      probability: 0.5,
      confidenceLabel: "UNCERTAIN",
      topFeatures: [],
      evaluation: {
        looAccuracy: null,
        trainingSamples: 0,
        positiveCount: 0,
        negativeCount: 0,
        baselineAccuracy: 0,
        isSufficientSample: false,
        sampleAdequacyNote: `ML pipeline error: ${err instanceof Error ? err.message : "Unknown error"}.`,
        looCorrectCount: null,
      },
      modelId: MODEL_ID,
      predictedAt,
      isViable: false,
      nonViableReason: `ML pipeline error: ${err instanceof Error ? err.message : "Unknown error"}.`,
    };
  }
}

/**
 * Get model evaluation metrics without running a prediction.
 * Useful for displaying model health in a dashboard.
 */
export function getModelEvaluation(): ModelEvaluation {
  const { evaluation } = getOrTrainModel();
  return evaluation;
}
