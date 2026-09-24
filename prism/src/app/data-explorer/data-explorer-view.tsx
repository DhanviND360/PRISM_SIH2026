"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import { formatCr, getProjectRiskLevel } from "@/analytics/portfolio-stats";
import { RiskBadge } from "@/components";

interface DataExplorerViewProps {
  projects: Project[];
}

export function DataExplorerView({ projects }: DataExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "revisedCost" | "progress" | "overrun">("cost");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"NORMALIZED" | "RAW_CSV">("NORMALIZED");
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

  // Distinct sectors
  const sectors = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.sector))).sort();
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchAgency = p.implementingAgency.toLowerCase().includes(q);
          const matchSector = p.sector.toLowerCase().includes(q);
          if (!matchName && !matchAgency && !matchSector) return false;
        }

        // Sector Filter
        if (selectedSector !== "ALL" && p.sector !== selectedSector) {
          return false;
        }

        // Risk Filter
        const risk = getProjectRiskLevel(p);
        if (selectedRisk !== "ALL" && risk !== selectedRisk) {
          return false;
        }

        // Status Filter
        if (selectedStatus === "OVERRUN" && p.costOverrunRatio <= 1.0) return false;
        if (selectedStatus === "ON_BUDGET" && p.costOverrunRatio > 1.0) return false;
        if (selectedStatus === "DELAYED" && !p.isDelayed) return false;
        if (selectedStatus === "ON_TRACK" && p.isDelayed) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortBy === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === "cost") {
          valA = a.originalCostCr;
          valB = b.originalCostCr;
        } else if (sortBy === "revisedCost") {
          valA = a.revisedCostCr;
          valB = b.revisedCostCr;
        } else if (sortBy === "progress") {
          valA = a.physicalProgressPct;
          valB = b.physicalProgressPct;
        } else if (sortBy === "overrun") {
          valA = Math.max(0, a.revisedCostCr - a.originalCostCr);
          valB = Math.max(0, b.revisedCostCr - b.originalCostCr);
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [projects, searchQuery, selectedSector, selectedRisk, selectedStatus, sortBy, sortOrder]);

  const handleExportCSV = () => {
    let csv = "sector,implementing_agency,project_name,original_cost_cr,physical_progress_pct,latest_revised_cost_cr,latest_revised_completion_date,cost_overrun_cr,cost_overrun_pct,is_delayed\n";
    filteredProjects.forEach((p) => {
      const overrunCr = Math.max(0, p.revisedCostCr - p.originalCostCr);
      const overrunPct = Math.round((p.costOverrunRatio - 1) * 100);
      csv += `"${p.sector}","${p.implementingAgency}","${p.name}",${p.originalCostCr},${p.physicalProgressPct},${p.revisedCostCr},"${p.revisedCompletionDate}",${overrunCr},${overrunPct}%,${p.isDelayed ? "YES" : "NO"}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "paimana-raw-dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (column: "name" | "cost" | "revisedCost" | "progress" | "overrun") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* ── Filter & Search Toolbar ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search raw dataset by project, agency, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 12px 0 32px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--canvas-bg)",
                fontSize: "0.78rem",
                color: "var(--text-dark)",
                outline: "none",
              }}
            />
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* View Mode Toggle */}
            <div style={{ display: "inline-flex", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setViewMode("NORMALIZED")}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.74rem",
                  fontWeight: viewMode === "NORMALIZED" ? 700 : 500,
                  backgroundColor: viewMode === "NORMALIZED" ? "var(--brand-blue)" : "var(--surface-white)",
                  color: viewMode === "NORMALIZED" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Analytics View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("RAW_CSV")}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.74rem",
                  fontWeight: viewMode === "RAW_CSV" ? 700 : 500,
                  backgroundColor: viewMode === "RAW_CSV" ? "var(--brand-blue)" : "var(--surface-white)",
                  color: viewMode === "RAW_CSV" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Raw CSV Schema
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "0.74rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--surface-white)",
                color: "var(--text-dark)",
                cursor: "pointer",
              }}
            >
              <span>📥</span>
              <span>Export CSV ({filteredProjects.length})</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", fontSize: "0.75rem", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Sector Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                height: "30px",
                padding: "0 8px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--surface-white)",
                color: "var(--text-dark)",
                fontSize: "0.74rem",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Sectors ({projects.length})</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s} ({projects.filter((p) => p.sector === s).length})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Risk Level:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              style={{
                height: "30px",
                padding: "0 8px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--surface-white)",
                color: "var(--text-dark)",
                fontSize: "0.74rem",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Cost / Delay Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                height: "30px",
                padding: "0 8px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--surface-white)",
                color: "var(--text-dark)",
                fontSize: "0.74rem",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OVERRUN">Cost Overrun Flagged</option>
              <option value="ON_BUDGET">Within Sanction</option>
              <option value="DELAYED">Schedule Lapsed</option>
              <option value="ON_TRACK">Active Schedule</option>
            </select>
          </div>

          {(searchQuery || selectedSector !== "ALL" || selectedRisk !== "ALL" || selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedSector("ALL");
                setSelectedRisk("ALL");
                setSelectedStatus("ALL");
              }}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--brand-blue)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.72rem",
              }}
            >
              ✕ Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main Data Table ─────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--surface-white)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
            Showing {filteredProjects.length} of {projects.length} Raw Records ({viewMode === "RAW_CSV" ? "CSV Schema" : "Normalized Schema"})
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Click any column header to sort • Click project row to inspect raw payload
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--surface-subtle)", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "10px 12px", width: "36px", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "10px 12px", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {viewMode === "RAW_CSV" ? "sector" : "Sector"}
                </th>
                <th style={{ padding: "10px 12px", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {viewMode === "RAW_CSV" ? "implementing_agency" : "Implementing Agency"}
                </th>
                <th
                  onClick={() => handleSort("name")}
                  style={{ padding: "10px 12px", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", cursor: "pointer" }}
                >
                  {viewMode === "RAW_CSV" ? "project_name" : "Project Name"} {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("cost")}
                  style={{ padding: "10px 12px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", cursor: "pointer" }}
                >
                  {viewMode === "RAW_CSV" ? "original_cost_cr" : "Sanctioned (₹ Cr)"} {sortBy === "cost" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("progress")}
                  style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", cursor: "pointer" }}
                >
                  {viewMode === "RAW_CSV" ? "physical_progress_pct" : "Progress"} {sortBy === "progress" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("revisedCost")}
                  style={{ padding: "10px 12px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", cursor: "pointer" }}
                >
                  {viewMode === "RAW_CSV" ? "latest_revised_cost_cr" : "Revised (₹ Cr)"} {sortBy === "revisedCost" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {viewMode === "RAW_CSV" ? "latest_revised_completion_date" : "Target Completion"}
                </th>
                {viewMode === "NORMALIZED" && (
                  <>
                    <th
                      onClick={() => handleSort("overrun")}
                      style={{ padding: "10px 12px", textAlign: "right", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", cursor: "pointer" }}
                    >
                      Cost Escalation {sortBy === "overrun" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Risk Level
                    </th>
                  </>
                )}
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No project records match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, idx) => {
                  const overrunCr = Math.max(0, p.revisedCostCr - p.originalCostCr);
                  const overrunPct = Math.round((p.costOverrunRatio - 1) * 100);
                  const risk = getProjectRiskLevel(p);

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-subtle)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {p.sector}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.implementingAgency}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, maxWidth: "260px" }}>
                        <Link href={`/projects/${p.id}`} style={{ color: "#0f172a", textDecoration: "none" }} title={p.name}>
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        ₹ {p.originalCostCr.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "45px", height: "5px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ width: `${p.physicalProgressPct}%`, height: "100%", backgroundColor: p.physicalProgressPct >= 80 ? "#16a34a" : p.physicalProgressPct >= 40 ? "#d97706" : "#2563eb" }} />
                          </div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{p.physicalProgressPct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, color: overrunCr > 0 ? "var(--risk-high-text)" : "#0f172a" }}>
                        ₹ {p.revisedCostCr.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <span style={{ color: p.isDelayed ? "var(--risk-high-text)" : "inherit", fontWeight: p.isDelayed ? 700 : 500 }}>
                          {p.revisedCompletionDate} {p.isDelayed ? "⚠ Lapsed" : ""}
                        </span>
                      </td>

                      {viewMode === "NORMALIZED" && (
                        <>
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            {overrunCr > 0 ? (
                              <span style={{ color: "var(--risk-high-text)", fontWeight: 700 }}>
                                +{formatCr(overrunCr)} (+{overrunPct}%)
                              </span>
                            ) : (
                              <span style={{ color: "#16a34a", fontSize: "0.72rem" }}>Nil (On Track)</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <RiskBadge level={p.isDelayed ? "DELAYED" : risk} size="sm" />
                          </td>
                        </>
                      )}

                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setInspectedProject(p)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            borderRadius: "var(--radius-xs)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--surface-white)",
                            color: "var(--brand-blue)",
                            cursor: "pointer",
                          }}
                        >
                          Raw Ingest 🔎
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Raw Record Inspector Drawer / Modal ──────────────────────── */}
      {inspectedProject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setInspectedProject(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-md)",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-light)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "var(--radius-xs)", textTransform: "uppercase" }}>
                  PAIMANA CUF Ingest Payload
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                  {inspectedProject.name}
                </h3>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Agency: <strong>{inspectedProject.implementingAgency}</strong> • Sector: <strong>{inspectedProject.sector}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedProject(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            </div>

            {/* Raw JSON / Key-Value Grid */}
            <div>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                Raw PAIMANA Database Record Attributes (CUF Schema):
              </div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "var(--radius-sm)", padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.72rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>sector:</span>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontFamily: "var(--font-mono)" }}>{inspectedProject.sector}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>implementing_agency:</span>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontFamily: "var(--font-mono)" }}>{inspectedProject.implementingAgency}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>original_cost_cr:</span>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-mono)" }}>{inspectedProject.originalCostCr}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>latest_revised_cost_cr:</span>
                  <div style={{ fontWeight: 700, color: inspectedProject.revisedCostCr > inspectedProject.originalCostCr ? "#dc2626" : "#0f172a", fontFamily: "var(--font-mono)" }}>
                    {inspectedProject.revisedCostCr}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>physical_progress_pct:</span>
                  <div style={{ fontWeight: 700, color: "var(--brand-blue)", fontFamily: "var(--font-mono)" }}>{inspectedProject.physicalProgressPct}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>latest_revised_completion_date:</span>
                  <div style={{ fontWeight: 600, color: inspectedProject.isDelayed ? "#dc2626" : "#0f172a", fontFamily: "var(--font-mono)" }}>
                    {inspectedProject.revisedCompletionDate} {inspectedProject.isDelayed ? "(OVERDUE)" : ""}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>cost_escalation_ratio:</span>
                  <div style={{ fontWeight: 700, color: inspectedProject.costOverrunRatio > 1 ? "#dc2626" : "#16a34a", fontFamily: "var(--font-mono)" }}>
                    {inspectedProject.costOverrunRatio}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>schedule_status:</span>
                  <div style={{ fontWeight: 700, color: inspectedProject.isDelayed ? "#dc2626" : "#16a34a", fontFamily: "var(--font-mono)" }}>
                    {inspectedProject.isDelayed ? "SCHEDULE_LAPSED" : "ON_SCHEDULE"}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
              <button
                type="button"
                onClick={() => setInspectedProject(null)}
                style={{
                  padding: "8px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              <Link
                href={`/projects/${inspectedProject.id}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--brand-blue)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                Open Project Intelligence &amp; ML Diagnostics →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
