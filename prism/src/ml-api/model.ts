/**
 * PRISM ML — Logistic Regression Model (from scratch)
 *
 * A minimal logistic regression classifier implemented in TypeScript
 * with no external dependencies. Uses gradient descent for training.
 *
 * This module is completely self-contained so the project needs zero
 * Python, TensorFlow, or scikit-learn to demonstrate the ML concept.
 *
 * Limitations acknowledged:
 *   - No regularization (L1/L2) — sample too small for it to matter.
 *   - No feature standardization beyond log-scaling in preprocessing.
 *   - With n=20, any model is essentially memorizing patterns.
 *
 * The API honestly reports these limitations.
 */

/** Sigmoid activation: σ(z) = 1 / (1 + e^(-z)) */
function sigmoid(z: number): number {
  // Clamp to avoid overflow
  const clamped = Math.max(-500, Math.min(500, z));
  return 1 / (1 + Math.exp(-clamped));
}

/** Binary cross-entropy loss for a single sample. */
function binaryCrossEntropy(yTrue: number, yPred: number): number {
  const eps = 1e-15;
  const p = Math.max(eps, Math.min(1 - eps, yPred));
  return -(yTrue * Math.log(p) + (1 - yTrue) * Math.log(1 - p));
}

export interface TrainedModel {
  /** Learned weights for each feature. */
  weights: number[];
  /** Learned bias term. */
  bias: number;
  /** Number of training epochs completed. */
  epochs: number;
  /** Final training loss. */
  finalLoss: number;
  /** Feature count. */
  featureCount: number;
}

export interface TrainConfig {
  learningRate: number;
  epochs: number;
  /** Convergence threshold — stop if loss change < this. */
  convergenceThreshold: number;
}

const DEFAULT_CONFIG: TrainConfig = {
  learningRate: 0.1,
  epochs: 500,
  convergenceThreshold: 1e-6,
};

/**
 * Train a logistic regression model via gradient descent.
 *
 * @param X - Feature matrix (n_samples × n_features).
 * @param y - Binary labels (n_samples), values 0 or 1.
 * @param config - Training hyperparameters.
 * @returns Trained model with weights and bias.
 */
export function trainLogisticRegression(
  X: number[][],
  y: number[],
  config: Partial<TrainConfig> = {}
): TrainedModel {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const n = X.length;
  const d = X[0]?.length ?? 0;

  if (n === 0 || d === 0) {
    return { weights: [], bias: 0, epochs: 0, finalLoss: Infinity, featureCount: 0 };
  }

  // Initialize weights to small random-ish values (deterministic for reproducibility)
  const weights = new Array(d).fill(0).map((_, i) => 0.01 * (i % 2 === 0 ? 1 : -1));
  let bias = 0;
  let lastLoss = Infinity;
  let completedEpochs = 0;

  for (let epoch = 0; epoch < cfg.epochs; epoch++) {
    // Forward pass
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

    const avgLoss = totalLoss / n;

    // Check convergence
    if (Math.abs(lastLoss - avgLoss) < cfg.convergenceThreshold) {
      completedEpochs = epoch + 1;
      lastLoss = avgLoss;
      break;
    }
    lastLoss = avgLoss;
    completedEpochs = epoch + 1;

    // Backward pass — compute gradients
    const dWeights = new Array(d).fill(0);
    let dBias = 0;

    for (let i = 0; i < n; i++) {
      const error = predictions[i] - y[i];
      for (let j = 0; j < d; j++) {
        dWeights[j] += (error * X[i][j]) / n;
      }
      dBias += error / n;
    }

    // Update weights
    for (let j = 0; j < d; j++) {
      weights[j] -= cfg.learningRate * dWeights[j];
    }
    bias -= cfg.learningRate * dBias;
  }

  return {
    weights: [...weights],
    bias,
    epochs: completedEpochs,
    finalLoss: lastLoss,
    featureCount: d,
  };
}

/**
 * Predict probability of the positive class for a single sample.
 */
export function predictProbability(
  model: TrainedModel,
  features: number[]
): number {
  let z = model.bias;
  for (let j = 0; j < model.featureCount; j++) {
    z += model.weights[j] * (features[j] ?? 0);
  }
  return sigmoid(z);
}

/**
 * Predict probability for multiple samples.
 */
export function predictProbabilities(
  model: TrainedModel,
  X: number[][]
): number[] {
  return X.map((features) => predictProbability(model, features));
}

/**
 * Leave-one-out cross-validation.
 *
 * For each sample, train on the remaining n-1 samples and predict the held-out one.
 * Returns the number of correct predictions and the accuracy.
 */
export function leaveOneOutCV(
  X: number[][],
  y: number[],
  config: Partial<TrainConfig> = {}
): { accuracy: number; correctCount: number; total: number; foldPredictions: boolean[] } {
  const n = X.length;
  let correct = 0;
  const foldPredictions: boolean[] = [];

  for (let i = 0; i < n; i++) {
    // Leave out sample i
    const trainX = [...X.slice(0, i), ...X.slice(i + 1)];
    const trainY = [...y.slice(0, i), ...y.slice(i + 1)];

    const model = trainLogisticRegression(trainX, trainY, config);
    const prob = predictProbability(model, X[i]);
    const predicted = prob >= 0.5 ? 1 : 0;
    const isCorrect = predicted === y[i];
    foldPredictions.push(isCorrect);
    if (isCorrect) correct++;
  }

  return {
    accuracy: n > 0 ? correct / n : 0,
    correctCount: correct,
    total: n,
    foldPredictions,
  };
}
