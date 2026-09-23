/**
 * Quick smoke test for the ML pipeline.
 * Verifies: training works, LOO-CV runs, prediction is returned.
 */
import { getTrainingData, extractFeatures, featureVectorToArray } from "../ml-api/preprocessing";
import { trainLogisticRegression, leaveOneOutCV, predictProbability } from "../ml-api/model";

const data = getTrainingData();
console.log(`\n=== PRISM ML Pipeline Test ===\n`);
console.log(`Training records: ${data.length}`);
console.log(`Cost overrun (positive): ${data.filter(d => d.hasCostOverrun).length}`);
console.log(`No overrun (negative): ${data.filter(d => !d.hasCostOverrun).length}`);

const X = data.map(d => featureVectorToArray(extractFeatures(d)));
const y = data.map(d => d.hasCostOverrun ? 1 : 0);

console.log(`\nFeature matrix shape: ${X.length} × ${X[0].length}`);
console.log(`Sample features (row 0): ${X[0].map(v => v.toFixed(3)).join(", ")}`);

const model = trainLogisticRegression(X, y, { learningRate: 0.05, epochs: 1000 });
console.log(`\nModel trained:`);
console.log(`  Weights: ${model.weights.map(w => w.toFixed(4)).join(", ")}`);
console.log(`  Bias: ${model.bias.toFixed(4)}`);
console.log(`  Epochs: ${model.epochs}`);
console.log(`  Final loss: ${model.finalLoss.toFixed(6)}`);

const loocv = leaveOneOutCV(X, y, { learningRate: 0.05, epochs: 1000 });
console.log(`\nLeave-One-Out CV:`);
console.log(`  Accuracy: ${(loocv.accuracy * 100).toFixed(1)}% (${loocv.correctCount}/${loocv.total})`);
console.log(`  Baseline (majority): ${(Math.max(y.filter(v=>v===1).length, y.filter(v=>v===0).length) / y.length * 100).toFixed(1)}%`);

console.log(`\nPredictions for all projects:`);
for (let i = 0; i < data.length; i++) {
  const prob = predictProbability(model, X[i]);
  const pred = prob >= 0.5 ? "OVERRUN" : "ON_BUDGET";
  const actual = data[i].hasCostOverrun ? "OVERRUN" : "ON_BUDGET";
  const match = pred === actual ? "✓" : "✗";
  console.log(`  ${match} ${data[i].projectName.substring(0, 45).padEnd(47)} | P(overrun)=${prob.toFixed(3)} | Pred=${pred.padEnd(10)} | Actual=${actual}`);
}

console.log(`\n=== Test Complete ===`);
