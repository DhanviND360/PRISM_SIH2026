/**
 * PRISM — ML / API Integration Layer
 *
 * Public barrel export for the ML prediction subsystem.
 *
 * Available Models & Analytics:
 *   - predictCostOverrun(project)  → MLCostPrediction (Classification + ₹ Cr Magnitude)
 *   - predictScheduleDelay(project) → MLSchedulePrediction (Classification + Delay Months)
 *   - getMLBenchmarkReport()        → MLBenchmarkReport (Technical Dimension b: EVM vs. ML)
 *   - getCUFAttributionReport()     → CUFAttributionReport (Technical Dimension c: CUF Attribution)
 *   - getModelEvaluation()          → ModelEvaluation (Backward compatibility)
 */

export {
  predictCostOverrun,
  predictScheduleDelay,
  getMLBenchmarkReport,
  getCUFAttributionReport,
  getModelEvaluation,
} from "./predictor";

export { computeEVMMetrics } from "./statistical-baseline";

export type {
  MLCostPrediction,
  MLSchedulePrediction,
  MLPrediction,
  MLTargetVariable,
  FeatureImportance,
  FeatureVector,
  ModelEvaluation,
  MLBenchmarkReport,
  MetricComparisonRow,
  CUFAttributionReport,
  CUFFeatureAttributionItem,
} from "./types";
