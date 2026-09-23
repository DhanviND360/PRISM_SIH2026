import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import {
  computePortfolioAnalytics,
  formatCr,
} from "@/analytics/portfolio-stats";
import { RiskBadge } from "@/components";

export default async function SectorsPage() {
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
          <span>Sectors</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
              Central Monitoring Sectors
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {analytics.totalSectorsCount} monitored sectors across central ministries and implementing agencies
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/projects"
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
              View All Projects →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Sectors Grid ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "var(--space-2)",
        }}
      >
        {analytics.sectors.map((s) => {
          return (
            <Link
              key={s.sector}
              href={`/sectors/${encodeURIComponent(s.sector)}`}
              style={{
                backgroundColor: "var(--surface-white)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2-5)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1-5)",
                boxShadow: "var(--shadow-card)",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-dark)" }}>
                  {s.sector}
                </span>
                <RiskBadge level={s.dominantRisk} size="sm" />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  padding: "10px 0",
                  borderTop: "1px solid var(--border-subtle)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Projects
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
                    {s.projectCount}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Total Cost
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
                    {formatCr(s.totalRevisedCostCr)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Cost Escalation
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: s.costRiskExposureCr > 0 ? "var(--risk-high-text)" : "var(--text-secondary)",
                    }}
                  >
                    {s.costRiskExposureCr > 0 ? formatCr(s.costRiskExposureCr) : "Nil (On budget)"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Delayed
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: s.delayedCount > 0 ? "var(--risk-high-text)" : "var(--risk-low-text)",
                    }}
                  >
                    {s.delayedCount > 0 ? `${s.delayedCount} project` : "0 (On track)"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.76rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Explore sector projects</span>
                <span style={{ color: "var(--brand-blue)", fontWeight: 600 }}>View Projects →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
