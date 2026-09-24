/**
 * PRISM Alert Subsystem
 *
 * Dynamically computes real early warning alerts across the portfolio based on:
 *   - Critical Cost Escalations (> ₹1,000 Cr or > 25% overrun)
 *   - Schedule Lapses (target date passed while progress < 100%)
 *   - Milestone Execution Bottlenecks (< 12 months remaining with < 60% progress)
 *   - Mega-Projects with Initial Stagnation (Cost > ₹20,000 Cr with < 5% progress)
 */

import type { Project } from "@/types/project";
import { formatCr } from "@/analytics/portfolio-stats";

export interface ActiveAlert {
  id: string;
  projectId: string;
  projectName: string;
  sector: string;
  agency: string;
  severity: "CRITICAL" | "WARNING" | "WATCHLIST";
  title: string;
  description: string;
  metricBadge: string;
  category: "COST_OVERRUN" | "SCHEDULE_LAPSE" | "PACE_STAGNATION" | "MEGA_RISK";
  timestamp: string;
}

export function computeActiveAlerts(projects: Project[]): ActiveAlert[] {
  const alerts: ActiveAlert[] = [];
  const now = new Date();

  for (const p of projects) {
    const costEscalation = Math.max(0, p.revisedCostCr - p.originalCostCr);
    const costEscalationPct = Math.round((p.costOverrunRatio - 1) * 100);
    const targetDate = new Date(p.revisedCompletionDate);
    const diffMs = targetDate.getTime() - now.getTime();
    const monthsRemaining = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    // 1. Critical Cost Escalation
    if (costEscalation >= 1000 || costEscalationPct >= 30) {
      alerts.push({
        id: `alert-cost-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        sector: p.sector,
        agency: p.implementingAgency,
        severity: "CRITICAL",
        category: "COST_OVERRUN",
        title: `Severe Budget Escalation: +${formatCr(costEscalation)}`,
        description: `Revised cost reached ₹ ${p.revisedCostCr.toLocaleString("en-IN")} Cr from sanctioned ₹ ${p.originalCostCr.toLocaleString("en-IN")} Cr (+${costEscalationPct}% overrun).`,
        metricBadge: `+${costEscalationPct}% Cost Overrun`,
        timestamp: "Triggered by April 2026 Ingest",
      });
    }

    // 2. Schedule Lapse (Date expired while incomplete)
    if (p.isDelayed) {
      const overdueMonths = Math.max(1, Math.round((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
      alerts.push({
        id: `alert-delay-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        sector: p.sector,
        agency: p.implementingAgency,
        severity: "CRITICAL",
        category: "SCHEDULE_LAPSE",
        title: `Target Deadline Lapsed (${overdueMonths} Months Overdue)`,
        description: `Project deadline (${p.revisedCompletionDate}) has passed, yet physical progress stands at only ${p.physicalProgressPct}%.`,
        metricBadge: `${p.physicalProgressPct}% at Expiry`,
        timestamp: "Active Delay Flag",
      });
    }
    // 3. Imminent Schedule Risk
    else if (monthsRemaining > 0 && monthsRemaining <= 12 && p.physicalProgressPct < 60) {
      alerts.push({
        id: `alert-pace-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        sector: p.sector,
        agency: p.implementingAgency,
        severity: "WARNING",
        category: "PACE_STAGNATION",
        title: `Critical Pace Mismatch: ${Math.round(monthsRemaining)} Mos to Target`,
        description: `Only ${Math.round(monthsRemaining)} months remain until ${p.revisedCompletionDate}, but physical completion is at ${p.physicalProgressPct}%.`,
        metricBadge: `${p.physicalProgressPct}% Complete`,
        timestamp: "Early Warning Trigger",
      });
    }

    // 4. Mega-Project Stagnation
    if (p.originalCostCr >= 20000 && p.physicalProgressPct <= 5 && !p.isDelayed) {
      alerts.push({
        id: `alert-mega-${p.id}`,
        projectId: p.id,
        projectName: p.name,
        sector: p.sector,
        agency: p.implementingAgency,
        severity: "WATCHLIST",
        category: "MEGA_RISK",
        title: `Mega-Capital Project Stagnation: ₹ ${p.originalCostCr.toLocaleString("en-IN")} Cr`,
        description: `High capital exposure with minimal physical progress (${p.physicalProgressPct}%). High vulnerability to initial mobilization bottlenecks.`,
        metricBadge: `${p.physicalProgressPct}% Progress`,
        timestamp: "Watchlist Ingest",
      });
    }
  }

  // Sort: CRITICAL first, then WARNING, then WATCHLIST
  const severityOrder = { CRITICAL: 0, WARNING: 1, WATCHLIST: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
