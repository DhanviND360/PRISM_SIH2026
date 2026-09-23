/**
 * PRISM Intervention & Decision Support Engine — Main Orchestrator
 *
 * Provides executive decision support for infrastructure monitoring:
 *   - Investigation Priority assignment
 *   - Ranked Risk Drivers
 *   - Evidence-Linked Interventions
 *   - Sector & Portfolio Baselines
 *   - What PRISM Knows / What PRISM Does Not Know
 *   - Data Confidence Tier evaluation
 */

import type { Project } from "@/types/project";
import type { ProjectRiskAssessment } from "@/analytics/risk-engine";
import { computeSectorBenchmark } from "./sector-baselines";
import {
  evaluateInvestigationPriority,
  extractRankedDrivers,
  generateInterventions,
  generateNextMonitoringAction,
  buildKnowledgeBoundary,
  deriveProjectTrend,
} from "./rules";
import type { ProjectInterventionPlan } from "./types";

export function generateInterventionPlan(
  project: Project,
  assessment: ProjectRiskAssessment,
  allProjects: Project[]
): ProjectInterventionPlan {
  const { priority, rationale } = evaluateInvestigationPriority(project, assessment);
  const rankedDrivers = extractRankedDrivers(assessment);
  const sectorBenchmark = computeSectorBenchmark(project, allProjects);
  const interventions = generateInterventions(project, assessment);
  const nextMonitoringAction = generateNextMonitoringAction(project, assessment);
  const knowledgeBoundary = buildKnowledgeBoundary(project, assessment);
  const trend = deriveProjectTrend(project);

  return {
    projectId: project.id,
    investigationPriority: priority,
    priorityRationale: rationale,
    rankedDrivers,
    sectorBenchmark,
    interventions,
    nextMonitoringAction,
    knowledgeBoundary,
    trend,
  };
}

export type {
  ProjectInterventionPlan,
  InvestigationPriority,
  DataConfidenceTier,
  InterventionRecommendation,
  SectorBenchmark,
  KnowledgeBoundary,
  RankedRiskDriver,
  ProjectTrend,
} from "./types";
