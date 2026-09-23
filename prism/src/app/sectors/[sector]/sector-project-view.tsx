"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import { formatCr, getProjectRiskLevel, type RiskLevel } from "@/analytics/portfolio-stats";
import { RiskBadge } from "@/components";

interface SectorProjectViewProps {
  sector: string;
  projects: Project[];
}

export function SectorProjectView({ sector, projects }: SectorProjectViewProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const totalCost = projects.reduce((acc, p) => acc + p.revisedCostCr, 0);
  const costExposure = projects.reduce((acc, p) => acc + Math.max(0, p.revisedCostCr - p.originalCostCr), 0);
  const delayedProjects = projects.filter((p) => p.isDelayed);
  const highRiskProjects = projects.filter((p) => getProjectRiskLevel(p) === "HIGH");
  const mediumRiskProjects = projects.filter((p) => getProjectRiskLevel(p) === "MEDIUM");
  const lowRiskProjects = projects.filter((p) => getProjectRiskLevel(p) === "LOW");

  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.physicalProgressPct, 0) / projects.length)
      : 0;

  const highRiskPct =
    projects.length > 0 ? Math.round((highRiskProjects.length / projects.length) * 100) : 0;

  // Filter projects by tab & search query
  const filteredProjects = projects.filter((p) => {
    const risk = getProjectRiskLevel(p);
    if (activeTab === "HIGH" && risk !== "HIGH") return false;
    if (activeTab === "MEDIUM" && risk !== "MEDIUM") return false;
    if (activeTab === "LOW" && risk !== "LOW") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.implementingAgency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Breadcrumbs & Header ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/sectors" style={{ color: "var(--brand-blue)", fontWeight: 500 }}>
            Sectors
          </Link>
          <span>&gt;</span>
          <span style={{ color: "var(--text-dark)", fontWeight: 600 }}>{sector}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
              {sector}
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {projects.length} project{projects.length === 1 ? "" : "s"} &nbsp;|&nbsp;
              <strong style={{ color: highRiskPct > 0 ? "var(--risk-high-text)" : "inherit" }}>
                {" "}{highRiskPct}% high risk{" "}
              </strong>
              &nbsp;|&nbsp; {costExposure > 0 ? `${formatCr(costExposure)} cost-risk exposure` : "No cost escalation reported"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
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
              Export Data ▾
            </button>
            <Link
              href="/sectors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-inverse)",
                backgroundColor: "var(--brand-dark-green)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              All Sectors →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top 3 Metrics Cards (Reference Image 2) ─────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1fr",
          gap: "var(--space-2-5)",
        }}
      >
        {/* Card 1: Risk Overview */}
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2-5)",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px" }}>
            Risk Overview
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: `conic-gradient(
                  #ef4444 0% ${highRiskPct}%,
                  #f59e0b ${highRiskPct}% ${highRiskPct + (projects.length > 0 ? (mediumRiskProjects.length / projects.length) * 100 : 0)}%,
                  #10b981 ${highRiskPct + (projects.length > 0 ? (mediumRiskProjects.length / projects.length) * 100 : 0)}% 100%
                )`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-white)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--text-dark)",
                }}
              >
                {highRiskPct}%
                <span style={{ fontSize: "0.55rem", fontWeight: 500, color: "var(--text-muted)" }}>High</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, fontSize: "0.78rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                  High Risk
                </span>
                <strong>{highRiskProjects.length}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                  Medium Risk
                </span>
                <strong>{mediumRiskProjects.length}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  Low Risk
                </span>
                <strong>{lowRiskProjects.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Key Metrics */}
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2-5)",
            boxShadow: "var(--shadow-card)",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Project Cost
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
              {formatCr(totalCost)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Cost-Risk Exposure
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: costExposure > 0 ? "var(--risk-high-text)" : "var(--text-dark)",
                marginTop: "2px",
              }}
            >
              {costExposure > 0 ? formatCr(costExposure) : "Nil"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Avg. Progress
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "2px" }}>
              {avgProgress}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Delayed Projects
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: delayedProjects.length > 0 ? "var(--risk-high-text)" : "var(--risk-low-text)",
                marginTop: "2px",
              }}
            >
              {delayedProjects.length}
            </div>
          </div>
        </div>

        {/* Card 3: Projects by Status */}
        <div
          style={{
            backgroundColor: "var(--surface-white)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2-5)",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "10px" }}>
            Projects by Status
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.76rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>On Track</span>
                <strong>{lowRiskProjects.length}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#10b981",
                    width: `${projects.length > 0 ? (lowRiskProjects.length / projects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>At Risk</span>
                <strong>{mediumRiskProjects.length}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#f59e0b",
                    width: `${projects.length > 0 ? (mediumRiskProjects.length / projects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Delayed / High Overrun</span>
                <strong>{highRiskProjects.length}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#ef4444",
                    width: `${projects.length > 0 ? (highRiskProjects.length / projects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table & Filter Controls (Reference Image 2) ─────────────── */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            padding: "var(--space-2) var(--space-2-5)",
            borderBottom: "1px solid var(--border-light)",
            gap: "12px",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "ALL" ? "var(--sidebar-bg)" : "var(--surface-subtle)",
                color: activeTab === "ALL" ? "white" : "var(--text-secondary)",
              }}
            >
              All Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("HIGH")}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "HIGH" ? "var(--risk-high-text)" : "var(--surface-subtle)",
                color: activeTab === "HIGH" ? "white" : "var(--text-secondary)",
              }}
            >
              High Risk ({highRiskProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MEDIUM")}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "MEDIUM" ? "#b45309" : "var(--surface-subtle)",
                color: activeTab === "MEDIUM" ? "white" : "var(--text-secondary)",
              }}
            >
              At Risk ({mediumRiskProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("LOW")}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "LOW" ? "#15803d" : "var(--surface-subtle)",
                color: activeTab === "LOW" ? "white" : "var(--text-secondary)",
              }}
            >
              On Track ({lowRiskProjects.length})
            </button>
          </div>

          {/* Search box */}
          <div style={{ minWidth: "240px" }}>
            <input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "34px",
                padding: "0 12px",
                fontSize: "0.78rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--canvas-bg)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Projects Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", width: "40px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "10px 14px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Project Name</th>
                <th style={{ padding: "10px 14px", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Implementing Agency</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Cost</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Status</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Progress</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No projects found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, idx) => {
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
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text-dark)", maxWidth: "300px" }}>
                        <Link href={`/projects/${p.id}`} style={{ color: "inherit" }}>
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: "0.78rem", maxWidth: "220px" }}>
                        {p.implementingAgency}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {formatCr(p.revisedCostCr)}
                        {p.costOverrunRatio > 1 && (
                          <div style={{ fontSize: "0.68rem", color: "var(--risk-high-text)" }}>
                            +{( (p.costOverrunRatio - 1) * 100 ).toFixed(0)}% overrun
                          </div>
                        )}
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
                          <div style={{ width: "60px", height: "6px", backgroundColor: "var(--surface-subtle)", borderRadius: "999px", overflow: "hidden" }}>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
