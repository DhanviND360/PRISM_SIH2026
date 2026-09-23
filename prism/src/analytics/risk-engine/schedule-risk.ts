/**
 * PRISM Risk Engine — Schedule Risk Predictor
 *
 * Deterministic baseline calculation using: revisedCompletionDate, isDelayed.
 *
 * For the sample dataset we have only one target date and no original start
 * date. The engine is honest about this: if the target date has passed and
 * work remains incomplete, schedule risk is high. Otherwise, it uses
 * remaining time to assess urgency.
 */

import type { Project } from "@/types/project";
import type { RiskDimensionResult, EvidenceItem, ContributingFactor } from "./types";
import type { RiskLevel } from "@/analytics/portfolio-stats";

/**
 * Compute Schedule Risk dimension for a single project.
 *
 * Methodology:
 *   If isDelayed (target date in the past):
 *     - Measure months overdue = (now - targetDate) in months
 *     - Score: 60 + min(35, overdue_months × 2)
 *     - Additional penalty if progress < 90% while overdue
 *
 *   If NOT delayed:
 *     - Measure months remaining = (targetDate - now) in months
 *     - Base score starts low
 *     - If remaining < 12 months and progress < 50%: elevated risk
 *     - If remaining < 6 months and progress < 80%: high risk
 */
export function computeScheduleRisk(project: Project): RiskDimensionResult {
  const now = new Date();
  const targetDate = new Date(project.revisedCompletionDate);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // avg month

  const monthsOverdue = project.isDelayed ? Math.abs(diffMonths) : 0;
  const monthsRemaining = project.isDelayed ? 0 : diffMonths;

  let score: number;
  const factors: ContributingFactor[] = [];

  if (project.isDelayed) {
    // ── Project is past due ─────────────────────────────────────────
    score = 60 + Math.min(35, Math.round(monthsOverdue * 2));

    factors.push({
      title: "Target Completion Date Expired",
      description: `The revised target date (${project.revisedCompletionDate}) has passed ${Math.round(monthsOverdue)} month(s) ago. Physical progress stands at ${project.physicalProgressPct}%.`,
      severity: "HIGH",
      weight: 0.7,
      impactValue: Math.round(monthsOverdue),
      impactUnit: "months overdue",
    });

    if (project.physicalProgressPct < 90) {
      score = Math.min(95, score + 5);
      factors.push({
        title: "Incomplete at Expiry",
        description: `Project is only ${project.physicalProgressPct}% complete despite being past its target completion date. Remaining ${100 - project.physicalProgressPct}% of physical work is outstanding.`,
        severity: "HIGH",
        weight: 0.3,
        impactValue: 100 - project.physicalProgressPct,
        impactUnit: "% incomplete",
      });
    }
  } else {
    // ── Project is not yet past due ─────────────────────────────────
    score = 10;

    // Check time-pressure vs progress mismatch
    if (monthsRemaining < 6 && project.physicalProgressPct < 80) {
      score = 55 + Math.round((80 - project.physicalProgressPct) * 0.4);
      factors.push({
        title: "Critical Time-Progress Mismatch",
        description: `Only ${Math.round(monthsRemaining)} months remain until the target date (${project.revisedCompletionDate}), but physical progress is at ${project.physicalProgressPct}%. At this pace, the target may not be met.`,
        severity: "HIGH",
        weight: 0.8,
        impactValue: Math.round(monthsRemaining),
        impactUnit: "months remaining",
      });
    } else if (monthsRemaining < 12 && project.physicalProgressPct < 50) {
      score = 40 + Math.round((50 - project.physicalProgressPct) * 0.3);
      factors.push({
        title: "Elevated Time-Progress Mismatch",
        description: `${Math.round(monthsRemaining)} months remain until target, but only ${project.physicalProgressPct}% of physical work is complete. Execution pace may need acceleration.`,
        severity: "MEDIUM",
        weight: 0.6,
        impactValue: Math.round(monthsRemaining),
        impactUnit: "months remaining",
      });
    } else if (monthsRemaining < 24 && project.physicalProgressPct < 30) {
      score = 30;
      factors.push({
        title: "Early-Stage Progress Concern",
        description: `Only ${project.physicalProgressPct}% complete with ${Math.round(monthsRemaining)} months remaining. The project may need to accelerate significantly.`,
        severity: "MEDIUM",
        weight: 0.4,
        impactValue: Math.round(monthsRemaining),
        impactUnit: "months remaining",
      });
    } else {
      factors.push({
        title: "Adequate Timeline Buffer",
        description: `${Math.round(monthsRemaining)} months remain until target (${project.revisedCompletionDate}). Physical progress at ${project.physicalProgressPct}% appears proportionate.`,
        severity: "LOW",
        weight: 0.1,
        impactValue: Math.round(monthsRemaining),
        impactUnit: "months remaining",
      });
    }
  }

  score = Math.round(Math.min(95, Math.max(0, score)));

  let level: RiskLevel;
  if (score >= 60) level = "HIGH";
  else if (score >= 30) level = "MEDIUM";
  else level = "LOW";

  // ── Evidence ──────────────────────────────────────────────────────
  const evidence: EvidenceItem[] = [
    {
      label: "Revised Target Completion Date",
      sourceField: "revisedCompletionDate",
      observedValue: project.revisedCompletionDate,
      baselineValue: "Current date",
      deviationPercent: project.isDelayed ? Math.round(monthsOverdue) : 0,
      isRiskContributor: project.isDelayed,
    },
    {
      label: "Schedule Status",
      sourceField: "isDelayed (derived)",
      observedValue: project.isDelayed
        ? `Overdue by ${Math.round(monthsOverdue)} months`
        : `${Math.round(monthsRemaining)} months remaining`,
      baselineValue: "Target not yet passed",
      deviationPercent: project.isDelayed ? Math.round(monthsOverdue * 5) : 0,
      isRiskContributor: project.isDelayed,
    },
    {
      label: "Physical Progress at Assessment",
      sourceField: "physicalProgressPct",
      observedValue: `${project.physicalProgressPct}%`,
      baselineValue: project.isDelayed ? "100% expected" : "Proportionate to elapsed time",
      deviationPercent: project.isDelayed ? (100 - project.physicalProgressPct) : 0,
      isRiskContributor: project.isDelayed && project.physicalProgressPct < 100,
    },
  ];

  return {
    dimension: "SCHEDULE",
    label: "Schedule Risk",
    score,
    level,
    evidence,
    contributingFactors: factors,
    method: "DETERMINISTIC",
    methodDescription:
      "If target date has passed: base score 60 + 2 per overdue month (max 95). If on schedule: time-vs-progress proportionality check with scored thresholds at 6, 12, and 24 months.",
  };
}
