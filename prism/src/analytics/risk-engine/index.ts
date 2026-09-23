/**
 * PRISM Risk Engine — Main Orchestrator
 *
 * Composes the three independent risk-dimension predictors into
 * a single ProjectRiskAssessment. Each predictor is modular and
 * can be swapped for a trained ML model without changing the
 * orchestration logic.
 *
 * Engine version: 1.0.0-deterministic
 */

import type { Project } from "@/types/project";
import type {
  ProjectRiskAssessment,
  RiskDimensionResult,
  DataCompleteness,
} from "./types";
import type { RiskLevel } from "@/analytics/portfolio-stats";
import { computeCostRisk } from "./cost-risk";
import { computeScheduleRisk } from "./schedule-risk";
import { computeImplementationRisk } from "./implementation-risk";

const ENGINE_VERSION = "1.0.0-deterministic";

// ── Dimension weights for overall score composition ─────────────────

const DIMENSION_WEIGHTS: Record<RiskDimensionResult["dimension"], number> = {
  COST: 0.40,
  SCHEDULE: 0.35,
  IMPLEMENTATION: 0.25,
};

// ── Data completeness assessment ────────────────────────────────────

function assessDataCompleteness(project: Project): DataCompleteness {
  // Fields the engine attempts to use
  const allFields = [
    { name: "originalCostCr", available: project.originalCostCr > 0 },
    { name: "revisedCostCr", available: project.revisedCostCr > 0 },
    { name: "physicalProgressPct", available: project.physicalProgressPct >= 0 },
    { name: "revisedCompletionDate", available: !!project.revisedCompletionDate },
    { name: "costOverrunRatio", available: project.costOverrunRatio >= 0 },
    { name: "isDelayed", available: typeof project.isDelayed === "boolean" },
    { name: "sector", available: !!project.sector },
    { name: "implementingAgency", available: !!project.implementingAgency },
    // Fields we WISH we had from full PAIMANA but don't in the sample
    { name: "expenditureToDateCr", available: false },
    { name: "originalCompletionDate", available: false },
    { name: "projectStartDate", available: false },
    { name: "stateLocation", available: false },
  ];

  const available = allFields.filter((f) => f.available);
  const missing = allFields.filter((f) => !f.available);

  return {
    totalFields: allFields.length,
    availableFields: available.length,
    completenessPercent: Math.round((available.length / allFields.length) * 100),
    missingFields: missing.map((f) => f.name),
    usedFields: available.map((f) => f.name),
  };
}

// ── Overall level from score ────────────────────────────────────────

function scoreToLevel(score: number): RiskLevel {
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

// ── WHAT / WHY / EVIDENCE narrative generators ──────────────────────

function generateWhatSummary(
  project: Project,
  overallScore: number,
  dims: RiskDimensionResult[]
): string {
  const costDim = dims.find((d) => d.dimension === "COST")!;
  const schedDim = dims.find((d) => d.dimension === "SCHEDULE")!;
  const implDim = dims.find((d) => d.dimension === "IMPLEMENTATION")!;

  const parts: string[] = [];

  parts.push(
    `${project.name} is a ₹ ${project.revisedCostCr.toLocaleString("en-IN")} Cr project in the ${project.sector} sector, implemented by ${project.implementingAgency}.`
  );

  if (project.physicalProgressPct === 0) {
    parts.push(`Physical progress has not commenced (0%).`);
  } else {
    parts.push(`Physical progress stands at ${project.physicalProgressPct}%.`);
  }

  if (project.isDelayed) {
    parts.push(`The project has passed its revised target completion date of ${project.revisedCompletionDate}.`);
  } else {
    parts.push(`The revised target completion date is ${project.revisedCompletionDate}.`);
  }

  if (project.costOverrunRatio > 1.0) {
    const overrunPct = Math.round((project.costOverrunRatio - 1) * 100);
    parts.push(
      `Budget has escalated by ${overrunPct}% from the original sanction of ₹ ${project.originalCostCr.toLocaleString("en-IN")} Cr.`
    );
  } else if (project.revisedCostCr < project.originalCostCr) {
    parts.push(`Revised cost is below original sanction.`);
  } else {
    parts.push(`No cost escalation from original sanctioned budget.`);
  }

  parts.push(
    `PRISM overall risk score: ${overallScore}/100 (Cost: ${costDim.score}, Schedule: ${schedDim.score}, Implementation: ${implDim.score}).`
  );

  return parts.join(" ");
}

function generateWhySummary(
  project: Project,
  dims: RiskDimensionResult[]
): string {
  // Collect all HIGH/MEDIUM contributing factors across dimensions
  const allFactors = dims.flatMap((d) =>
    d.contributingFactors
      .filter((f) => f.severity !== "LOW")
      .map((f) => ({ dimLabel: d.label, ...f }))
  );

  if (allFactors.length === 0) {
    return `PRISM does not flag any elevated risk signals for this project. Cost, schedule, and implementation metrics all fall within normal parameters based on available PAIMANA data.`;
  }

  const parts: string[] = [
    `PRISM flags this project because of ${allFactors.length} risk signal${allFactors.length === 1 ? "" : "s"}:`
  ];

  for (const f of allFactors) {
    parts.push(`[${f.dimLabel}] ${f.title}: ${f.description}`);
  }

  return parts.join(" ");
}

function generateEvidenceSummary(
  dims: RiskDimensionResult[],
  completeness: DataCompleteness
): string {
  const evidenceItems = dims.flatMap((d) =>
    d.evidence.filter((e) => e.isRiskContributor)
  );

  const parts: string[] = [];

  if (evidenceItems.length > 0) {
    parts.push("Supporting evidence from PAIMANA data:");
    for (const e of evidenceItems) {
      parts.push(`• ${e.label}: ${e.observedValue} (baseline: ${e.baselineValue}, deviation: ${e.deviationPercent > 0 ? `+${e.deviationPercent}%` : "0%"}).`);
    }
  } else {
    parts.push("No data points contributed to risk elevation.");
  }

  parts.push(
    `Data completeness: ${completeness.completenessPercent}% (${completeness.availableFields}/${completeness.totalFields} fields available).`
  );

  if (completeness.missingFields.length > 0) {
    parts.push(
      `Missing fields: ${completeness.missingFields.join(", ")}. These would improve assessment precision if available from PAIMANA/OCMS.`
    );
  }

  parts.push(
    `All scores are deterministic (engine v${ENGINE_VERSION}). No ML model or LLM was used. Scores are reproducible from identical input data.`
  );

  return parts.join(" ");
}

// ── Main assessment function ────────────────────────────────────────

/**
 * Run the full PRISM risk assessment for a single project.
 *
 * Returns a complete ProjectRiskAssessment with:
 *  - 3 independent dimension scores
 *  - Weighted composite overall score
 *  - WHAT / WHY / EVIDENCE narratives
 *  - Data completeness audit
 *  - Engine version for reproducibility
 */
export function assessProjectRisk(project: Project): ProjectRiskAssessment {
  // Run each independent predictor
  const costResult = computeCostRisk(project);
  const scheduleResult = computeScheduleRisk(project);
  const implementationResult = computeImplementationRisk(project);

  const dimensions: RiskDimensionResult[] = [
    costResult,
    scheduleResult,
    implementationResult,
  ];

  // Weighted composite
  const overallScore = Math.round(
    costResult.score * DIMENSION_WEIGHTS.COST +
    scheduleResult.score * DIMENSION_WEIGHTS.SCHEDULE +
    implementationResult.score * DIMENSION_WEIGHTS.IMPLEMENTATION
  );
  const overallLevel = scoreToLevel(overallScore);

  // Data completeness
  const dataCompleteness = assessDataCompleteness(project);

  // Generate narratives
  const whatSummary = generateWhatSummary(project, overallScore, dimensions);
  const whySummary = generateWhySummary(project, dimensions);
  const evidenceSummary = generateEvidenceSummary(dimensions, dataCompleteness);

  return {
    projectId: project.id,
    computedAt: new Date().toISOString(),
    overallScore,
    overallLevel,
    dimensions,
    dataCompleteness,
    whatSummary,
    whySummary,
    evidenceSummary,
    engineVersion: ENGINE_VERSION,
  };
}

// Re-export types for convenience
export type { ProjectRiskAssessment, RiskDimensionResult, DataCompleteness, EvidenceItem, ContributingFactor } from "./types";
