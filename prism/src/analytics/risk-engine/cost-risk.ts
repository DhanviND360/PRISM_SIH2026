/**
 * PRISM Risk Engine — Cost Risk Predictor
 *
 * Deterministic baseline calculation using only fields actually
 * present in the PAIMANA dataset: originalCostCr, revisedCostCr.
 *
 * This module can be replaced by a trained ML model later without
 * changing the RiskDimensionResult interface.
 */

import type { Project } from "@/types/project";
import type { RiskDimensionResult, EvidenceItem, ContributingFactor } from "./types";
import type { RiskLevel } from "@/analytics/portfolio-stats";

/**
 * Compute Cost Risk dimension for a single project.
 *
 * Methodology:
 *   costVariancePct = ((revisedCostCr - originalCostCr) / originalCostCr) × 100
 *
 *   Score mapping (piecewise linear):
 *     variance ≤ 0%   → score 5   (no cost escalation)
 *     variance 0-10%  → score 5-25
 *     variance 10-25% → score 25-50
 *     variance 25-50% → score 50-75
 *     variance 50-100%→ score 75-90
 *     variance > 100% → score 90-95
 *
 *   The score is DETERMINISTIC and REPRODUCIBLE.
 */
export function computeCostRisk(project: Project): RiskDimensionResult {
  const { originalCostCr, revisedCostCr } = project;

  // ── Core variance calculation ───────────────────────────────────────
  const costDeltaCr = revisedCostCr - originalCostCr;
  const costVariancePct =
    originalCostCr > 0 ? (costDeltaCr / originalCostCr) * 100 : 0;

  // ── Piecewise linear score mapping ──────────────────────────────────
  let score: number;
  if (costVariancePct <= 0) {
    score = 5;
  } else if (costVariancePct <= 10) {
    score = 5 + (costVariancePct / 10) * 20; // 5-25
  } else if (costVariancePct <= 25) {
    score = 25 + ((costVariancePct - 10) / 15) * 25; // 25-50
  } else if (costVariancePct <= 50) {
    score = 50 + ((costVariancePct - 25) / 25) * 25; // 50-75
  } else if (costVariancePct <= 100) {
    score = 75 + ((costVariancePct - 50) / 50) * 15; // 75-90
  } else {
    score = 90 + Math.min(5, ((costVariancePct - 100) / 200) * 5); // 90-95 cap
  }
  score = Math.round(Math.min(95, Math.max(0, score)));

  // ── Level classification ────────────────────────────────────────────
  let level: RiskLevel;
  if (score >= 60) level = "HIGH";
  else if (score >= 30) level = "MEDIUM";
  else level = "LOW";

  // ── Evidence items ──────────────────────────────────────────────────
  const evidence: EvidenceItem[] = [
    {
      label: "Original Sanctioned Cost",
      sourceField: "originalCostCr",
      observedValue: `₹ ${originalCostCr.toLocaleString("en-IN")} Cr`,
      baselineValue: `₹ ${originalCostCr.toLocaleString("en-IN")} Cr`,
      deviationPercent: 0,
      isRiskContributor: false,
    },
    {
      label: "Latest Revised Cost",
      sourceField: "revisedCostCr",
      observedValue: `₹ ${revisedCostCr.toLocaleString("en-IN")} Cr`,
      baselineValue: `₹ ${originalCostCr.toLocaleString("en-IN")} Cr`,
      deviationPercent: Math.round(costVariancePct),
      isRiskContributor: costDeltaCr > 0,
    },
    {
      label: "Cost Variance (Absolute)",
      sourceField: "derived: revisedCostCr - originalCostCr",
      observedValue:
        costDeltaCr >= 0
          ? `+₹ ${costDeltaCr.toLocaleString("en-IN")} Cr`
          : `₹ ${costDeltaCr.toLocaleString("en-IN")} Cr`,
      baselineValue: "₹ 0 Cr (no escalation)",
      deviationPercent: Math.round(costVariancePct),
      isRiskContributor: costDeltaCr > 0,
    },
  ];

  // ── Contributing factors ────────────────────────────────────────────
  const contributingFactors: ContributingFactor[] = [];

  if (costDeltaCr > 0) {
    contributingFactors.push({
      title: "Budget Escalation",
      description: `Revised cost exceeds original sanction by ₹ ${costDeltaCr.toLocaleString("en-IN")} Cr (+${Math.round(costVariancePct)}%). This indicates the project has required additional funding beyond the originally approved budget.`,
      severity: costVariancePct > 50 ? "HIGH" : costVariancePct > 10 ? "MEDIUM" : "LOW",
      weight: 1.0,
      impactValue: costDeltaCr,
      impactUnit: "₹ Cr",
    });
  } else if (costDeltaCr < 0) {
    contributingFactors.push({
      title: "Budget Reduction",
      description: `Revised cost is ₹ ${Math.abs(costDeltaCr).toLocaleString("en-IN")} Cr below original sanction. This may reflect scope reduction or improved cost efficiency.`,
      severity: "LOW",
      weight: 0.3,
      impactValue: Math.abs(costDeltaCr),
      impactUnit: "₹ Cr",
    });
  } else {
    contributingFactors.push({
      title: "No Cost Variance",
      description: `Revised cost matches original sanctioned amount. No cost escalation reported.`,
      severity: "LOW",
      weight: 0.0,
      impactValue: 0,
      impactUnit: "₹ Cr",
    });
  }

  return {
    dimension: "COST",
    label: "Cost Risk",
    score,
    level,
    evidence,
    contributingFactors,
    method: "DETERMINISTIC",
    methodDescription:
      "Piecewise linear mapping of cost variance percentage (revisedCostCr vs originalCostCr) to a 0-95 score. Breakpoints at 0%, 10%, 25%, 50%, 100% variance.",
  };
}
