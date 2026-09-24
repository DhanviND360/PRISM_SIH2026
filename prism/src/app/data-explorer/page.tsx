import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import { formatCr } from "@/analytics/portfolio-stats";
import { DataExplorerView } from "./data-explorer-view";

export const metadata = {
  title: "Data Explorer — PRISM Government Intelligence",
  description: "Direct inspection and exploration of raw PAIMANA infrastructure dataset with Common Upload Form (CUF) parameters.",
};

export default async function DataExplorerPage() {
  const provider = getDataProvider();
  const projects = await provider.getAllProjects();

  const totalSanctionedCr = projects.reduce((acc, p) => acc + p.originalCostCr, 0);
  const totalRevisedCr = projects.reduce((acc, p) => acc + p.revisedCostCr, 0);
  const totalOverrunCr = projects.reduce(
    (acc, p) => acc + Math.max(0, p.revisedCostCr - p.originalCostCr),
    0
  );
  const delayedCount = projects.filter((p) => p.isDelayed).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumb & Header ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/dashboard" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>
            Command Center
          </Link>
          <span>&gt;</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>Data Explorer</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
              PAIMANA National Data Explorer
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Primary repository of raw project-level Common Upload Form (CUF) records relating to sanctioned cost, revised cost, physical progress, and milestones.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/reports"
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
              Export Reports &amp; Dossiers →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Macro Summary Strip ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-1-5)" }}>
        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Total Projects Ingested</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
            {projects.length} Records
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>Central Sector Projects (₹150 Cr+)</div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Aggregate Sanctioned Cost</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
            {formatCr(totalSanctionedCr)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>Original Cabinet Approval</div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Aggregate Revised Cost</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
            {formatCr(totalRevisedCr)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>Latest Approved Estimates</div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Cumulative Cost Overrun</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: totalOverrunCr > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px" }}>
            +{formatCr(totalOverrunCr)}
          </div>
          <div style={{ fontSize: "0.68rem", color: totalOverrunCr > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px", fontWeight: 600 }}>
            {totalOverrunCr > 0 ? `+${Math.round((totalOverrunCr / totalSanctionedCr) * 100)}% Portfolio Escalation` : "Zero Overrun"}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--surface-white)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "12px 14px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Schedule Status</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: delayedCount > 0 ? "var(--risk-high-text)" : "#16a34a", marginTop: "2px" }}>
            {delayedCount} Delayed
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {projects.length - delayedCount} Projects Active on Horizon
          </div>
        </div>
      </div>

      {/* ── Interactive Raw Dataset Table ───────────────────────────── */}
      <DataExplorerView projects={projects} />
    </div>
  );
}
