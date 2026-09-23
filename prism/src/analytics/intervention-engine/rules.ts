/**
 * PRISM Intervention Engine — Deterministic Decision Rules
 *
 * All intervention recommendations, investigation priorities,
 * and knowledge boundaries are evaluated strictly through deterministic
 * logic linked to observed PAIMANA evidence.
 *
 * Zero hallucinated government orders or invented values.
 */

import type { Project } from "@/types/project";
import type { ProjectRiskAssessment } from "@/analytics/risk-engine";
import { formatCr } from "@/analytics/portfolio-stats";
import type {
  InvestigationPriority,
  DataConfidenceTier,
  InterventionRecommendation,
  KnowledgeBoundary,
  RankedRiskDriver,
  ProjectTrend,
} from "./types";

export function evaluateInvestigationPriority(
  project: Project,
  assessment: ProjectRiskAssessment
): { priority: InvestigationPriority; rationale: string } {
  const costOverrunPct = Math.round((project.costOverrunRatio - 1) * 100);

  if (assessment.overallScore >= 60 && (costOverrunPct >= 50 || project.isDelayed)) {
    return {
      priority: "URGENT",
      rationale: `Breached critical risk threshold (${assessment.overallScore}/100) with ${
        project.isDelayed ? "lapsed target completion date" : `severe cost escalation (+${costOverrunPct}%)`
      }. Requires immediate inter-ministerial intervention.`,
    };
  }

  if (assessment.overallScore >= 40 || project.isDelayed || costOverrunPct >= 15) {
    return {
      priority: "HIGH",
      rationale: `Elevated risk index (${assessment.overallScore}/100) driven by ${
        project.isDelayed ? "target date slippage" : `budget escalation (+${costOverrunPct}%)`
      }. Active executive monitoring advised.`,
    };
  }

  if (project.physicalProgressPct === 0 && project.originalCostCr > 1000) {
    return {
      priority: "WATCHLIST",
      rationale: `Substantial capital sanction (${formatCr(
        project.originalCostCr
      )}) with 0% on-ground physical progress. Monitoring mobilization pace.`,
    };
  }

  return {
    priority: "ROUTINE",
    rationale: `Key project parameters remain within approved tolerances. Standard quarterly PAIMANA reporting applies.`,
  };
}

export function extractRankedDrivers(assessment: ProjectRiskAssessment): RankedRiskDriver[] {
  const allFactors = assessment.dimensions.flatMap((dim) =>
    dim.contributingFactors.map((f) => ({
      dimension: dim.dimension,
      title: f.title,
      description: f.description,
      severity: f.severity,
      impactValue: f.impactValue,
      impactUnit: f.impactUnit,
      weight: f.weight,
    }))
  );

  // Sort descending by weight, then impact value
  return allFactors
    .sort((a, b) => b.weight - a.weight || b.impactValue - a.impactValue)
    .map((factor, index) => ({
      rank: index + 1,
      ...factor,
    }));
}

export function generateInterventions(
  project: Project,
  assessment: ProjectRiskAssessment
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  const costOverrunCr = Math.max(0, project.revisedCostCr - project.originalCostCr);
  const costOverrunPct = Math.round((project.costOverrunRatio - 1) * 100);

  // Rule 1: Extreme Cost Escalation (>50%)
  if (costOverrunPct >= 50) {
    interventions.push({
      id: "INT-COST-EXTREME",
      title: "Revised Cost Committee (RCC) Comprehensive Financial Audit",
      category: "FINANCIAL_AUDIT",
      urgency: "IMMEDIATE",
      evidenceTrigger: `Cost overrun ratio of ${project.costOverrunRatio.toFixed(2)}x (+${costOverrunPct}%)`,
      observedMetric: `Escalation: +${formatCr(costOverrunCr)} over original sanction of ${formatCr(project.originalCostCr)}`,
      recommendedAction:
        "Convene the Revised Cost Committee (RCC) under the Administrative Ministry to freeze additional scope expansions, re-audit Schedule of Rates (SoR), and submit revised Cabinet Note to CCEA.",
      responsibleEntity: "Cabinet Committee on Economic Affairs (CCEA) & Administrative Ministry",
      targetOutcome: "Halt secondary scope creep and establish fixed final financial ceiling.",
    });
  } else if (costOverrunPct > 0) {
    interventions.push({
      id: "INT-COST-MODERATE",
      title: "Budget Variance & Rate Escalation Scrutiny",
      category: "FINANCIAL_AUDIT",
      urgency: "NEAR_TERM",
      evidenceTrigger: `Approved revised cost exceeds original sanction by ${costOverrunPct}%`,
      observedMetric: `Escalation: +${formatCr(costOverrunCr)}`,
      recommendedAction:
        "Audit line-item bill of quantities (BOQ) with the executing agency to verify whether escalation is driven by material inflation or scope additions.",
      responsibleEntity: "Project Management Unit (PMU) & Finance Division",
      targetOutcome: "Validate expenditure claims against sanctioned revision caps.",
    });
  }

  // Rule 2: Schedule Delay (Target Date Passed)
  if (project.isDelayed) {
    interventions.push({
      id: "INT-SCHED-OVERDUE",
      title: "Target Completion Date Rebaselining & Milestone Recovery",
      category: "SCHEDULE_REBASE",
      urgency: "IMMEDIATE",
      evidenceTrigger: `Revised target completion date (${project.revisedCompletionDate}) has elapsed`,
      observedMetric: `Current physical progress stands at ${project.physicalProgressPct}% with lapsed deadline`,
      recommendedAction:
        "Direct executing agency to submit a revised Critical Path Method (CPM) recovery schedule within 15 days, detailing contractor penalty clauses and revised commissioning timeline.",
      responsibleEntity: "Infrastructure and Project Monitoring Division (IPMD), MoSPI",
      targetOutcome: "Legally binding revised completion schedule with liquidated damages enforcement.",
    });
  }

  // Rule 3: Zero Progress / Mobilization Bottleneck
  if (project.physicalProgressPct === 0) {
    interventions.push({
      id: "INT-EXEC-ZERO-MOBILIZATION",
      title: "Site Handover & Pre-Construction Clearance Taskforce",
      category: "STATUTORY_CLEARANCE",
      urgency: "NEAR_TERM",
      evidenceTrigger: `Physical progress is 0% on sanctioned project worth ${formatCr(project.originalCostCr)}`,
      observedMetric: "0% physical milestone achievement reported in PAIMANA",
      recommendedAction:
        "Convene state-level coordination meeting to expedite encumbrance-free land handover, verify environmental/forest statutory clearances, and inspect contractor mobilization advance utilization.",
      responsibleEntity: "State Coordination Committee & Executing PSU Directorate",
      targetOutcome: "Immediate physical ground-breaking and commencement of civil works.",
    });
  }

  // Rule 4: Near Completion Acceleration
  if (project.physicalProgressPct >= 80 && (project.isDelayed || costOverrunPct > 0)) {
    interventions.push({
      id: "INT-EXEC-FINAL-MILESTONE",
      title: "Testing, Commissioning & Handover Fast-Track",
      category: "EXECUTION_ACCELERATION",
      urgency: "NEAR_TERM",
      evidenceTrigger: `Physical progress has achieved ${project.physicalProgressPct}% but project remains burdened by historical risk`,
      observedMetric: `${100 - project.physicalProgressPct}% physical work remaining for operational commissioning`,
      recommendedAction:
        "Institute weekly punch-list monitoring to resolve remaining integration bottlenecks, safety certifications, and commercial commissioning clearances.",
      responsibleEntity: "Director General / Member (Infrastructure) Monitoring Cell",
      targetOutcome: "Achieve commercial operations date (COD) without further slippage.",
    });
  }

  // Rule 5: Data Completeness Compliance
  if (assessment.dataCompleteness.missingFields.length > 0) {
    interventions.push({
      id: "INT-DATA-COMPLIANCE",
      title: "Mandate Granular Monthly Ingest Feed in PAIMANA Portal",
      category: "MONITORING_GOVERNANCE",
      urgency: "ROUTINE",
      evidenceTrigger: `Missing ${assessment.dataCompleteness.missingFields.length} critical monitoring fields from PAIMANA feed`,
      observedMetric: `Data completeness score: ${assessment.dataCompleteness.completenessPercent}% (${assessment.dataCompleteness.availableFields}/${assessment.dataCompleteness.totalFields} fields)`,
      recommendedAction:
        "Issue administrative notification to field reporting officers to update cumulative cash expenditure, baseline sanction dates, and major contractor entity IDs.",
      responsibleEntity: "PAIMANA Central Data Administration Cell, MoSPI",
      targetOutcome: "Elevate data fidelity to enable multi-variate machine learning prediction.",
    });
  }

  return interventions;
}

export function generateNextMonitoringAction(
  project: Project,
  assessment: ProjectRiskAssessment
): {
  actionTitle: string;
  deadlineTimeline: string;
  responsibleAuthority: string;
  detailedProtocol: string;
} {
  if (project.isDelayed) {
    return {
      actionTitle: "Convene Milestone Recovery Hearing with Implementing Agency",
      deadlineTimeline: "Within 14 Calendar Days",
      responsibleAuthority: "Secretary, Administrative Ministry & Adviser, MoSPI",
      detailedProtocol: `Issue formal summons to ${project.implementingAgency} leadership to present revised milestone recovery schedule for ${project.name}. Require detailed punch-list for remaining ${100 - project.physicalProgressPct}% work and updated commercial operations date.`,
    };
  }

  if (project.costOverrunRatio >= 1.5) {
    return {
      actionTitle: "Initiate Detailed Expenditure & Scope Deviation Audit",
      deadlineTimeline: "Within 21 Calendar Days",
      responsibleAuthority: "Financial Adviser & Revised Cost Committee (RCC)",
      detailedProtocol: `Request forensic breakdown of the +${formatCr(
        project.revisedCostCr - project.originalCostCr
      )} escalation from ${project.implementingAgency}. Cross-examine price escalation clauses against commodity indices to verify legitimacy.`,
    };
  }

  if (project.physicalProgressPct === 0) {
    return {
      actionTitle: "Conduct Pre-Construction Statutory Clearance Review",
      deadlineTimeline: "Within 30 Calendar Days",
      responsibleAuthority: "Project Monitoring Group (PMG) / Cabinet Secretariat",
      detailedProtocol: `Engage with relevant State departments to review land acquisition status, environmental clearances, and contractor mobilization for ${project.name}.`,
    };
  }

  return {
    actionTitle: "Quarterly Routine Milestone & Expenditure Verification",
    deadlineTimeline: "Next PAIMANA Ingest Cycle (30 Days)",
    responsibleAuthority: "Infrastructure and Project Monitoring Division (IPMD), MoSPI",
    detailedProtocol: `Verify continued adherence to ${project.revisedCompletionDate} completion milestone and monitor physical progress increments against expenditure reports.`,
  };
}

export function buildKnowledgeBoundary(
  project: Project,
  assessment: ProjectRiskAssessment
): KnowledgeBoundary {
  const whatPrismKnows = [
    { field: "Approved Original Sanction", value: formatCr(project.originalCostCr), verifiedSource: "CCEA / PAIMANA Record" },
    { field: "Approved Latest Revised Cost", value: formatCr(project.revisedCostCr), verifiedSource: "Cabinet Note / PAIMANA Record" },
    { field: "Reported Physical Progress", value: `${project.physicalProgressPct}%`, verifiedSource: "Monthly Agency Return" },
    { field: "Target Completion Date", value: project.revisedCompletionDate, verifiedSource: "Official Approved Schedule" },
    { field: "Executing Entity", value: project.implementingAgency, verifiedSource: "Administrative Ministry Gazette" },
    { field: "Sector Classification", value: project.sector, verifiedSource: "MoSPI Line Classification" },
  ];

  const whatPrismDoesNotKnow = [
    { field: "Cumulative Cash Expenditure", impactOnAssessment: "Cannot calculate financial burn rate vs physical work completed.", suggestedSource: "PFMS / Agency Ledger" },
    { field: "Original Sanction Date", impactOnAssessment: "Cannot compute total elapsed lifecycle duration since baseline inception.", suggestedSource: "Initial CCEA Approval" },
    { field: "Contractor IDs & Performance", impactOnAssessment: "Cannot evaluate contractor historical delivery reliability across sectors.", suggestedSource: "CPPP / GeM Portal" },
    { field: "Statutory Clearance Milestones", impactOnAssessment: "Cannot isolate forest, land, or railway clearance bottlenecks.", suggestedSource: "Parivesh / PMG Portal" },
  ];

  const percent = assessment.dataCompleteness.completenessPercent;
  let tier: DataConfidenceTier = "LIMITED";
  let explanation = "";

  if (percent >= 75) {
    tier = "SUFFICIENT";
    explanation = "Comprehensive field coverage allows high-confidence deterministic scoring and robust predictive evaluation.";
  } else if (percent >= 45) {
    tier = "LIMITED";
    explanation = "Core structural metrics (cost, completion date, progress) are verified, but absence of expenditure and milestone histories limits temporal forecasting.";
  } else {
    tier = "INSUFFICIENT";
    explanation = "Critical parameters are missing. Predictions should be treated with extreme caution until ingest gaps are resolved.";
  }

  return {
    whatPrismKnows,
    whatPrismDoesNotKnow,
    dataConfidenceTier: tier,
    confidenceExplanation: explanation,
    completenessPercent: percent,
    fieldsAvailable: assessment.dataCompleteness.availableFields,
    fieldsTotal: assessment.dataCompleteness.totalFields,
  };
}

export function deriveProjectTrend(project: Project): ProjectTrend {
  const milestones: ProjectTrend["historicalMilestones"] = [];

  milestones.push({
    event: "Baseline Sanction Approved",
    date: "Original Inception",
    delta: formatCr(project.originalCostCr),
    type: "SANCTION",
  });

  if (project.revisedCostCr !== project.originalCostCr) {
    const diff = project.revisedCostCr - project.originalCostCr;
    milestones.push({
      event: "Approved Budget Revision",
      date: "Cabinet Committee Revision",
      delta: `${diff > 0 ? "+" : ""}${formatCr(diff)} (${Math.round((project.costOverrunRatio - 1) * 100)}%)`,
      type: "REVISION",
    });
  }

  if (project.isDelayed) {
    milestones.push({
      event: "Target Completion Date Lapsed",
      date: project.revisedCompletionDate,
      delta: `Overdue (Progress: ${project.physicalProgressPct}%)`,
      type: "LAPSE",
    });
  } else {
    milestones.push({
      event: "Target Completion Milestone",
      date: project.revisedCompletionDate,
      delta: `Targeted at ${project.physicalProgressPct}% progress`,
      type: "MONITORING",
    });
  }

  let velocityStatus: ProjectTrend["currentVelocityStatus"] = "STEADY";
  let velocitySummary = "";

  if (project.isDelayed) {
    velocityStatus = "OVERDUE";
    velocitySummary = `Project has passed its formal target completion milestone of ${project.revisedCompletionDate} without reaching 100% completion.`;
  } else if (project.physicalProgressPct === 0) {
    velocityStatus = "STALLED";
    velocitySummary = `Physical progress has not commenced on-ground. Mobilization or pre-construction clearances required.`;
  } else if (project.physicalProgressPct >= 80) {
    velocityStatus = "ACCELERATING";
    velocitySummary = `Project is in advanced execution stage (${project.physicalProgressPct}%) nearing final testing and commissioning.`;
  } else {
    velocityStatus = "STEADY";
    velocitySummary = `Execution is progressing in active construction phase with ${project.physicalProgressPct}% physical progress reported.`;
  }

  return {
    historicalMilestones: milestones,
    currentVelocityStatus: velocityStatus,
    velocitySummary,
  };
}
