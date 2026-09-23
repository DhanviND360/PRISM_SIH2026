/**
 * PRISM — ML / API Integration Layer
 *
 * Public barrel export for the ML prediction subsystem.
 *
 * The ML layer is completely separate from the deterministic risk engine.
 * Both can be consumed by the UI, which clearly labels:
 *   - "Deterministic Risk Score" (from Phase 3 risk engine)
 *   - "ML Prediction" (from this module, experimental)
 *
 * Available API:
 *   predictCostOverrun(project) → MLPrediction
 *   getModelEvaluation()        → ModelEvaluation
 */

export { predictCostOverrun, getModelEvaluation } from "./predictor";
export type {
  MLPrediction,
  MLTargetVariable,
  FeatureImportance,
  FeatureVector,
  ModelEvaluation,
} from "./types";
