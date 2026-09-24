/**
 * PRISM ML — Public Predictor API
 *
 * Primary entry point for all PRISM predictive models:
 *   1. `predictCostOverrun(project)`: Classification (Likelihood) + Regression (₹ Cr Magnitude).
 *   2. `predictScheduleDelay(project)`: Classification (Likelihood) + Regression (Slippage Months).
 *   3. `getMLBenchmarkReport()`: Conventional Statistical EVM vs. AI/ML Benchmark (Dimension b).
 *   4. `getCUFAttributionReport()`: CUF Field Attribution & Data Gap Analysis (Dimension c).
 */

import type { Project } from "@/types/project";
import type {
  MLCostPrediction,
  MLSchedulePrediction,
  FeatureImportance,
  ModelEvaluation,
  MLBenchmarkReport,
  CUFAttributionReport,
} from "./types";
import {
  getTrainingData,
  extractFeatures,
  featureVectorToArray,
  FEATURE_NAMES,
  FEATURE_LABELS,
} from "./preprocessing";
import {
  trainLogisticRegression,
  trainRidgeRegression,
  predictProbability,
  predictContinuous,
  leaveOneOutCV,
  leaveOneOutRegressionCV,
  type TrainedClassificationModel,
  type TrainedRegressionModel,
} from "./model";
import { generateMLBenchmarkReport } from "./benchmark";
import { generateCUFAttributionReport } from "./cuf-attribution";

const COST_MODEL_ID = "prism-cost-v2.0-regularized";
const SCHED_MODEL_ID = "prism-sched-v2.0-regularized";
const MIN_SAMPLES_FOR_RELIABLE_EVAL = 50;

interface CachedPipeline {
  costClassifier: TrainedClassificationModel;
  costRegressor: TrainedRegressionModel;
  costEvaluation: ModelEvaluation;
  schedClassifier: TrainedClassificationModel;
  schedRegressor: TrainedRegressionModel;
  schedEvaluation: ModelEvaluation;
}

let _cachedPipeline: CachedPipeline | null = null;

function getOrTrainPipeline(): CachedPipeline {
  if (_cachedPipeline) return _cachedPipeline;

  const trainingData = getTrainingData();
  const n = trainingData.length;

  const X: number[][] = [];
  const yCostBinary: number[] = [];
  const yCostAmount: number[] = [];
  const ySchedBinary: number[] = [];
  const ySchedMonths: number[] = [];

  for (const rec of trainingData) {
    const fv = extractFeatures(rec);
    X.push(featureVectorToArray(fv));
    yCostBinary.push(rec.hasCostOverrun ? 1 : 0);
    yCostAmount.push(rec.costOverrunAmountCr);
    ySchedBinary.push(rec.hasScheduleDelay ? 1 : 0);
    ySchedMonths.push(rec.delayMonths);
  }

  // ── Cost Models ───────────────────────────────────────────────────────
  const costClassifier = trainLogisticRegression(X, yCostBinary, {
    learningRate: 0.05,
    epochs: 1000,
    l2Lambda: 0.01,
  });

  const costRegressor = trainRidgeRegression(X, yCostAmount, {
    learningRate: 0.02,
    epochs: 800,
    l2Lambda: 0.05,
  });

  const costLooClass = leaveOneOutCV(X, yCostBinary, { learningRate: 0.05, epochs: 1000 });
  const costLooReg = leaveOneOutRegressionCV(X, yCostAmount, { learningRate: 0.02, epochs: 800 });

  const costPosCount = yCostBinary.filter((v) => v === 1).length;
  const costBaselineAcc = Math.max(costPosCount, n - costPosCount) / n;

  const costEvaluation: ModelEvaluation = {
    looAccuracy: costLooClass.accuracy,
    precision: costLooClass.precision,
    recall: costLooClass.recall,
    f1Score: costLooClass.f1Score,
    mae: costLooReg.mae,
    rmse: costLooReg.rmse,
    trainingSamples: n,
    positiveCount: costPosCount,
    negativeCount: n - costPosCount,
    baselineAccuracy: Math.round(costBaselineAcc * 1000) / 1000,
    isSufficientSample: n >= MIN_SAMPLES_FOR_RELIABLE_EVAL,
    sampleAdequacyNote: `${n} records used. Model applies L2 regularization to prevent overfitting on sample data.`,
  };

  // ── Schedule Delay Models ─────────────────────────────────────────────
  const schedClassifier = trainLogisticRegression(X, ySchedBinary, {
    learningRate: 0.05,
    epochs: 1000,
    l2Lambda: 0.01,
  });

  const schedRegressor = trainRidgeRegression(X, ySchedMonths, {
    learningRate: 0.02,
    epochs: 800,
    l2Lambda: 0.05,
  });

  const schedLooClass = leaveOneOutCV(X, ySchedBinary, { learningRate: 0.05, epochs: 1000 });
  const schedLooReg = leaveOneOutRegressionCV(X, ySchedMonths, { learningRate: 0.02, epochs: 800 });

  const schedPosCount = ySchedBinary.filter((v) => v === 1).length;
  const schedBaselineAcc = Math.max(schedPosCount, n - schedPosCount) / n;

  const schedEvaluation: ModelEvaluation = {
    looAccuracy: schedLooClass.accuracy,
    precision: schedLooClass.precision,
    recall: schedLooClass.recall,
    f1Score: schedLooClass.f1Score,
    mae: schedLooReg.mae,
    rmse: schedLooReg.rmse,
    trainingSamples: n,
    positiveCount: schedPosCount,
    negativeCount: n - schedPosCount,
    baselineAccuracy: Math.round(schedBaselineAcc * 1000) / 1000,
    isSufficientSample: n >= MIN_SAMPLES_FOR_RELIABLE_EVAL,
    sampleAdequacyNote: `${n} records used. Schedule delay evaluated with multi-factor velocity calibration.`,
  };

  _cachedPipeline = {
    costClassifier,
    costRegressor,
    costEvaluation,
    schedClassifier,
    schedRegressor,
    schedEvaluation,
  };

  return _cachedPipeline;
}

// ── Public Predictor: Cost Overrun (Outcome a) ──────────────────────────

export function predictCostOverrun(project: Project): MLCostPrediction {
  const predictedAt = new Date().toISOString();

  try {
    const pipeline = getOrTrainPipeline();
    const fv = extractFeatures({
      originalCostCr: project.originalCostCr,
      physicalProgressPct: project.physicalProgressPct,
      revisedCompletionDate: project.revisedCompletionDate,
      sector: project.sector,
    });
    const features = featureVectorToArray(fv);

    // Probability & Classification
    const probability = predictProbability(pipeline.costClassifier, features);
    const prediction = probability >= 0.5;

    // Continuous magnitude prediction (₹ Cr)
    let predictedEscalationCr = Math.max(0, predictContinuous(pipeline.costRegressor, features));
    predictedEscalationCr = Math.round(predictedEscalationCr);

    // If probability is very low, clamp escalation to 0
    if (!prediction && probability < 0.35) {
      predictedEscalationCr = 0;
    }

    const predictedOverrunPct = project.originalCostCr > 0
      ? Math.round((predictedEscalationCr / project.originalCostCr) * 1000) / 10
      : 0;

    // Confidence qualifier
    const dist = Math.abs(probability - 0.5);
    let confidenceLabel: MLCostPrediction["confidenceLabel"];
    if (dist > 0.3) confidenceLabel = "HIGH";
    else if (dist > 0.15) confidenceLabel = "MODERATE";
    else if (dist > 0.05) confidenceLabel = "LOW";
    else confidenceLabel = "UNCERTAIN";

    // Feature importances
    const topFeatures: FeatureImportance[] = FEATURE_NAMES.map((name, idx) => {
      const weight = pipeline.costClassifier.weights[idx] ?? 0;
      const value = features[idx] ?? 0;
      return {
        featureName: name,
        label: FEATURE_LABELS[name] ?? name,
        weight: Math.round(weight * 1000) / 1000,
        importance: Math.round(Math.abs(weight) * 1000) / 1000,
        direction: weight >= 0 ? ("INCREASES_RISK" as const) : ("DECREASES_RISK" as const),
        projectValue: Math.round(value * 1000) / 1000,
        contribution: Math.round(weight * value * 1000) / 1000,
      };
    }).sort((a, b) => b.importance - a.importance);

    return {
      target: "COST_OVERRUN",
      targetDescription: "Binary overrun probability and continuous magnitude forecast (₹ Cr).",
      prediction,
      predictionLabel: prediction
        ? `COST OVERRUN LIKELY (+₹ ${predictedEscalationCr.toLocaleString("en-IN")} Cr expected)`
        : "ON BUDGET — Capital expenditure within sanctioned limit",
      probability: Math.round(probability * 1000) / 1000,
      confidenceLabel,
      predictedEscalationCr,
      predictedOverrunPct,
      topFeatures,
      evaluation: pipeline.costEvaluation,
      modelId: COST_MODEL_ID,
      predictedAt,
      isViable: true,
      nonViableReason: null,
    };
  } catch (err) {
    return {
      target: "COST_OVERRUN",
      targetDescription: "Cost overrun estimation pipeline.",
      prediction: false,
      predictionLabel: "PREDICTION UNAVAILABLE",
      probability: 0.5,
      confidenceLabel: "UNCERTAIN",
      predictedEscalationCr: 0,
      predictedOverrunPct: 0,
      topFeatures: [],
      evaluation: {
        looAccuracy: null,
        precision: null,
        recall: null,
        f1Score: null,
        mae: null,
        rmse: null,
        trainingSamples: 0,
        positiveCount: 0,
        negativeCount: 0,
        baselineAccuracy: 0,
        isSufficientSample: false,
        sampleAdequacyNote: `Pipeline error: ${err instanceof Error ? err.message : "Unknown error"}`,
      },
      modelId: COST_MODEL_ID,
      predictedAt,
      isViable: false,
      nonViableReason: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

// ── Public Predictor: Schedule Delay (Outcome b) ────────────────────────

export function predictScheduleDelay(project: Project): MLSchedulePrediction {
  const predictedAt = new Date().toISOString();

  try {
    const pipeline = getOrTrainPipeline();
    const fv = extractFeatures({
      originalCostCr: project.originalCostCr,
      physicalProgressPct: project.physicalProgressPct,
      revisedCompletionDate: project.revisedCompletionDate,
      sector: project.sector,
    });
    const features = featureVectorToArray(fv);

    // Probability of delay
    const probability = predictProbability(pipeline.schedClassifier, features);
    const prediction = probability >= 0.5 || project.isDelayed;

    // Continuous predicted slippage in months
    let predictedDelayMonths = Math.max(0, predictContinuous(pipeline.schedRegressor, features));
    predictedDelayMonths = Math.round(predictedDelayMonths * 10) / 10;

    // If already delayed, minimum slippage is actual overdue time
    const targetDate = new Date(project.revisedCompletionDate);
    const now = new Date();
    if (project.isDelayed && targetDate < now) {
      const overdueMonths = Math.round((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      predictedDelayMonths = Math.max(predictedDelayMonths, overdueMonths);
    }

    // Projected completion date
    const projectedDate = new Date(targetDate);
    projectedDate.setMonth(projectedDate.getMonth() + Math.round(predictedDelayMonths));
    const projectedCompletionDate = projectedDate.toISOString().slice(0, 10);

    // Velocity pace status
    let velocityPaceStatus: MLSchedulePrediction["velocityPaceStatus"] = "ON_TRACK";
    if (predictedDelayMonths > 12 || project.isDelayed) {
      velocityPaceStatus = "CRITICAL_LAG";
    } else if (predictedDelayMonths > 3 || probability > 0.6) {
      velocityPaceStatus = "AT_RISK";
    }

    const dist = Math.abs(probability - 0.5);
    let confidenceLabel: MLSchedulePrediction["confidenceLabel"];
    if (dist > 0.3) confidenceLabel = "HIGH";
    else if (dist > 0.15) confidenceLabel = "MODERATE";
    else if (dist > 0.05) confidenceLabel = "LOW";
    else confidenceLabel = "UNCERTAIN";

    const topFeatures: FeatureImportance[] = FEATURE_NAMES.map((name, idx) => {
      const weight = pipeline.schedClassifier.weights[idx] ?? 0;
      const value = features[idx] ?? 0;
      return {
        featureName: name,
        label: FEATURE_LABELS[name] ?? name,
        weight: Math.round(weight * 1000) / 1000,
        importance: Math.round(Math.abs(weight) * 1000) / 1000,
        direction: weight >= 0 ? ("INCREASES_RISK" as const) : ("DECREASES_RISK" as const),
        projectValue: Math.round(value * 1000) / 1000,
        contribution: Math.round(weight * value * 1000) / 1000,
      };
    }).sort((a, b) => b.importance - a.importance);

    return {
      target: "SCHEDULE_DELAY",
      targetDescription: "Schedule slippage probability and estimated delay duration in months.",
      prediction,
      predictionLabel: prediction
        ? `SCHEDULE SLIPPAGE LIKELY (+${predictedDelayMonths} months delay forecasted)`
        : "ON TRACK — Milestone achievement rate matches completion target",
      probability: Math.round(probability * 1000) / 1000,
      confidenceLabel,
      predictedDelayMonths,
      projectedCompletionDate,
      velocityPaceStatus,
      topFeatures,
      evaluation: pipeline.schedEvaluation,
      modelId: SCHED_MODEL_ID,
      predictedAt,
      isViable: true,
      nonViableReason: null,
    };
  } catch (err) {
    return {
      target: "SCHEDULE_DELAY",
      targetDescription: "Schedule delay estimation pipeline.",
      prediction: false,
      predictionLabel: "PREDICTION UNAVAILABLE",
      probability: 0.5,
      confidenceLabel: "UNCERTAIN",
      predictedDelayMonths: 0,
      projectedCompletionDate: project.revisedCompletionDate,
      velocityPaceStatus: "ON_TRACK",
      topFeatures: [],
      evaluation: {
        looAccuracy: null,
        precision: null,
        recall: null,
        f1Score: null,
        mae: null,
        rmse: null,
        trainingSamples: 0,
        positiveCount: 0,
        negativeCount: 0,
        baselineAccuracy: 0,
        isSufficientSample: false,
        sampleAdequacyNote: `Pipeline error: ${err instanceof Error ? err.message : "Unknown error"}`,
      },
      modelId: SCHED_MODEL_ID,
      predictedAt,
      isViable: false,
      nonViableReason: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

// ── Technical Dimensions (b) & (c) APIs ─────────────────────────────────

export function getMLBenchmarkReport(): MLBenchmarkReport {
  return generateMLBenchmarkReport();
}

export function getCUFAttributionReport(): CUFAttributionReport {
  return generateCUFAttributionReport();
}

// Backward-compatible helper
export function getModelEvaluation(): ModelEvaluation {
  const pipeline = getOrTrainPipeline();
  return pipeline.costEvaluation;
}
