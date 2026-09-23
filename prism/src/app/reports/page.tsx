import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import { assessProjectRisk } from "@/analytics/risk-engine";
import { computePortfolioAnalytics } from "@/analytics/portfolio-stats";
import { ReportsView } from "./reports-view";

export const metadata = {
  title: "Reports & Dossiers — PRISM Government Intelligence",
  description: "Official MoSPI executive flash reports, high-risk exception dossiers, and dimensional audits.",
};

export default async function ReportsPage() {
  const provider = getDataProvider();
  const projects = await provider.getAllProjects();

  // Run risk assessment for every project
  const assessments = projects.map((p) => assessProjectRisk(p));

  // Compute portfolio statistics
  const portfolioStats = computePortfolioAnalytics(projects);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumb & Header ────────────────────────────────────── */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/" style={{ color: "var(--brand-blue)" }}>Command Center</Link>
          <span>/</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>Reports</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
              Executive Monitoring Reports &amp; Dossiers
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Official periodic briefings, exception dossiers for Cabinet Committees, and provenance audit reports.
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
              Export &amp; Print Ready
            </span>
          </div>
        </div>
      </div>

      {/* ── Interactive Reports View ───────────────────────────────── */}
      <ReportsView
        projects={projects}
        assessments={assessments}
        portfolioStats={portfolioStats}
      />
    </div>
  );
}
