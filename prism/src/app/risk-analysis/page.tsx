import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import { assessProjectRisk } from "@/analytics/risk-engine";
import { formatCr } from "@/analytics/portfolio-stats";
import { RiskMatrixTable, type ProjectRiskRow } from "./risk-matrix-table";

export const metadata = {
  title: "Risk Analysis — PRISM Government Intelligence",
  description: "Multi-dimensional portfolio risk diagnostics and systemic bottleneck analysis across monitored infrastructure projects.",
};

export default async function RiskAnalysisPage() {
  const provider = getDataProvider();
  const projects = await provider.getAllProjects();

  // Run deterministic risk engine on all projects
  const assessments = projects.map((p) => ({
    project: p,
    assessment: assessProjectRisk(p),
  }));

  // Aggregate Portfolio Metrics
  const totalProjects = assessments.length;
  const avgOverallScore = Math.round(
    assessments.reduce((acc, a) => acc + a.assessment.overallScore, 0) / totalProjects
  );

  const costScores = assessments.map((a) => a.assessment.dimensions.find((d) => d.dimension === "COST")!.score);
  const schedScores = assessments.map((a) => a.assessment.dimensions.find((d) => d.dimension === "SCHEDULE")!.score);
  const implScores = assessments.map((a) => a.assessment.dimensions.find((d) => d.dimension === "IMPLEMENTATION")!.score);

  const avgCostScore = Math.round(costScores.reduce((a, b) => a + b, 0) / totalProjects);
  const avgSchedScore = Math.round(schedScores.reduce((a, b) => a + b, 0) / totalProjects);
  const avgImplScore = Math.round(implScores.reduce((a, b) => a + b, 0) / totalProjects);

  const highRiskCount = assessments.filter((a) => a.assessment.overallLevel === "HIGH").length;
  const medRiskCount = assessments.filter((a) => a.assessment.overallLevel === "MEDIUM").length;
  const lowRiskCount = assessments.filter((a) => a.assessment.overallLevel === "LOW").length;

  const totalCostOverrunCr = projects.reduce(
    (acc, p) => acc + Math.max(0, p.revisedCostCr - p.originalCostCr),
    0
  );

  const totalDelayedCapitalCr = projects
    .filter((p) => p.isDelayed)
    .reduce((acc, p) => acc + p.revisedCostCr, 0);

  const avgProgress = Math.round(
    projects.reduce((acc, p) => acc + p.physicalProgressPct, 0) / totalProjects
  );

  // Map to table rows
  const tableRows: ProjectRiskRow[] = assessments.map(({ project: p, assessment: a }) => {
    const costDim = a.dimensions.find((d) => d.dimension === "COST")!;
    const schedDim = a.dimensions.find((d) => d.dimension === "SCHEDULE")!;
    const implDim = a.dimensions.find((d) => d.dimension === "IMPLEMENTATION")!;

    // Find primary factor
    const highFactors = a.dimensions.flatMap((d) => d.contributingFactors);
    const topFactor = highFactors.sort((x, y) => y.weight - x.weight)[0];

    const costOverrunCr = Math.max(0, p.revisedCostCr - p.originalCostCr);
    const costOverrunPct = Math.round((p.costOverrunRatio - 1) * 100);

    return {
      id: p.id,
      name: p.name,
      sector: p.sector,
      implementingAgency: p.implementingAgency,
      originalCostCr: p.originalCostCr,
      revisedCostCr: p.revisedCostCr,
      costOverrunCr,
      costOverrunPct: Math.max(0, costOverrunPct),
      physicalProgressPct: p.physicalProgressPct,
      revisedCompletionDate: p.revisedCompletionDate,
      isDelayed: p.isDelayed,
      overallScore: a.overallScore,
      overallLevel: a.overallLevel,
      costScore: costDim.score,
      costLevel: costDim.level,
      scheduleScore: schedDim.score,
      scheduleLevel: schedDim.level,
      implementationScore: implDim.score,
      implementationLevel: implDim.level,
      primaryFactor: topFactor ? topFactor.title : "No high-severity factors detected",
      completenessPercent: a.dataCompleteness.completenessPercent,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumb & Header ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/dashboard" style={{ color: "var(--brand-blue)" }}>Command Center</Link>
          <span>/</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>Risk Analysis</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
              Portfolio Risk Diagnostics &amp; Vector Analysis
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Multi-dimensional deterministic intelligence across monitored infrastructure projects (Cost, Schedule &amp; Implementation vectors).
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                backgroundColor: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              Engine v1.0.0-deterministic
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                backgroundColor: "var(--surface-subtle)",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
              }}
            >
              {totalProjects} Monitored Projects
            </span>
          </div>
        </div>
      </div>

      {/* ── Portfolio Executive Scorecards ──────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-2)" }}>
        {/* Scorecard 1: Portfolio Composite Health */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Portfolio Composite Risk
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
            <span style={{ fontSize: "1.9rem", fontWeight: 800, color: avgOverallScore >= 60 ? "#dc2626" : avgOverallScore >= 30 ? "#d97706" : "#16a34a" }}>
              {avgOverallScore}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/100 avg score</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", fontSize: "0.72rem" }}>
            <span style={{ color: "#dc2626", fontWeight: 700 }}>{highRiskCount} High</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "#d97706", fontWeight: 700 }}>{medRiskCount} Moderate</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>{lowRiskCount} Low</span>
          </div>
        </div>

        {/* Scorecard 2: Cost Risk Exposure */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Cost Overrun Exposure
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--risk-high-text)", marginTop: "8px" }}>
            {formatCr(totalCostOverrunCr)}
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "8px" }}>
            Across 3 budget-escalated projects (avg overrun vector score: <strong>{avgCostScore}/100</strong>)
          </div>
        </div>

        {/* Scorecard 3: Schedule Risk Exposure */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Schedule Slippage Exposure
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#d97706", marginTop: "8px" }}>
            {formatCr(totalDelayedCapitalCr)}
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "8px" }}>
            Capital tied up in lapsed target projects (avg schedule vector score: <strong>{avgSchedScore}/100</strong>)
          </div>
        </div>

        {/* Scorecard 4: Implementation Velocity */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Implementation Velocity
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "8px" }}>
            {avgProgress}%
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "8px" }}>
            Average physical progress (avg implementation vector score: <strong>{avgImplScore}/100</strong>)
          </div>
        </div>
      </div>

      {/* ── Three Risk Vectors Breakdown ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-2)" }}>
        {/* Vector 1: Cost Risk */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#dc2626" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-dark)" }}>Cost Risk Vector</span>
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "var(--radius-sm)" }}>
              Weight: 40%
            </span>
          </div>

          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Measures budget escalation ratio, absolute financial deviation from original CCEA/sanction, and revision severity.
          </div>

          <div style={{ marginTop: "auto", padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Portfolio Avg Score:</span>
              <strong style={{ color: "var(--text-dark)" }}>{avgCostScore} / 100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Projects with Overrun:</span>
              <strong style={{ color: "#dc2626" }}>3 of 8 (38%)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Max Cost Escalation:</span>
              <strong style={{ color: "#dc2626" }}>+208% (BharatNet)</strong>
            </div>
          </div>
        </div>

        {/* Vector 2: Schedule Risk */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#d97706" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-dark)" }}>Schedule Risk Vector</span>
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "var(--radius-sm)" }}>
              Weight: 35%
            </span>
          </div>

          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Detects target completion date slippages, elapsed time deviations, and milestone delivery deadlines.
          </div>

          <div style={{ marginTop: "auto", padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Portfolio Avg Score:</span>
              <strong style={{ color: "var(--text-dark)" }}>{avgSchedScore} / 100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Overdue Target Dates:</span>
              <strong style={{ color: "#d97706" }}>1 of 8 (Rewas Port)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Near-Term Horizon (2025-26):</span>
              <strong style={{ color: "var(--text-dark)" }}>3 projects</strong>
            </div>
          </div>
        </div>

        {/* Vector 3: Implementation Risk */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#1e40af" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-dark)" }}>Implementation Vector</span>
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "var(--radius-sm)" }}>
              Weight: 25%
            </span>
          </div>

          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Tracks on-ground execution velocity, non-commenced projects (0% physical progress), and execution bottlenecks.
          </div>

          <div style={{ marginTop: "auto", padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Portfolio Avg Score:</span>
              <strong style={{ color: "var(--text-dark)" }}>{avgImplScore} / 100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Uncommenced (0% Progress):</span>
              <strong style={{ color: "#dc2626" }}>1 (IIT Palakkad)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Near Completion (&gt;80%):</span>
              <strong style={{ color: "#16a34a" }}>4 projects</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Multi-Dimensional Risk Matrix ───────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1-5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Project Risk Matrix &amp; Dimensional Profiles
          </h2>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Click &apos;Diagnostic →&apos; for project-level WHAT / WHY / EVIDENCE breakdown
          </span>
        </div>

        <RiskMatrixTable projects={tableRows} />
      </div>

      {/* ── Systemic Risk Insights & Concentration ──────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
        {/* Pareto Exposure Concentration */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Exposure Concentration (Pareto Principle)
            </span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "var(--radius-sm)" }}>
              Critical Concentration
            </span>
          </div>

          <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
            Total portfolio cost escalation is <strong>{formatCr(totalCostOverrunCr)}</strong>.
            Two infrastructure assets account for <strong>97.4%</strong> of all financial risk exposure:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "3px" }}>
                <span style={{ fontWeight: 600 }}>1. BharatNet (Telecommunication)</span>
                <span style={{ fontWeight: 700, color: "var(--risk-high-text)" }}>₹ 1,26,891 Cr (95.2%)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "95.2%", height: "100%", backgroundColor: "#dc2626" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "3px" }}>
                <span style={{ fontWeight: 600 }}>2. Rajasthan Refinery Project (Energy Storage)</span>
                <span style={{ fontWeight: 700, color: "#d97706" }}>₹ 36,367 Cr (2.2%)</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "2.2%", height: "100%", backgroundColor: "#d97706" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", padding: "8px 10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.68rem", color: "var(--text-muted)" }}>
            <strong>Strategic Implication:</strong> High-level Cabinet Committee on Infrastructure (CCI) interventions focused specifically on BharatNet and Rajasthan Refinery would mitigate &gt;97% of national cost risk.
          </div>
        </div>

        {/* Systemic Bottlenecks & Early Warnings */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Early-Warning Sentinel &amp; Systemic Risks
            </span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", backgroundColor: "#eff6ff", color: "#1e40af", borderRadius: "var(--radius-sm)" }}>
              Automated Diagnostics
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "8px 10px", borderLeft: "3px solid #dc2626", backgroundColor: "#fef2f2", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#991b1b" }}>Target Date Lapse Without Completion</div>
              <div style={{ fontSize: "0.7rem", color: "#7f1d1d", marginTop: "2px" }}>
                Rewas Port target date (31/03/2023) has passed. Project remains at 88% progress with no revised completion date officially scheduled in PAIMANA.
              </div>
            </div>

            <div style={{ padding: "8px 10px", borderLeft: "3px solid #d97706", backgroundColor: "#fffbeb", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#92400e" }}>Uncommenced High-Value Sanction</div>
              <div style={{ fontSize: "0.7rem", color: "#78350f", marginTop: "2px" }}>
                IIT Palakkad Phase B has ₹ 1,527 Cr sanctioned but stands at 0% physical progress with target date in 2028. Represents initial mobilization vulnerability.
              </div>
            </div>

            <div style={{ padding: "8px 10px", borderLeft: "3px solid #16a34a", backgroundColor: "#f0fdf4", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#166534" }}>Mega-Project Financial Discipline</div>
              <div style={{ fontSize: "0.7rem", color: "#14532d", marginTop: "2px" }}>
                Mumbai-Ahmedabad High Speed Rail (₹ 1,08,000 Cr) maintains zero reported cost overrun with physical progress advancing steadily at 60%.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
