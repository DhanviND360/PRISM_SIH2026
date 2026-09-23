import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/data-provider";
import { formatCr } from "@/analytics/portfolio-stats";
import { assessProjectRisk } from "@/analytics/risk-engine";
import type { RiskDimensionResult } from "@/analytics/risk-engine";
import { predictCostOverrun } from "@/ml-api";
import type { MLPrediction } from "@/ml-api";
import { RiskBadge } from "@/components";

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

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

function dimensionBorder(level: string) {
  if (level === "HIGH") return "#fecaca";
  if (level === "MEDIUM") return "#fde68a";
  return "#bbf7d0";
}

/* ── Page Component ─────────────────────────────────────────────────── */

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { id } = await params;
  const provider = getDataProvider();
  const project = await provider.getProjectById(id);

  if (!project) {
    notFound();
  }

  // Run the PRISM Risk Engine
  const assessment = assessProjectRisk(project);
  const costEscalation = Math.max(0, project.revisedCostCr - project.originalCostCr);

  // Sort dimensions by score descending for display
  const sortedDimensions = [...assessment.dimensions].sort(
    (a, b) => b.score - a.score
  );

  // Run experimental ML prediction (Phase 4)
  const mlPrediction = predictCostOverrun(project);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumb & Header ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>Dashboard</Link>
          <span>&gt;</span>
          <Link href="/projects" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>Projects</Link>
          <span>&gt;</span>
          <Link href={`/sectors/${encodeURIComponent(project.sector)}`} style={{ color: "var(--brand-blue)", fontWeight: 500 }}>
            {project.sector}
          </Link>
          <span>&gt;</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>{project.name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
                {project.name}
              </h1>
              <RiskBadge
                level={assessment.overallLevel}
                customLabel={assessment.overallLevel === "HIGH" ? "High Risk" : assessment.overallLevel === "MEDIUM" ? "At Risk" : "On Track"}
              />
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              <strong>{project.sector}</strong> &nbsp;|&nbsp; {project.implementingAgency} &nbsp;|&nbsp; Project ID: <code>{project.id}</code>
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-dark)", backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-card)" }}>
              Export ▾
            </button>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-inverse)", backgroundColor: "var(--brand-dark-green)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-card)" }}>
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid var(--border-light)" }}>
        <span style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-blue)", borderBottom: "2px solid var(--brand-blue)", marginBottom: "-2px" }}>
          Overview
        </span>
        <span style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-dark)", borderBottom: "2px solid transparent", marginBottom: "-2px", cursor: "pointer" }}>
          Risk Analysis
        </span>
        {["Timeline", "Financials", "Clearances", "Documents", "Updates"].map((tab) => (
          <span key={tab} style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 500, color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed" }} title="Coming in later phases">
            {tab}
          </span>
        ))}
      </div>

      {/* ── Row 1: Risk Score Donut + Key Information ─────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "var(--space-2-5)" }}>
        {/* Risk Score Card */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "16px" }}>
            Risk Score
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Score Donut */}
            <div style={{ position: "relative", width: "110px", height: "110px", flexShrink: 0 }}>
              <svg viewBox="0 0 120 120" width="110" height="110">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={dimensionColor(assessment.overallLevel)}
                  strokeWidth="10"
                  strokeDasharray={`${(assessment.overallScore / 100) * 314.16} 314.16`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.6rem", fontWeight: 800, color: dimensionColor(assessment.overallLevel) }}>
                  {assessment.overallScore}
                </span>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>/ 100</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: dimensionColor(assessment.overallLevel), textTransform: "uppercase", marginTop: "2px" }}>
                  {assessment.overallLevel === "HIGH" ? "High Risk" : assessment.overallLevel === "MEDIUM" ? "At Risk" : "Low Risk"}
                </span>
              </div>
            </div>

            {/* Dimension Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              {sortedDimensions.map((dim) => (
                <div key={dim.dimension}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "3px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dimensionColor(dim.level) }} />
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{dim.label}</span>
                    </span>
                    <strong style={{ color: dimensionColor(dim.level) }}>{dim.score}</strong>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${dim.score}%`, backgroundColor: dimensionColor(dim.level), borderRadius: "999px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Information Card */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2-5)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "14px" }}>
            Key Information
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Project Cost</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>{formatCr(project.revisedCostCr)}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Potential Cost-Risk</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: costEscalation > 0 ? "var(--risk-high-text)" : "var(--text-dark)", marginTop: "2px" }}>
                {costEscalation > 0 ? formatCr(costEscalation) : "₹ 0 Cr"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Original Sanctioned</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-dark)", marginTop: "4px" }}>{formatCr(project.originalCostCr)}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Revised Completion</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: project.isDelayed ? "var(--risk-high-text)" : "var(--text-dark)", marginTop: "4px" }}>
                {project.revisedCompletionDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Status</div>
              <div style={{ marginTop: "4px" }}>
                <RiskBadge level={project.isDelayed ? "DELAYED" : assessment.overallLevel} size="sm" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Physical Progress</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--brand-blue)", marginTop: "4px" }}>{project.physicalProgressPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: WHAT / WHY / WHAT EVIDENCE / CONFIDENCE ─────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-2)" }}>
        {/* Card 1: WHAT */}
        <IntelligenceCard
          number={1}
          title="What is happening?"
          content={assessment.whatSummary}
          color="#1e40af"
          bg="#eff6ff"
          border="#bfdbfe"
        />

        {/* Card 2: WHY */}
        <IntelligenceCard
          number={2}
          title="Why is it flagged?"
          content={assessment.whySummary}
          color="#b45309"
          bg="#fffbeb"
          border="#fde68a"
        />

        {/* Card 3: EVIDENCE */}
        <IntelligenceCard
          number={3}
          title="What evidence supports this?"
          content={assessment.evidenceSummary}
          color="#0f766e"
          bg="#ecfdf5"
          border="#a7f3d0"
        />

        {/* Card 4: DATA CONFIDENCE */}
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800 }}>4</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>Data Confidence</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, height: "8px", backgroundColor: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${assessment.dataCompleteness.completenessPercent}%`, backgroundColor: assessment.dataCompleteness.completenessPercent >= 70 ? "#16a34a" : assessment.dataCompleteness.completenessPercent >= 50 ? "#d97706" : "#dc2626", borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-dark)" }}>{assessment.dataCompleteness.completenessPercent}%</span>
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            {assessment.dataCompleteness.availableFields}/{assessment.dataCompleteness.totalFields} fields available.
          </div>

          {assessment.dataCompleteness.missingFields.length > 0 && (
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4, padding: "6px 8px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Missing:</strong> {assessment.dataCompleteness.missingFields.join(", ")}
            </div>
          )}

          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.3, marginTop: "auto" }}>
            Engine: v{assessment.engineVersion}. All scores are deterministic. No ML/LLM used.
          </div>
        </div>
      </div>

      {/* ── Row 3: Detailed Risk Dimension Breakdown ──────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
          Risk Dimension Analysis
        </h2>

        {sortedDimensions.map((dim) => (
          <DimensionDetailCard key={dim.dimension} dim={dim} />
        ))}
      </div>

      {/* ── Row 4: Evidence Table ─────────────────────────────────────── */}
      <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-dark)" }}>Evidence &amp; Source Data</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            PAIMANA Sample — {assessment.dataCompleteness.availableFields} data points
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-subtle)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Dimension</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Data Point</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Source Field</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Observed Value</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Baseline</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Deviation</th>
                <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Contributor</th>
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
                          <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: "var(--radius-sm)", backgroundColor: dimensionBg(dim.level), color: dimensionColor(dim.level), fontSize: "0.68rem", fontWeight: 600 }}>
                            {dim.label}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-dark)" }}>{ev.label}</td>
                        <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>{ev.sourceField}</td>
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

      {/* ── Row 5: ML Prediction (Phase 4) ─────────────────────────── */}
      <MLPredictionSection prediction={mlPrediction} />

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

/* ── Intelligence Card Sub-Component ────────────────────────────────── */

function IntelligenceCard({
  number, title, content, color, bg, border,
}: {
  number: number; title: string; content: string; color: string; bg: string; border: string;
}) {
  return (
    <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "var(--space-2)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: bg, border: `1px solid ${border}`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, flexShrink: 0 }}>
          {number}
        </span>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>{title}</span>
      </div>

      <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.5, maxHeight: "120px", overflow: "auto" }}>
        {content}
      </div>
    </div>
  );
}

/* ── Dimension Detail Card Sub-Component ────────────────────────────── */

function DimensionDetailCard({ dim }: { dim: RiskDimensionResult }) {
  return (
    <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      {/* Header Bar */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", backgroundColor: dimensionBg(dim.level) }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dimensionColor(dim.level) }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-dark)" }}>{dim.label}</span>
          <RiskBadge level={dim.level} size="sm" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: dimensionColor(dim.level) }}>
            {dim.score} <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--text-muted)" }}>/ 100</span>
          </span>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Contributing Factors */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {dim.contributingFactors.map((factor, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${dimensionBorder(factor.severity)}`, backgroundColor: dimensionBg(factor.severity) }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: dimensionColor(factor.severity) }}>
                  {factor.title}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  Impact: {factor.impactValue.toLocaleString("en-IN")} {factor.impactUnit}
                </span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-body)", lineHeight: 1.5 }}>
                {factor.description}
              </div>
            </div>
          ))}
        </div>

        {/* Methodology Notice */}
        <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4, borderLeft: `3px solid ${dimensionColor(dim.level)}` }}>
          <strong>Method:</strong> {dim.method} — {dim.methodDescription}
        </div>
      </div>
    </div>
  );
}

/* ── ML Prediction Section Sub-Component ────────────────────────────── */

function MLPredictionSection({ prediction: ml }: { prediction: MLPrediction }) {
  const predColor = ml.prediction ? "#dc2626" : "#16a34a";
  const predBg = ml.prediction ? "#fef2f2" : "#f0fdf4";
  const predBorder = ml.prediction ? "#fecaca" : "#bbf7d0";

  const confidenceColors: Record<string, string> = {
    HIGH: "#16a34a",
    MODERATE: "#d97706",
    LOW: "#ea580c",
    UNCERTAIN: "#9ca3af",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
          Experimental ML Prediction
        </h2>
        <span style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "999px",
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Prototype
        </span>
      </div>

      {/* Main ML Card: Prediction + Feature Importance + Evaluation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "var(--space-2)" }}>

        {/* Card 1: Prediction Result */}
        <div style={{
          backgroundColor: "var(--surface-white)",
          border: `1px solid ${predBorder}`,
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2-5)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Prediction: Cost Overrun
          </div>

          {/* Probability gauge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" width="72" height="72">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="32"
                  fill="none"
                  stroke={predColor}
                  strokeWidth="7"
                  strokeDasharray={`${ml.probability * 201.06} 201.06`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, color: predColor }}>
                  {Math.round(ml.probability * 100)}%
                </span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: predColor, marginBottom: "4px" }}>
                {ml.prediction ? "OVERRUN LIKELY" : "ON BUDGET"}
              </div>
              <div style={{
                display: "inline-block",
                padding: "2px 6px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: predBg,
                border: `1px solid ${predBorder}`,
                fontSize: "0.68rem",
                fontWeight: 600,
                color: confidenceColors[ml.confidenceLabel],
              }}>
                {ml.confidenceLabel} confidence
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            {ml.predictionLabel}
          </div>

          {!ml.isViable && ml.nonViableReason && (
            <div style={{ padding: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", fontSize: "0.7rem", color: "#991b1b" }}>
              {ml.nonViableReason}
            </div>
          )}
        </div>

        {/* Card 2: Feature Importances */}
        <div style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2-5)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Feature Contributions
          </div>

          {ml.topFeatures.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ml.topFeatures.map((f) => {
                const barWidth = Math.min(100, Math.abs(f.contribution) * 20);
                const isPositive = f.direction === "INCREASES_RISK";
                return (
                  <div key={f.featureName}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.74rem", marginBottom: "3px" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{f.label}</span>
                      <span style={{ fontWeight: 700, color: isPositive ? "#dc2626" : "#16a34a", fontSize: "0.72rem" }}>
                        {isPositive ? "↑" : "↓"} w={f.weight}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "5px", backgroundColor: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${barWidth}%`,
                          backgroundColor: isPositive ? "#ef4444" : "#10b981",
                          borderRadius: "999px",
                        }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: "40px", textAlign: "right" }}>
                        {f.projectValue}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              No feature data available.
            </div>
          )}

          <div style={{ marginTop: "auto", padding: "6px 8px", backgroundColor: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.66rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
            <strong>Leakage-safe:</strong> revisedCostCr and costOverrunRatio are excluded from features to prevent target leakage.
          </div>
        </div>

        {/* Card 3: Model Evaluation */}
        <div style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2-5)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Model Evaluation
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.76rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>LOO-CV Accuracy</span>
              <strong style={{ color: "var(--text-dark)" }}>
                {ml.evaluation.looAccuracy !== null
                  ? `${Math.round(ml.evaluation.looAccuracy * 100)}%`
                  : "N/A"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Baseline (majority)</span>
              <strong style={{ color: "var(--text-dark)" }}>
                {Math.round(ml.evaluation.baselineAccuracy * 100)}%
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Training Samples</span>
              <strong style={{ color: "var(--text-dark)" }}>
                {ml.evaluation.trainingSamples}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Class Balance</span>
              <strong style={{ color: "var(--text-dark)" }}>
                {ml.evaluation.positiveCount}+ / {ml.evaluation.negativeCount}−
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "2px" }}>
              <span style={{ color: "var(--text-muted)" }}>LOO Correct</span>
              <strong style={{ color: "var(--text-dark)" }}>
                {ml.evaluation.looCorrectCount !== null
                  ? `${ml.evaluation.looCorrectCount}/${ml.evaluation.trainingSamples}`
                  : "N/A"}
              </strong>
            </div>
          </div>

          {/* Sample adequacy warning */}
          {!ml.evaluation.isSufficientSample && (
            <div style={{
              padding: "8px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.68rem",
              color: "#92400e",
              lineHeight: 1.4,
            }}>
              ⚠ {ml.evaluation.sampleAdequacyNote}
            </div>
          )}

          <div style={{ marginTop: "auto", fontSize: "0.66rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Model: {ml.modelId}
          </div>
        </div>
      </div>
    </div>
  );
}
