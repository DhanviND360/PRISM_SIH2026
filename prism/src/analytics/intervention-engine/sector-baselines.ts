/**
 * PRISM Intervention Engine — Sector & Portfolio Baselines
 *
 * Computes comparative benchmarks strictly from the available project dataset.
 * Zero invented statistics.
 */

import type { Project } from "@/types/project";
import type { SectorBenchmark } from "./types";

export function computeSectorBenchmark(targetProject: Project, allProjects: Project[]): SectorBenchmark {
  const sameSectorProjects = allProjects.filter((p) => p.sector === targetProject.sector);
  const benchmarkGroup = sameSectorProjects.length > 0 ? sameSectorProjects : allProjects;

  const totalProjects = benchmarkGroup.length;

  // Average cost overrun in sector
  const totalOverrunPct = benchmarkGroup.reduce((acc, p) => {
    const overrun = Math.max(0, (p.costOverrunRatio - 1) * 100);
    return acc + overrun;
  }, 0);
  const avgCostOverrunPct = Math.round(totalOverrunPct / totalProjects);

  // Average progress in sector
  const totalProgressPct = benchmarkGroup.reduce((acc, p) => acc + p.physicalProgressPct, 0);
  const avgPhysicalProgressPct = Math.round(totalProgressPct / totalProjects);

  // Delay rate in sector
  const delayedCount = benchmarkGroup.filter((p) => p.isDelayed).length;
  const delayRatePct = Math.round((delayedCount / totalProjects) * 100);

  // Target project values
  const projectCostOverrunPct = Math.max(0, Math.round((targetProject.costOverrunRatio - 1) * 100));
  const projectProgressPct = targetProject.physicalProgressPct;

  const costVarianceFromSector = projectCostOverrunPct - avgCostOverrunPct;
  const progressVarianceFromSector = projectProgressPct - avgPhysicalProgressPct;

  return {
    sector: targetProject.sector,
    projectCount: totalProjects,
    avgCostOverrunPct,
    avgPhysicalProgressPct,
    delayRatePct,
    projectCostOverrunPct,
    projectProgressPct,
    costVarianceFromSector,
    progressVarianceFromSector,
  };
}
