/**
 * PRISM Intervention & Decision Support Engine — Types & Interfaces
 *
 * Models for actionable, evidence-linked government decision support:
 *   - Investigation Priority levels
 *   - 3-tier Data Confidence classification
 *   - Structured Intervention Recommendations
 *   - Sector & Portfolio Baselines
 *   - Knowledge Boundaries ("What PRISM Knows / Does Not Know")
 */

import type { RiskLevel } from "@/analytics/portfolio-stats";

export type InvestigationPriority = "URGENT" | "HIGH" | "ROUTINE" | "WATCHLIST";

export type DataConfidenceTier = "SUFFICIENT" | "LIMITED" | "INSUFFICIENT";

export interface InterventionRecommendation {
  id: string;
  title: string;
  category: "FINANCIAL_AUDIT" | "CONTRACTUAL_REVIEW" | "SCHEDULE_REBASE" | "EXECUTION_ACCELERATION" | "STATUTORY_CLEARANCE" | "MONITORING_GOVERNANCE";
  urgency: "IMMEDIATE" | "NEAR_TERM" | "ROUTINE";
  evidenceTrigger: string;
  observedMetric: string;
  recommendedAction: string;
  responsibleEntity: string;
  targetOutcome: string;
}

export interface SectorBenchmark {
  sector: string;
  projectCount: number;
  avgCostOverrunPct: number;
  avgPhysicalProgressPct: number;
  delayRatePct: number;
  projectCostOverrunPct: number;
  projectProgressPct: number;
  costVarianceFromSector: number; // percentage points above/below sector average
  progressVarianceFromSector: number; // percentage points above/below sector average
}

export interface KnowledgeBoundary {
  whatPrismKnows: {
    field: string;
    value: string;
    verifiedSource: string;
  }[];
  whatPrismDoesNotKnow: {
    field: string;
    impactOnAssessment: string;
    suggestedSource: string;
  }[];
  dataConfidenceTier: DataConfidenceTier;
  confidenceExplanation: string;
  completenessPercent: number;
  fieldsAvailable: number;
  fieldsTotal: number;
}

export interface RankedRiskDriver {
  rank: number;
  dimension: "COST" | "SCHEDULE" | "IMPLEMENTATION";
  title: string;
  description: string;
  severity: RiskLevel;
  impactValue: number;
  impactUnit: string;
  weight: number;
}

export interface ProjectTrend {
  historicalMilestones: {
    event: string;
    date: string;
    delta: string;
    type: "SANCTION" | "REVISION" | "LAPSE" | "MONITORING";
  }[];
  currentVelocityStatus: "ACCELERATING" | "STEADY" | "STALLED" | "OVERDUE";
  velocitySummary: string;
}

export interface ProjectInterventionPlan {
  projectId: string;
  investigationPriority: InvestigationPriority;
  priorityRationale: string;
  rankedDrivers: RankedRiskDriver[];
  sectorBenchmark: SectorBenchmark;
  interventions: InterventionRecommendation[];
  nextMonitoringAction: {
    actionTitle: string;
    deadlineTimeline: string;
    responsibleAuthority: string;
    detailedProtocol: string;
  };
  knowledgeBoundary: KnowledgeBoundary;
  trend: ProjectTrend;
}
