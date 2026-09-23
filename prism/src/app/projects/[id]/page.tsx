import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/data-provider";
import { formatCr } from "@/analytics/portfolio-stats";
import { assessProjectRisk } from "@/analytics/risk-engine";
import { predictCostOverrun } from "@/ml-api";
import { generateInterventionPlan } from "@/analytics/intervention-engine";
import { RiskBadge } from "@/components";

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

/* ── Color & Theme Helpers ─────────────────────────────────────────── */

function dimensionColor(level: string) {
  if (level === "HIGH") return "#dc2626";
  if (level === "MEDIUM") return "#d97706";
  return "#16a34a";
}

function dimensionBg(level: string) {
  if (level === "HIGH") return "#fef2f2";
  if (level === "MEDIUM") return "#fffbeb";
  return "#f0fdf4";
}

function priorityColor(priority: string) {
  if (priority === "URGENT") return { text: "#991b1b", bg: "#fee2e2", border: "#fca5a5" };
  if (priority === "HIGH") return { text: "#92400e", bg: "#fef3c7", border: "#fcd34d" };
  if (priority === "WATCHLIST") return { text: "#1e40af", bg: "#dbeafe", border: "#93c5fd" };
  return { text: "#166534", bg: "#dcfce7", border: "#86efac" };
}

function confidenceTierColor(tier: string) {
  if (tier === "SUFFICIENT") return { text: "#166534", bg: "#dcfce7", border: "#86efac", label: "Sufficient Data" };
  if (tier === "LIMITED") return { text: "#92400e", bg: "#fef3c7", border: "#fcd34d", label: "Limited Data" };
  return { text: "#991b1b", bg: "#fee2e2", border: "#fca5a5", label: "Insufficient Data" };
}

/* ── Main Page Component ────────────────────────────────────────────── */

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { id } = await params;
  const provider = getDataProvider();
  const project = await provider.getProjectById(id);

  if (!project) {
    notFound();
  }

  const allProjects = await provider.getAllProjects();

  // Run PRISM deterministic risk engine
  const assessment = assessProjectRisk(project);

  // Run PRISM experimental ML prediction
  const mlPrediction = predictCostOverrun(project);

  // Run PRISM deterministic intervention engine
  const interventionPlan = generateInterventionPlan(project, assessment, allProjects);

  const costEscalation = Math.max(0, project.revisedCostCr - project.originalCostCr);
  const costEscalationPct = Math.round((project.costOverrunRatio - 1) * 100);

  const priorityStyle = priorityColor(interventionPlan.investigationPriority);
  const confidenceStyle = confidenceTierColor(interventionPlan.knowledgeBoundary.dataConfidenceTier);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Top Header & Executive Badges ──────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/dashboard" style={{ color: "var(--brand-blue)" }}>Command Center</Link>
          <span>/</span>
          <Link href="/projects" style={{ color: "var(--brand-blue)" }}>Projects</Link>
          <span>/</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>{project.name}</span>
        </div>

        {/* Title Bar with Decision Support Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
                {project.name}
              </h1>
              <RiskBadge level={project.isDelayed ? "DELAYED" : assessment.overallLevel} size="md" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", fontSize: "0.78rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <span>Agency: <strong style={{ color: "var(--text-dark)" }}>{project.implementingAgency}</strong></span>
              <span>•</span>
              <span>Sector: <Link href={`/sectors/${encodeURIComponent(project.sector)}`} style={{ color: "var(--brand-blue)", fontWeight: 600 }}>{project.sector}</Link></span>
              <span>•</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>ID: {project.id}</span>
            </div>
          </div>

          {/* Decision-Support Status Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Investigation Priority Badge */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: priorityStyle.bg,
                border: `1px solid ${priorityStyle.border}`,
              }}
            >
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: priorityStyle.text, textTransform: "uppercase" }}>
                Investigation Priority
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: priorityStyle.text }}>
                {interventionPlan.investigationPriority}
              </span>
            </div>

            {/* Data Confidence Indicator */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: confidenceStyle.bg,
                border: `1px solid ${confidenceStyle.border}`,
              }}
            >
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: confidenceStyle.text, textTransform: "uppercase" }}>
                Data Confidence
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: confidenceStyle.text }}>
                {confidenceStyle.label} ({interventionPlan.knowledgeBoundary.completenessPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Bar ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-1-5)" }}>
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Estimated Cost</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>{formatCr(project.revisedCostCr)}</div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>Sanctioned: {formatCr(project.originalCostCr)}</div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Cost Escalation</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: costEscalation > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px" }}>
            {costEscalation > 0 ? `+${formatCr(costEscalation)}` : "₹ 0 Cr"}
          </div>
          <div style={{ fontSize: "0.68rem", color: costEscalation > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px", fontWeight: 600 }}>
            {costEscalation > 0 ? `+${costEscalationPct}% Overrun` : "Within Sanction"}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Revised Completion</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: project.isDelayed ? "var(--risk-high-text)" : "var(--text-dark)", marginTop: "2px" }}>
            {project.revisedCompletionDate}
          </div>
          <div style={{ fontSize: "0.68rem", color: project.isDelayed ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px", fontWeight: 600 }}>
            {project.isDelayed ? "Schedule Lapsed" : "Active Target"}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Physical Progress</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-blue)", marginTop: "2px" }}>
            {project.physicalProgressPct}%
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Velocity: <strong>{interventionPlan.trend.currentVelocityStatus}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Composite Risk Score</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: dimensionColor(assessment.overallLevel) }}>
              {assessment.overallScore}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>/100</span>
          </div>
          <div style={{ fontSize: "0.68rem", color: dimensionColor(assessment.overallLevel), fontWeight: 700, textTransform: "uppercase" }}>
            {assessment.overallLevel} Risk Level
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 1: WHAT (Current State & Risk Dimensions) ───────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "6px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            1. WHAT: Current Project State &amp; Risk Profile
          </h2>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Operational &amp; Financial Diagnostics
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-2)" }}>
          {/* Card A: Operational & Financial State Summary */}
          <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Current Project State
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {assessment.whatSummary}
            </p>

            <div style={{ marginTop: "auto", padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", color: "var(--text-dark)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontWeight: 700 }}>Timeline &amp; Velocity Assessment:</div>
              <div>{interventionPlan.trend.velocitySummary}</div>
            </div>
          </div>

          {/* Card B: Integrated ML Prediction */}
          <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
                ML Prediction: Cost Overrun
              </span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 6px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "var(--radius-pill)", textTransform: "uppercase" }}>
                Experimental ML
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                <svg viewBox="0 0 80 80" width="64" height="64">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={mlPrediction.prediction ? "#dc2626" : "#16a34a"}
                    strokeWidth="7"
                    strokeDasharray={`${mlPrediction.probability * 201.06} 201.06`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: mlPrediction.prediction ? "#dc2626" : "#16a34a" }}>
                    {Math.round(mlPrediction.probability * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: mlPrediction.prediction ? "#dc2626" : "#16a34a" }}>
                  {mlPrediction.prediction ? "COST OVERRUN LIKELY" : "ON BUDGET"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Probability: {(mlPrediction.probability * 100).toFixed(1)}% • {mlPrediction.confidenceLabel} Confidence
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  LOO-CV Cross-Validation Accuracy: {mlPrediction.evaluation.looAccuracy ? `${Math.round(mlPrediction.evaluation.looAccuracy * 100)}%` : "N/A"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", padding: "6px 8px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", fontSize: "0.66rem", color: "#92400e" }}>
              ⚠ Sample size: 20 records. Evaluated via leave-one-out cross-validation.
            </div>
          </div>
        </div>

        {/* 3 Risk Dimension Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-2)" }}>
          {assessment.dimensions.map((dim) => {
            const color = dimensionColor(dim.level);
            const bg = dimensionBg(dim.level);
            return (
              <div
                key={dim.dimension}
                style={{
                  backgroundColor: "var(--surface-white)",
                  border: `1px solid ${dim.level === "HIGH" ? "#fecaca" : dim.level === "MEDIUM" ? "#fde68a" : "#bbf7d0"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
                    {dim.label}
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 6px", borderRadius: "var(--radius-xs)", backgroundColor: bg, color: color }}>
                    {dim.level}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: color }}>{dim.score}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>/100</span>
                </div>

                <div style={{ height: "5px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${dim.score}%`, backgroundColor: color, borderRadius: "999px" }} />
                </div>

                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Method: {dim.method} • {dim.evidence.length} evidence points
                </div>
              </div>
            );
          })}
        </div>

        {/* Historical Milestones & Velocity Trend */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "14px 16px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "10px" }}>
            Milestones &amp; Revision Trajectory
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {interventionPlan.trend.historicalMilestones.map((m, idx) => (
              <div key={idx} style={{ flex: 1, minWidth: "200px", padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", borderLeft: `3px solid ${m.type === "LAPSE" ? "#dc2626" : m.type === "REVISION" ? "#d97706" : "var(--brand-blue)"}` }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dark)" }}>{m.event}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>{m.date}</div>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: m.type === "LAPSE" ? "#dc2626" : "var(--text-dark)", marginTop: "4px" }}>{m.delta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 2: WHY (Ranked Drivers & Sector Baselines) ──────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "6px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            2. WHY: Ranked Risk Drivers &amp; Empirical Evidence
          </h2>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Root Causes &amp; Sector Benchmark Comparison
          </span>
        </div>

        {/* Ranked Risk Drivers */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px" }}>
            Ranked Risk Drivers (Sorted by Contribution Weight)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {interventionPlan.rankedDrivers.map((driver) => {
              const color = dimensionColor(driver.severity);
              const bg = dimensionBg(driver.severity);
              return (
                <div
                  key={driver.rank}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "10px 12px",
                    backgroundColor: "var(--surface-subtle)",
                    borderRadius: "var(--radius-sm)",
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: bg,
                      color: color,
                      border: `1px solid ${color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {driver.rank}
                  </span>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dark)" }}>
                        [{driver.dimension}] {driver.title}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: color }}>
                          Impact: {driver.impactValue} {driver.impactUnit}
                        </span>
                        <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "var(--radius-xs)", backgroundColor: bg, color: color, fontWeight: 700 }}>
                          {driver.severity}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                      {driver.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Benchmark Comparison */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Sector Benchmark Comparison: {project.sector} Sector
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Empirical Baseline from Sample ({interventionPlan.sectorBenchmark.projectCount} peer projects)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            <div style={{ padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Cost Overrun Variance</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: interventionPlan.sectorBenchmark.costVarianceFromSector > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px" }}>
                {interventionPlan.sectorBenchmark.costVarianceFromSector > 0 ? `+${interventionPlan.sectorBenchmark.costVarianceFromSector}%` : `${interventionPlan.sectorBenchmark.costVarianceFromSector}%`}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Project: {interventionPlan.sectorBenchmark.projectCostOverrunPct}% vs Sector: {interventionPlan.sectorBenchmark.avgCostOverrunPct}%
              </div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Progress Variance</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: interventionPlan.sectorBenchmark.progressVarianceFromSector >= 0 ? "#16a34a" : "var(--risk-high-text)", marginTop: "2px" }}>
                {interventionPlan.sectorBenchmark.progressVarianceFromSector >= 0 ? `+${interventionPlan.sectorBenchmark.progressVarianceFromSector}%` : `${interventionPlan.sectorBenchmark.progressVarianceFromSector}%`}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Project: {interventionPlan.sectorBenchmark.projectProgressPct}% vs Sector: {interventionPlan.sectorBenchmark.avgPhysicalProgressPct}%
              </div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Sector Delay Rate</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
                {interventionPlan.sectorBenchmark.delayRatePct}%
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Peer projects delayed
              </div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Relative Standing</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "4px" }}>
                {interventionPlan.sectorBenchmark.costVarianceFromSector > 0 ? "Underperforming Sector" : "Outperforming Sector"}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Based on cost &amp; schedule
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Table */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>PAIMANA Supporting Evidence Table</span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              {assessment.dataCompleteness.availableFields} verified data points
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--surface-subtle)" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>#</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Dimension</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Metric</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>PAIMANA Field</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Observed Value</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Baseline</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Deviation</th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Flag</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let rowIdx = 0;
                  return assessment.dimensions.flatMap((dim) =>
                    dim.evidence.map((ev) => {
                      rowIdx++;
                      return (
                        <tr key={`${dim.dimension}-${ev.sourceField}`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{rowIdx}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "var(--radius-xs)", backgroundColor: dimensionBg(dim.level), color: dimensionColor(dim.level), fontSize: "0.66rem", fontWeight: 700 }}>
                              {dim.label}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-dark)" }}>{ev.label}</td>
                          <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>{ev.sourceField}</td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{ev.observedValue}</td>
                          <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{ev.baselineValue}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: ev.deviationPercent > 0 ? "var(--risk-high-text)" : "var(--text-secondary)" }}>
                            {ev.deviationPercent > 0 ? `+${ev.deviationPercent}%` : "0%"}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            {ev.isRiskContributor ? (
                              <span style={{ color: "#dc2626", fontWeight: 700 }}>●</span>
                            ) : (
                              <span style={{ color: "#cbd5e1" }}>○</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* ML Feature Explainability */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" }}>
            Model Feature Importances &amp; Coefficients (Logistic Regression)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {mlPrediction.topFeatures.map((f) => {
              const isRisk = f.direction === "INCREASES_RISK";
              return (
                <div key={f.featureName} style={{ padding: "10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", fontWeight: 600 }}>
                    <span>{f.label}</span>
                    <span style={{ color: isRisk ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                      {isRisk ? "↑ Increases Risk" : "↓ Reduces Risk"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Weight: {f.weight} • Value: {f.projectValue}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "10px", fontSize: "0.66rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Leakage-safe architecture: Features exclude revisedCostCr and costOverrunRatio to prevent target leakage.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 3: HOW TO HELP (Interventions & Boundaries) ─────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "6px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            3. HOW TO HELP: Evidence-Linked Interventions &amp; Knowledge Boundaries
          </h2>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Government Oversight &amp; Decision Support
          </span>
        </div>

        {/* Immediate Next Monitoring Action Banner */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #bfdbfe",
            borderLeft: "5px solid var(--brand-blue)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--brand-blue)" }}>
              Recommended Next Monitoring Action: {interventionPlan.nextMonitoringAction.actionTitle}
            </span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", backgroundColor: "#eff6ff", color: "var(--brand-blue)", borderRadius: "var(--radius-pill)" }}>
              {interventionPlan.nextMonitoringAction.deadlineTimeline}
            </span>
          </div>

          <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
            {interventionPlan.nextMonitoringAction.detailedProtocol}
          </p>

          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
            Responsible Authority: <strong>{interventionPlan.nextMonitoringAction.responsibleAuthority}</strong>
          </div>
        </div>

        {/* Evidence-Linked Intervention Action Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Evidence-Linked Intervention Areas ({interventionPlan.interventions.length} recommended)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-2)" }}>
            {interventionPlan.interventions.map((intv) => (
              <div
                key={intv.id}
                style={{
                  backgroundColor: "var(--surface-white)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
                    {intv.title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-xs)",
                      backgroundColor: intv.urgency === "IMMEDIATE" ? "#fee2e2" : intv.urgency === "NEAR_TERM" ? "#fef3c7" : "#dcfce7",
                      color: intv.urgency === "IMMEDIATE" ? "#991b1b" : intv.urgency === "NEAR_TERM" ? "#92400e" : "#166534",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {intv.urgency}
                  </span>
                </div>

                <div style={{ fontSize: "0.7rem", padding: "4px 8px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "var(--radius-xs)" }}>
                  <strong>Trigger:</strong> {intv.evidenceTrigger}
                </div>

                <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {intv.recommendedAction}
                </div>

                <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                  <div>Authority: <strong>{intv.responsibleEntity}</strong></div>
                  <div style={{ marginTop: "2px" }}>Target: {intv.targetOutcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What PRISM Knows / What PRISM Does Not Know */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Data Confidence &amp; Knowledge Boundary
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: confidenceStyle.bg,
                color: confidenceStyle.text,
                border: `1px solid ${confidenceStyle.border}`,
              }}
            >
              {confidenceStyle.label} ({interventionPlan.knowledgeBoundary.completenessPercent}%)
            </span>
          </div>

          <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.4 }}>
            {interventionPlan.knowledgeBoundary.confidenceExplanation}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* What PRISM Knows */}
            <div style={{ padding: "12px", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✓</span>
                <span>WHAT PRISM KNOWS (Verified Ground Truth)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {interventionPlan.knowledgeBoundary.whatPrismKnows.map((item) => (
                  <div key={item.field} style={{ fontSize: "0.72rem", color: "#14532d" }}>
                    <strong>{item.field}:</strong> {item.value}{" "}
                    <span style={{ fontSize: "0.65rem", color: "#15803d" }}>({item.verifiedSource})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What PRISM Does Not Know */}
            <div style={{ padding: "12px", border: "1px solid #fed7aa", backgroundColor: "#fff7ed", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a3412", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠</span>
                <span>WHAT PRISM DOES NOT KNOW (Data Gaps &amp; Blind Spots)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {interventionPlan.knowledgeBoundary.whatPrismDoesNotKnow.map((item) => (
                  <div key={item.field} style={{ fontSize: "0.72rem", color: "#7c2d12" }}>
                    <strong>{item.field}:</strong> {item.impactOnAssessment}{" "}
                    <span style={{ fontSize: "0.65rem", color: "#c2410c" }}>[Target: {item.suggestedSource}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer Navigation ────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
        <Link href={`/sectors/${encodeURIComponent(project.sector)}`} style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-blue)" }}>
          ← Back to {project.sector} Sector
        </Link>
        <Link href="/projects" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-blue)" }}>
          View All Projects →
        </Link>
      </div>
    </div>
  );
}
