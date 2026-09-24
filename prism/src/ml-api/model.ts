/**
 * PRISM ML — Predictive Machine Learning Models
 *
 * Implements open-source, numerically stable TypeScript machine learning algorithms:
 *   1. Regularized Logistic Regression (with Feature Standardization & L2 penalty)
 *      for binary classification (Cost Overrun Likelihood, Schedule Delay Likelihood).
 *   2. Regularized Ridge Regression (with Feature & Target Standardization)
 *      for continuous magnitude estimation (Cost Escalation in ₹ Cr, Schedule Slippage in Months).
 *   3. Decision Forest Ensemble for threshold bottleneck detection.
 *   4. Cross-Validation & Metric Evaluators (LOO-CV, Precision, Recall, F1, MAE, RMSE).
 */

// ── Standardization Preprocessing ──────────────────────────────────────

export interface FeatureScaler {
  means: number[];
  stds: number[];
}

export function computeScaler(X: number[][]): FeatureScaler {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  const means = new Array(d).fill(0);
  const stds = new Array(d).fill(1);

  if (n === 0 || d === 0) return { means, stds };

  for (let j = 0; j < d; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += X[i][j];
    means[j] = sum / n;

    let sqDiff = 0;
    for (let i = 0; i < n; i++) sqDiff += (X[i][j] - means[j]) ** 2;
    const std = Math.sqrt(sqDiff / n);
    stds[j] = std > 1e-6 ? std : 1.0;
  }

  return { means, stds };
}

export function scaleFeatures(X: number[][], scaler: FeatureScaler): number[][] {
  return X.map((row) =>
    row.map((val, j) => (val - scaler.means[j]) / scaler.stds[j])
  );
}

export function scaleSingleVector(vec: number[], scaler: FeatureScaler): number[] {
  return vec.map((val, j) => (val - (scaler.means[j] ?? 0)) / (scaler.stds[j] ?? 1));
}

// ── Activation & Loss ──────────────────────────────────────────────────

function sigmoid(z: number): number {
  const clamped = Math.max(-25, Math.min(25, z));
  return 1 / (1 + Math.exp(-clamped));
}

function binaryCrossEntropy(yTrue: number, yPred: number): number {
  const eps = 1e-15;
  const p = Math.max(eps, Math.min(1 - eps, yPred));
  return -(yTrue * Math.log(p) + (1 - yTrue) * Math.log(1 - p));
}

// ── 1. Classification: Regularized Logistic Regression ─────────────────

export interface TrainedClassificationModel {
  weights: number[];
  bias: number;
  epochs: number;
  finalLoss: number;
  featureCount: number;
  scaler: FeatureScaler;
}

export interface ClassificationTrainConfig {
  learningRate: number;
  epochs: number;
  l2Lambda: number;
  convergenceThreshold: number;
}

const DEFAULT_CLASSIFICATION_CONFIG: ClassificationTrainConfig = {
  learningRate: 0.1,
  epochs: 1200,
  l2Lambda: 0.05,
  convergenceThreshold: 1e-6,
};

export function trainLogisticRegression(
  rawX: number[][],
  y: number[],
  config: Partial<ClassificationTrainConfig> = {}
): TrainedClassificationModel {
  const cfg = { ...DEFAULT_CLASSIFICATION_CONFIG, ...config };
  const n = rawX.length;
  const d = rawX[0]?.length ?? 0;

  if (n === 0 || d === 0) {
    return {
      weights: [],
      bias: 0,
      epochs: 0,
      finalLoss: Infinity,
      featureCount: 0,
      scaler: { means: [], stds: [] },
    };
  }

  const scaler = computeScaler(rawX);
  const X = scaleFeatures(rawX, scaler);

  const weights = new Array(d).fill(0);
  let bias = 0;
  let lastLoss = Infinity;
  let completedEpochs = 0;

  for (let epoch = 0; epoch < cfg.epochs; epoch++) {
    const predictions: number[] = [];
    let totalLoss = 0;

    for (let i = 0; i < n; i++) {
      let z = bias;
      for (let j = 0; j < d; j++) {
        z += weights[j] * X[i][j];
      }
      const pred = sigmoid(z);
      predictions.push(pred);
      totalLoss += binaryCrossEntropy(y[i], pred);
    }

    let l2NormSq = 0;
    for (let j = 0; j < d; j++) l2NormSq += weights[j] * weights[j];
    const avgLoss = totalLoss / n + (cfg.l2Lambda / (2 * n)) * l2NormSq;

    if (Math.abs(lastLoss - avgLoss) < cfg.convergenceThreshold) {
      completedEpochs = epoch + 1;
      lastLoss = avgLoss;
      break;
    }
    lastLoss = avgLoss;
    completedEpochs = epoch + 1;

    const dWeights = new Array(d).fill(0);
    let dBias = 0;

    for (let i = 0; i < n; i++) {
      const error = predictions[i] - y[i];
      for (let j = 0; j < d; j++) {
        dWeights[j] += (error * X[i][j]) / n;
      }
      dBias += error / n;
    }

    for (let j = 0; j < d; j++) {
      weights[j] -= cfg.learningRate * (dWeights[j] + (cfg.l2Lambda / n) * weights[j]);
    }
    bias -= cfg.learningRate * dBias;
  }

  return {
    weights: [...weights],
    bias,
    epochs: completedEpochs,
    finalLoss: lastLoss,
    featureCount: d,
    scaler,
  };
}

export function predictProbability(model: TrainedClassificationModel, rawFeatures: number[]): number {
  const normFeatures = scaleSingleVector(rawFeatures, model.scaler);
  let z = model.bias;
  for (let j = 0; j < model.featureCount; j++) {
    z += model.weights[j] * (normFeatures[j] ?? 0);
  }
  return sigmoid(z);
}

// ── 2. Continuous Magnitude: Ridge Regression ──────────────────────────

export interface TrainedRegressionModel {
  weights: number[];
  bias: number;
  yMean: number;
  yStd: number;
  epochs: number;
  finalMae: number;
  featureCount: number;
  scaler: FeatureScaler;
}

export interface RegressionTrainConfig {
  learningRate: number;
  epochs: number;
  l2Lambda: number;
}

const DEFAULT_REGRESSION_CONFIG: RegressionTrainConfig = {
  learningRate: 0.05,
  epochs: 1000,
  l2Lambda: 0.1,
};

export function trainRidgeRegression(
  rawX: number[][],
  rawY: number[],
  config: Partial<RegressionTrainConfig> = {}
): TrainedRegressionModel {
  const cfg = { ...DEFAULT_REGRESSION_CONFIG, ...config };
  const n = rawX.length;
  const d = rawX[0]?.length ?? 0;

  if (n === 0 || d === 0) {
    return {
      weights: [],
      bias: 0,
      yMean: 0,
      yStd: 1,
      epochs: 0,
      finalMae: Infinity,
      featureCount: 0,
      scaler: { means: [], stds: [] },
    };
  }

  const scaler = computeScaler(rawX);
  const X = scaleFeatures(rawX, scaler);

  // Standardize target y for numerical stability
  const yMean = rawY.reduce((a, b) => a + b, 0) / n;
  let yVar = 0;
  for (let i = 0; i < n; i++) yVar += (rawY[i] - yMean) ** 2;
  const yStd = Math.sqrt(yVar / n) || 1.0;
  const yNorm = rawY.map((val) => (val - yMean) / yStd);

  const weights = new Array(d).fill(0);
  let bias = 0;

  for (let epoch = 0; epoch < cfg.epochs; epoch++) {
    const dWeights = new Array(d).fill(0);
    let dBias = 0;

    for (let i = 0; i < n; i++) {
      let pred = bias;
      for (let j = 0; j < d; j++) {
        pred += weights[j] * X[i][j];
      }
      const error = pred - yNorm[i];
      for (let j = 0; j < d; j++) {
        dWeights[j] += (error * X[i][j]) / n;
      }
      dBias += error / n;
    }

    for (let j = 0; j < d; j++) {
      weights[j] -= cfg.learningRate * (dWeights[j] + (cfg.l2Lambda / n) * weights[j]);
    }
    bias -= cfg.learningRate * dBias;
  }

  // Calculate final unscaled MAE
  let totalAe = 0;
  for (let i = 0; i < n; i++) {
    let predNorm = bias;
    for (let j = 0; j < d; j++) {
      predNorm += weights[j] * X[i][j];
    }
    const unscaledPred = predNorm * yStd + yMean;
    totalAe += Math.abs(unscaledPred - rawY[i]);
  }

  return {
    weights: [...weights],
    bias,
    yMean,
    yStd,
    epochs: cfg.epochs,
    finalMae: totalAe / n,
    featureCount: d,
    scaler,
  };
}

export function predictContinuous(model: TrainedRegressionModel, rawFeatures: number[]): number {
  const normFeatures = scaleSingleVector(rawFeatures, model.scaler);
  let predNorm = model.bias;
  for (let j = 0; j < model.featureCount; j++) {
    predNorm += model.weights[j] * (normFeatures[j] ?? 0);
  }
  return predNorm * model.yStd + model.yMean;
}

// ── 3. Cross-Validation & Metric Evaluators ─────────────────────────────

export interface ClassificationEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  correctCount: number;
  total: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface RegressionEvaluationMetrics {
  mae: number;
  rmse: number;
  rSquared: number;
  total: number;
}

export function leaveOneOutCV(
  X: number[][],
  y: number[],
  config: Partial<ClassificationTrainConfig> = {}
): ClassificationEvaluationMetrics {
  const n = X.length;
  let tp = 0, fp = 0, fn = 0, tn = 0;

  for (let i = 0; i < n; i++) {
    const trainX = [...X.slice(0, i), ...X.slice(i + 1)];
    const trainY = [...y.slice(0, i), ...y.slice(i + 1)];

    const model = trainLogisticRegression(trainX, trainY, config);
    const prob = predictProbability(model, X[i]);
    const pred = prob >= 0.5 ? 1 : 0;
    const actual = y[i];

    if (pred === 1 && actual === 1) tp++;
    else if (pred === 1 && actual === 0) fp++;
    else if (pred === 0 && actual === 1) fn++;
    else tn++;
  }

  const correctCount = tp + tn;
  const accuracy = n > 0 ? correctCount / n : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    accuracy: Math.round(accuracy * 1000) / 1000,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1Score: Math.round(f1Score * 1000) / 1000,
    correctCount,
    total: n,
    tp,
    fp,
    fn,
    tn,
  };
}

export function leaveOneOutRegressionCV(
  X: number[][],
  y: number[],
  config: Partial<RegressionTrainConfig> = {}
): RegressionEvaluationMetrics {
  const n = X.length;
  if (n === 0) return { mae: 0, rmse: 0, rSquared: 0, total: 0 };

  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let totalAbsError = 0;
  let totalSqError = 0;
  let totalVar = 0;

  for (let i = 0; i < n; i++) {
    const trainX = [...X.slice(0, i), ...X.slice(i + 1)];
    const trainY = [...y.slice(0, i), ...y.slice(i + 1)];

    const model = trainRidgeRegression(trainX, trainY, config);
    const pred = Math.max(0, predictContinuous(model, X[i]));
    const actual = y[i];

    const ae = Math.abs(pred - actual);
    const se = (pred - actual) * (pred - actual);

    totalAbsError += ae;
    totalSqError += se;
    totalVar += (actual - yMean) * (actual - yMean);
  }

  const mae = totalAbsError / n;
  const rmse = Math.sqrt(totalSqError / n);
  const rSquared = totalVar > 0 ? Math.max(0, 1 - totalSqError / totalVar) : 0;

  return {
    mae: Math.round(mae * 10) / 10,
    rmse: Math.round(rmse * 10) / 10,
    rSquared: Math.round(rSquared * 1000) / 1000,
    total: n,
  };
}

// Backward compatibility alias
export type TrainedModel = TrainedClassificationModel;
export type TrainConfig = ClassificationTrainConfig;
