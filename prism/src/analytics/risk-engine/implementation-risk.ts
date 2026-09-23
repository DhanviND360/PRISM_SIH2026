/**
 * PRISM Risk Engine — Implementation Risk Predictor
 *
 * Deterministic baseline calculation using: physicalProgressPct,
 * the cost overrun ratio, and the schedule situation.
 *
 * Implementation risk captures execution capability signals:
 *  - Stalled progress (0% physical progress with significant budget)
 *  - Progress-cost mismatch (high spend relative to physical work done)
 *  - Combined cost + schedule pressure compounding execution risk
 *
 * This is NOT a prediction of future delay — it is a signal derived
 * from the current observed state of the project.
 */

import type { Project } from "@/types/project";
import type { RiskDimensionResult, EvidenceItem, ContributingFactor } from "./types";
import type { RiskLevel } from "@/analytics/portfolio-stats";

export function computeImplementationRisk(project: Project): RiskDimensionResult {
  const { physicalProgressPct, originalCostCr, revisedCostCr, costOverrunRatio, isDelayed } = project;

  let score = 10; // baseline
  const factors: ContributingFactor[] = [];

  // ── Signal 1: Stalled progress ────────────────────────────────────
  if (physicalProgressPct === 0 && originalCostCr > 0) {
    const stalledPenalty = Math.min(35, Math.round(originalCostCr / 500));
    score += stalledPenalty;
    factors.push({
      title: "Zero Physical Progress Reported",
      description: `Physical progress is 0% on a project with ₹ ${originalCostCr.toLocaleString("en-IN")} Cr sanctioned budget. This may indicate the project has not commenced physical work or is in pre-construction phase.`,
      severity: originalCostCr > 5000 ? "HIGH" : "MEDIUM",
      weight: 0.5,
      impactValue: originalCostCr,
      impactUnit: "₹ Cr at 0% progress",
    });
  }

  // ── Signal 2: Progress-cost mismatch ──────────────────────────────
  // If cost has escalated but physical progress is disproportionately low
  if (costOverrunRatio > 1.0 && physicalProgressPct < 70) {
    const mismatch = Math.round((costOverrunRatio - 1) * 100);
    const progressGap = 70 - physicalProgressPct;
    const penalty = Math.min(25, Math.round(mismatch * 0.2 + progressGap * 0.3));
    score += penalty;
    factors.push({
      title: "Cost-Progress Imbalance",
      description: `Budget has escalated by ${mismatch}% while physical progress is at ${physicalProgressPct}%. The cost growth is not proportionately reflected in physical output, suggesting possible inefficiency, scope creep, or procurement challenges.`,
      severity: mismatch > 30 ? "HIGH" : "MEDIUM",
      weight: 0.3,
      impactValue: mismatch,
      impactUnit: "% cost overrun at low progress",
    });
  }

  // ── Signal 3: Compounding cost + schedule pressure ────────────────
  if (isDelayed && costOverrunRatio > 1.0) {
    const compoundPenalty = Math.min(20, Math.round((costOverrunRatio - 1) * 30));
    score += compoundPenalty;
    factors.push({
      title: "Compound Cost & Schedule Pressure",
      description: `Project is simultaneously delayed and over budget (${Math.round((costOverrunRatio - 1) * 100)}% cost overrun). This combination compounds execution risk as additional time typically drives further cost escalation.`,
      severity: "HIGH",
      weight: 0.4,
      impactValue: Math.round((revisedCostCr - originalCostCr)),
      impactUnit: "₹ Cr cost pressure while delayed",
    });
  }

  // ── Signal 4: Near-completion with overrun ────────────────────────
  if (physicalProgressPct >= 90 && costOverrunRatio > 1.5) {
    factors.push({
      title: "Cost Overrun at Completion Stage",
      description: `Project is near completion (${physicalProgressPct}%) but has incurred a ${Math.round((costOverrunRatio - 1) * 100)}% cost overrun. While execution is progressing, the budget breach is significant.`,
      severity: "MEDIUM",
      weight: 0.2,
      impactValue: Math.round((revisedCostCr - originalCostCr)),
      impactUnit: "₹ Cr overrun at near-completion",
    });
  }

  // ── If no negative signals detected ───────────────────────────────
  if (factors.length === 0) {
    factors.push({
      title: "Normal Execution Profile",
      description: `Physical progress (${physicalProgressPct}%) and cost profile appear proportionate. No abnormal implementation signals detected from available PAIMANA data.`,
      severity: "LOW",
      weight: 0.0,
      impactValue: 0,
      impactUnit: "N/A",
    });
  }

  score = Math.round(Math.min(95, Math.max(0, score)));

  let level: RiskLevel;
  if (score >= 60) level = "HIGH";
  else if (score >= 30) level = "MEDIUM";
  else level = "LOW";

  // ── Evidence ──────────────────────────────────────────────────────
  const evidence: EvidenceItem[] = [
    {
      label: "Physical Progress",
      sourceField: "physicalProgressPct",
      observedValue: `${physicalProgressPct}%`,
      baselineValue: "Proportionate to project lifecycle",
      deviationPercent: physicalProgressPct === 0 ? 100 : 0,
      isRiskContributor: physicalProgressPct === 0 || (physicalProgressPct < 50 && costOverrunRatio > 1.0),
    },
    {
      label: "Cost Overrun Ratio",
      sourceField: "costOverrunRatio (derived)",
      observedValue: `${costOverrunRatio}x`,
      baselineValue: "1.0x (on budget)",
      deviationPercent: Math.max(0, Math.round((costOverrunRatio - 1) * 100)),
      isRiskContributor: costOverrunRatio > 1.0,
    },
    {
      label: "Schedule Status Impact",
      sourceField: "isDelayed (derived)",
      observedValue: isDelayed ? "Past target date" : "Within target date",
      baselineValue: "Within target date",
      deviationPercent: isDelayed ? 100 : 0,
      isRiskContributor: isDelayed,
    },
  ];

  return {
    dimension: "IMPLEMENTATION",
    label: "Implementation Risk",
    score,
    level,
    evidence,
    contributingFactors: factors,
    method: "DETERMINISTIC",
    methodDescription:
      "Composite score from: stalled-progress detection (0% with budget), cost-progress imbalance ratio, and compound cost+schedule pressure. Each signal contributes additively with capped penalties.",
  };
}
