import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import {
  computePortfolioAnalytics,
  formatCr,
  getProjectRiskLevel,
} from "@/analytics/portfolio-stats";
import { RiskBadge } from "@/components";

export default async function ProjectsPage() {
  const provider = getDataProvider();
  const projects = await provider.getAllProjects();
  const analytics = computePortfolioAnalytics(projects);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumb & Header ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/dashboard" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>
            Dashboard
          </Link>
          <span>&gt;</span>
          <span>Projects</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
              Monitored Central Projects
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {projects.length} representative projects tracked across {analytics.totalSectorsCount} sectors
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/sectors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-dark)",
                backgroundColor: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              Browse by Sector →
            </Link>
          </div>
        </div>
      </div>

      {/* ── All Projects Table ──────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "var(--space-2) var(--space-2-5)", borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>
            Central Project Registry (PAIMANA National Data Repository)
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", width: "40px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "10px 14px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Project Name</th>
                <th style={{ padding: "10px 14px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Sector</th>
                <th style={{ padding: "10px 14px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Implementing Agency</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Sanctioned Cost</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Revised Cost</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Progress</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, idx) => {
                const risk = getProjectRiskLevel(p);
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text-dark)", maxWidth: "260px" }}>
                      <Link href={`/projects/${p.id}`} style={{ color: "inherit" }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link
                        href={`/sectors/${encodeURIComponent(p.sector)}`}
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.sector}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: "0.78rem", maxWidth: "200px" }}>
                      {p.implementingAgency}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {formatCr(p.originalCostCr)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      <span style={{ color: p.costOverrunRatio > 1 ? "var(--risk-high-text)" : "inherit" }}>
                        {formatCr(p.revisedCostCr)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <RiskBadge
                        level={p.isDelayed ? "DELAYED" : risk}
                        customLabel={p.isDelayed ? "Delayed" : risk === "HIGH" ? "High Risk" : risk === "MEDIUM" ? "At Risk" : "On Track"}
                        size="sm"
                      />
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <div style={{ width: "50px", height: "6px", backgroundColor: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${p.physicalProgressPct}%`, backgroundColor: "var(--brand-blue)" }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{p.physicalProgressPct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <Link
                        href={`/projects/${p.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          color: "var(--brand-blue)",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
