"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatCr } from "@/analytics/portfolio-stats";

export interface ProjectRiskRow {
  id: string;
  name: string;
  sector: string;
  implementingAgency: string;
  originalCostCr: number;
  revisedCostCr: number;
  costOverrunCr: number;
  costOverrunPct: number;
  physicalProgressPct: number;
  revisedCompletionDate: string;
  isDelayed: boolean;
  overallScore: number;
  overallLevel: "HIGH" | "MEDIUM" | "LOW";
  costScore: number;
  costLevel: "HIGH" | "MEDIUM" | "LOW";
  scheduleScore: number;
  scheduleLevel: "HIGH" | "MEDIUM" | "LOW";
  implementationScore: number;
  implementationLevel: "HIGH" | "MEDIUM" | "LOW";
  primaryFactor: string;
  completenessPercent: number;
}

interface RiskMatrixTableProps {
  projects: ProjectRiskRow[];
}

type FilterTab = "ALL" | "HIGH_RISK" | "COST" | "SCHEDULE" | "IMPLEMENTATION";
type SortField = "SCORE_DESC" | "COST_DESC" | "PROGRESS_ASC" | "NAME_ASC";

export function RiskMatrixTable({ projects }: RiskMatrixTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("SCORE_DESC");

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Tab filtering
        if (activeTab === "HIGH_RISK" && p.overallLevel !== "HIGH") return false;
        if (activeTab === "COST" && p.costScore < 50) return false;
        if (activeTab === "SCHEDULE" && p.scheduleScore < 50) return false;
        if (activeTab === "IMPLEMENTATION" && p.implementationScore < 40 && p.physicalProgressPct > 0) return false;

        // Search filtering
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sector.toLowerCase().includes(q) ||
            p.implementingAgency.toLowerCase().includes(q) ||
            p.primaryFactor.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "SCORE_DESC") return b.overallScore - a.overallScore;
        if (sortBy === "COST_DESC") return (b.costOverrunCr || b.revisedCostCr) - (a.costOverrunCr || a.revisedCostCr);
        if (sortBy === "PROGRESS_ASC") return a.physicalProgressPct - b.physicalProgressPct;
        if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [projects, activeTab, searchTerm, sortBy]);

  const levelColor = (level: "HIGH" | "MEDIUM" | "LOW") => {
    if (level === "HIGH") return { text: "var(--risk-high-text)", bg: "var(--risk-high-bg)", border: "var(--risk-high-border)" };
    if (level === "MEDIUM") return { text: "var(--risk-med-text)", bg: "var(--risk-med-bg)", border: "var(--risk-med-border)" };
    return { text: "var(--risk-low-text)", bg: "var(--risk-low-bg)", border: "var(--risk-low-border)" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return "#dc2626";
    if (score >= 30) return "#d97706";
    return "#16a34a";
  };

  const counts = {
    all: projects.length,
    highRisk: projects.filter((p) => p.overallLevel === "HIGH").length,
    cost: projects.filter((p) => p.costScore >= 50).length,
    schedule: projects.filter((p) => p.scheduleScore >= 50).length,
    implementation: projects.filter((p) => p.implementationScore >= 40 || p.physicalProgressPct === 0).length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          backgroundColor: "var(--surface-white)",
          padding: "12px 16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[
            { id: "ALL", label: `All Projects (${counts.all})` },
            { id: "HIGH_RISK", label: `High Risk (${counts.highRisk})` },
            { id: "COST", label: `Cost Driven (${counts.cost})` },
            { id: "SCHEDULE", label: `Schedule Slippage (${counts.schedule})` },
            { id: "IMPLEMENTATION", label: `Implementation Lag (${counts.implementation})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${isActive ? "var(--brand-blue)" : "var(--border-light)"}`,
                  backgroundColor: isActive ? "var(--brand-blue-bg)" : "var(--surface-white)",
                  color: isActive ? "var(--brand-blue)" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by project, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "6px 10px 6px 28px",
                fontSize: "0.76rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--canvas-bg)",
                color: "var(--text-dark)",
                width: "210px",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              🔍
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            style={{
              padding: "6px 10px",
              fontSize: "0.76rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--surface-white)",
              color: "var(--text-dark)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="SCORE_DESC">Sort: Highest Risk Score</option>
            <option value="COST_DESC">Sort: Highest Cost Exposure</option>
            <option value="PROGRESS_ASC">Sort: Lowest Progress First</option>
            <option value="NAME_ASC">Sort: Project Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Risk Diagnostic Table */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-subtle)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Project &amp; Sector</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Composite Risk</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cost Vector (40%)</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Schedule Vector (35%)</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Implementation (25%)</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Bottleneck</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No projects match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const badge = levelColor(p.overallLevel);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Project & Sector */}
                      <td style={{ padding: "12px", maxWidth: "260px" }}>
                        <Link href={`/projects/${p.id}`} style={{ fontWeight: 600, color: "var(--brand-blue)", display: "block", lineHeight: 1.3 }}>
                          {p.name}
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.68rem", padding: "1px 6px", borderRadius: "var(--radius-xs)", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", fontWeight: 500 }}>
                            {p.sector}
                          </span>
                          <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                            {p.implementingAgency}
                          </span>
                        </div>
                      </td>

                      {/* Composite Risk Score */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: getScoreColor(p.overallScore) }}>
                              {p.overallScore}
                            </span>
                            <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>/100</span>
                          </div>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {p.overallLevel} RISK
                          </span>
                        </div>
                      </td>

                      {/* Cost Vector */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: getScoreColor(p.costScore) }}>
                            {p.costScore}/100
                          </span>
                          <span style={{ fontSize: "0.68rem", color: p.costOverrunCr > 0 ? "var(--risk-high-text)" : "var(--text-muted)", fontWeight: p.costOverrunCr > 0 ? 600 : 400 }}>
                            {p.costOverrunCr > 0 ? `+${formatCr(p.costOverrunCr)} (+${p.costOverrunPct}%)` : "Sanction Intact"}
                          </span>
                        </div>
                      </td>

                      {/* Schedule Vector */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: getScoreColor(p.scheduleScore) }}>
                            {p.scheduleScore}/100
                          </span>
                          <span style={{ fontSize: "0.68rem", color: p.isDelayed ? "var(--risk-high-text)" : "var(--text-muted)", fontWeight: p.isDelayed ? 700 : 400 }}>
                            {p.isDelayed ? `Delayed (${p.revisedCompletionDate})` : `Target: ${p.revisedCompletionDate}`}
                          </span>
                        </div>
                      </td>

                      {/* Implementation Vector */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: getScoreColor(p.implementationScore) }}>
                            {p.implementationScore}/100
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ width: "45px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                              <div style={{ width: `${p.physicalProgressPct}%`, height: "100%", backgroundColor: p.physicalProgressPct === 0 ? "#dc2626" : "var(--brand-blue)" }} />
                            </div>
                            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                              {p.physicalProgressPct}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Primary Bottleneck */}
                      <td style={{ padding: "12px", maxWidth: "230px" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                          {p.primaryFactor}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "3px" }}>
                          Data completeness: {p.completenessPercent}%
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <Link
                          href={`/projects/${p.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--surface-subtle)",
                            border: "1px solid var(--border-light)",
                            color: "var(--brand-blue)",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Diagnostic →
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
