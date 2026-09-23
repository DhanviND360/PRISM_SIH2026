"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCr, type PortfolioAnalytics } from "@/analytics/portfolio-stats";
import type { Project } from "@/types/project";
import type { ProjectRiskAssessment } from "@/analytics/risk-engine";

interface ReportsViewProps {
  projects: Project[];
  assessments: ProjectRiskAssessment[];
  portfolioStats: PortfolioAnalytics;
}

type ReportType = "MPMR_FLASH" | "HIGH_RISK_DOSSIER" | "DIMENSION_MATRIX" | "DATA_AUDIT";

export function ReportsView({ projects, assessments, portfolioStats }: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("MPMR_FLASH");
  const [isExporting, setIsExporting] = useState(false);

  // Map project ID to assessment
  const assessmentMap = new Map<string, ProjectRiskAssessment>();
  for (const a of assessments) {
    assessmentMap.set(a.projectId, a);
  }

  // High risk projects
  const highRiskProjects = projects.filter((p) => {
    const a = assessmentMap.get(p.id);
    return a && a.overallLevel === "HIGH";
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "prism-report.csv";

    if (selectedReport === "MPMR_FLASH") {
      filename = "mospi-mpmr-flash-summary.csv";
      csvContent += "Sector,Projects,Original Cost (Cr),Revised Cost (Cr),Cost Overrun (Cr),Delayed Projects,Dominant Risk\n";
      portfolioStats.sectors.forEach((s) => {
        csvContent += `"${s.sector}",${s.projectCount},${s.totalOriginalCostCr},${s.totalRevisedCostCr},${s.costRiskExposureCr},${s.delayedCount},"${s.dominantRisk}"\n`;
      });
    } else if (selectedReport === "HIGH_RISK_DOSSIER") {
      filename = "high-risk-projects-dossier.csv";
      csvContent += "Project Name,Sector,Agency,Original Cost (Cr),Revised Cost (Cr),Overrun (Cr),Overrun %,Progress %,Completion Date,Delayed,Composite Risk Score\n";
      highRiskProjects.forEach((p) => {
        const a = assessmentMap.get(p.id)!;
        const overrunCr = Math.max(0, p.revisedCostCr - p.originalCostCr);
        const overrunPct = Math.round((p.costOverrunRatio - 1) * 100);
        csvContent += `"${p.name}","${p.sector}","${p.implementingAgency}",${p.originalCostCr},${p.revisedCostCr},${overrunCr},${overrunPct}%,${p.physicalProgressPct}%,"${p.revisedCompletionDate}",${p.isDelayed ? "YES" : "NO"},${a.overallScore}\n`;
      });
    } else if (selectedReport === "DIMENSION_MATRIX") {
      filename = "risk-dimension-diagnostic-matrix.csv";
      csvContent += "Project Name,Sector,Composite Score,Composite Level,Cost Score,Schedule Score,Implementation Score,Data Completeness %\n";
      projects.forEach((p) => {
        const a = assessmentMap.get(p.id)!;
        const c = a.dimensions.find((d) => d.dimension === "COST")!.score;
        const s = a.dimensions.find((d) => d.dimension === "SCHEDULE")!.score;
        const i = a.dimensions.find((d) => d.dimension === "IMPLEMENTATION")!.score;
        csvContent += `"${p.name}","${p.sector}",${a.overallScore},"${a.overallLevel}",${c},${s},${i},${a.dataCompleteness.completenessPercent}%\n`;
      });
    } else {
      filename = "paimana-data-provenance-audit.csv";
      csvContent += "Project Name,Sector,Available Fields,Missing Fields,Completeness %\n";
      projects.forEach((p) => {
        const a = assessmentMap.get(p.id)!;
        csvContent += `"${p.name}","${p.sector}",${a.dataCompleteness.availableFields},"${a.dataCompleteness.missingFields.join(";")}",${a.dataCompleteness.completenessPercent}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2-5)" }}>
      {/* ── Report Selector Bar & Action Controls (Hidden on Print) ──── */}
      <div
        className="no-print"
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
        {/* Report Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[
            { id: "MPMR_FLASH", label: "MoSPI Flash Report (MPMR)", icon: "📊" },
            { id: "HIGH_RISK_DOSSIER", label: `High-Risk Exception Dossier (${highRiskProjects.length})`, icon: "⚠️" },
            { id: "DIMENSION_MATRIX", label: "Risk Dimension Matrix", icon: "📐" },
            { id: "DATA_AUDIT", label: "PAIMANA Data Audit", icon: "📋" },
          ].map((tab) => {
            const isActive = selectedReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as ReportType)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${isActive ? "var(--brand-blue)" : "var(--border-light)"}`,
                  backgroundColor: isActive ? "var(--brand-blue-bg)" : "var(--surface-white)",
                  color: isActive ? "var(--brand-blue)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Print & CSV Export */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--surface-white)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <span>📥</span>
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              fontSize: "0.75rem",
              fontWeight: 700,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--brand-blue)",
              backgroundColor: "var(--brand-blue)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <span>🖨️</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ── Formal Document Canvas (Printed & Viewed) ────────────────── */}
      <div
        className="card-print"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Formal Government Document Header */}
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Government Emblem */}
            <svg viewBox="0 0 48 48" fill="currentColor" width="44" height="44" style={{ color: "#d97706", flexShrink: 0 }}>
              <circle cx="24" cy="24" r="21" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
              <circle cx="24" cy="24" r="6" fill="none" stroke="#d97706" strokeWidth="1.5" />
              <path d="M24 6 v6 M24 36 v6 M6 24 h6 M36 24 h6 M11 11 l4 4 M33 33 l4 4 M11 37 l4-4 M33 15 l4-4" stroke="#d97706" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#0f172a", letterSpacing: "1px", textTransform: "uppercase" }}>
                GOVERNMENT OF INDIA • MINISTRY OF STATISTICS &amp; PROGRAMME IMPLEMENTATION
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "1px" }}>
                Infrastructure and Project Monitoring Division (IPMD) • PRISM Analytics Layer
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {selectedReport === "MPMR_FLASH" && "Monthly Project Monitoring Report (MPMR) — Executive Flash"}
                {selectedReport === "HIGH_RISK_DOSSIER" && "High-Risk Infrastructure Projects Exception Dossier"}
                {selectedReport === "DIMENSION_MATRIX" && "Comprehensive Risk Dimension Diagnostic Matrix"}
                {selectedReport === "DATA_AUDIT" && "PAIMANA Data Quality & Provenance Audit Report"}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ display: "inline-block", padding: "2px 8px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", fontSize: "0.65rem", fontWeight: 800, borderRadius: "var(--radius-xs)", textTransform: "uppercase" }}>
              OFFICIAL USE ONLY
            </span>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontFamily: "var(--font-mono)" }}>
              Ref: MoSPI/IPMD/PRISM-2026-Q3
            </span>
            <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
              Date: 23 September 2026
            </span>
          </div>
        </div>

        {/* ── Report Content: Mode 1 (MPMR Flash) ──────────────────── */}
        {selectedReport === "MPMR_FLASH" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {/* Macro Performance Indicators */}
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                1. Macro Performance Indicators
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-sm)", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>TOTAL MONITORED</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                    {portfolioStats.totalProjects} Projects
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>Across {portfolioStats.totalSectorsCount} Strategic Sectors</div>
                </div>

                <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-sm)", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>TOTAL SANCTIONED COST</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                    {formatCr(portfolioStats.totalRevisedCostCr - portfolioStats.potentialCostRiskExposureCr)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>Original CCEA Sanction</div>
                </div>

                <div style={{ padding: "12px", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", backgroundColor: "#fef2f2" }}>
                  <div style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: 700 }}>NET COST ESCALATION</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
                    +{formatCr(portfolioStats.potentialCostRiskExposureCr)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#991b1b", marginTop: "2px" }}>
                    +{Math.round((portfolioStats.potentialCostRiskExposureCr / (portfolioStats.totalRevisedCostCr - portfolioStats.potentialCostRiskExposureCr)) * 100)}% Portfolio Overrun
                  </div>
                </div>

                <div style={{ padding: "12px", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", backgroundColor: "#fffbeb" }}>
                  <div style={{ fontSize: "0.7rem", color: "#92400e", fontWeight: 700 }}>SCHEDULE OVERRUN</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#d97706", marginTop: "4px" }}>
                    {portfolioStats.delayedCount} Projects
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#92400e", marginTop: "2px" }}>
                    {formatCr(portfolioStats.potentialScheduleRiskExposureCr)} Capital Overdue
                  </div>
                </div>
              </div>
            </div>

            {/* Sectoral Breakdown Table */}
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                2. Sectoral Capital &amp; Risk Distribution
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", color: "#475569" }}>SECTOR</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>PROJECTS</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>ORIGINAL SANCTION</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>LATEST REVISED</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>COST OVERRUN</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>DELAYED</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>DOMINANT RISK</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioStats.sectors.map((s) => (
                    <tr key={s.sector} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0f172a" }}>{s.sector}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{s.projectCount}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{formatCr(s.totalOriginalCostCr)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatCr(s.totalRevisedCostCr)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "var(--font-mono)", color: s.costRiskExposureCr > 0 ? "#dc2626" : "#64748b", fontWeight: s.costRiskExposureCr > 0 ? 700 : 400 }}>
                        {s.costRiskExposureCr > 0 ? `+${formatCr(s.costRiskExposureCr)}` : "—"}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: s.delayedCount > 0 ? 700 : 400, color: s.delayedCount > 0 ? "#dc2626" : "#64748b" }}>
                        {s.delayedCount > 0 ? `${s.delayedCount} delayed` : "Nil"}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "var(--radius-xs)",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          backgroundColor: s.dominantRisk === "HIGH" ? "#fee2e2" : s.dominantRisk === "MEDIUM" ? "#fef3c7" : "#dcfce7",
                          color: s.dominantRisk === "HIGH" ? "#991b1b" : s.dominantRisk === "MEDIUM" ? "#92400e" : "#166534",
                        }}>
                          {s.dominantRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Observations */}
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                3. Key Analytical Findings &amp; Executive Assessment
              </h3>
              <div style={{ fontSize: "0.78rem", color: "#334155", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "8px" }}>
                <p>
                  <strong>Cost Creep Concentration:</strong> Out of {portfolioStats.totalProjects} monitored infrastructure projects, budget escalation is heavily concentrated in 2 mega-assets: BharatNet (+₹1,26,891 Cr, +208%) and Rajasthan Refinery (+₹36,367 Cr, +84%). These two projects constitute 97.4% of total financial risk exposure.
                </p>
                <p>
                  <strong>Target Date Adherence:</strong> Rewas Port Project has lapsed its scheduled completion date of 31/03/2023 with physical progress standing at 88%. No officially notified revised deadline has been submitted to PAIMANA.
                </p>
                <p>
                  <strong>Execution Velocity:</strong> Average physical progress across the sample is {portfolioStats.avgProgressPct}%. IIT Palakkad Phase B remains in mobilization stage at 0% physical progress despite sanction of ₹1,527 Cr.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Report Content: Mode 2 (High-Risk Dossier) ──────────── */}
        {selectedReport === "HIGH_RISK_DOSSIER" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", fontSize: "0.76rem", color: "#991b1b", lineHeight: 1.5 }}>
              <strong>CABINET COMMITTEE ON INFRASTRUCTURE (CCI) EXCEPTION BRIEF:</strong> The following {highRiskProjects.length} infrastructure projects have breached critical deterministic risk thresholds (score ≥ 60/100) due to severe financial overrun or schedule lapsing. Immediate inter-ministerial resolution is recommended.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {highRiskProjects.map((p) => {
                const a = assessmentMap.get(p.id)!;
                const costDim = a.dimensions.find((d) => d.dimension === "COST")!;
                const schedDim = a.dimensions.find((d) => d.dimension === "SCHEDULE")!;
                const implDim = a.dimensions.find((d) => d.dimension === "IMPLEMENTATION")!;
                const overrunCr = Math.max(0, p.revisedCostCr - p.originalCostCr);
                const overrunPct = Math.round((p.costOverrunRatio - 1) * 100);

                return (
                  <div key={p.id} style={{ border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", padding: "16px", backgroundColor: "#fafbfc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                          Implementing Agency: <strong>{p.implementingAgency}</strong> • Sector: <strong>{p.sector}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#dc2626" }}>{a.overallScore}/100</span>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase" }}>Critical Risk</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "12px", fontSize: "0.74rem" }}>
                      <div>
                        <span style={{ color: "#64748b" }}>Original Sanction:</span>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatCr(p.originalCostCr)}</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Revised Cost:</span>
                        <div style={{ fontWeight: 700, color: "#dc2626" }}>{formatCr(p.revisedCostCr)} (+{overrunPct}%)</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Physical Progress:</span>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{p.physicalProgressPct}%</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Target Completion:</span>
                        <div style={{ fontWeight: 700, color: p.isDelayed ? "#dc2626" : "#0f172a" }}>
                          {p.revisedCompletionDate} {p.isDelayed && "(OVERDUE)"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-sm)", fontSize: "0.72rem" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Identified Risk Vectors:</div>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
                        <span>Cost Vector: <strong style={{ color: "#dc2626" }}>{costDim.score}/100</strong></span>
                        <span>Schedule Vector: <strong style={{ color: schedDim.score >= 50 ? "#dc2626" : "#475569" }}>{schedDim.score}/100</strong></span>
                        <span>Implementation Vector: <strong>{implDim.score}/100</strong></span>
                      </div>
                      <div style={{ color: "#475569", lineHeight: 1.45 }}>
                        <strong>Diagnostic Summary:</strong> {a.whySummary}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Report Content: Mode 3 (Dimension Diagnostic Matrix) ─── */}
        {selectedReport === "DIMENSION_MATRIX" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <p style={{ fontSize: "0.78rem", color: "#475569" }}>
              Standardized comparison of all {projects.length} monitored assets across PRISM&apos;s three deterministic intelligence vectors.
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#475569" }}>PROJECT</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#475569" }}>SECTOR</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>COMPOSITE</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>COST RISK (40%)</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>SCHEDULE RISK (35%)</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>IMPLEMENTATION (25%)</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>DATA QUALITY</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const a = assessmentMap.get(p.id)!;
                  const c = a.dimensions.find((d) => d.dimension === "COST")!;
                  const s = a.dimensions.find((d) => d.dimension === "SCHEDULE")!;
                  const i = a.dimensions.find((d) => d.dimension === "IMPLEMENTATION")!;

                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                      <td style={{ padding: "8px 10px", color: "#64748b" }}>{p.sector}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: a.overallScore >= 60 ? "#dc2626" : a.overallScore >= 30 ? "#d97706" : "#16a34a" }}>
                        {a.overallScore}/100 ({a.overallLevel})
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: c.score >= 50 ? "#dc2626" : "#475569" }}>
                        {c.score}/100
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: s.score >= 50 ? "#dc2626" : "#475569" }}>
                        {s.score}/100
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: i.score >= 50 ? "#dc2626" : "#475569" }}>
                        {i.score}/100
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: "#64748b" }}>
                        {a.dataCompleteness.completenessPercent}% ({a.dataCompleteness.availableFields}/{a.dataCompleteness.totalFields})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Report Content: Mode 4 (PAIMANA Data Audit) ─────────── */}
        {selectedReport === "DATA_AUDIT" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.5 }}>
              Verification and completeness audit of the active PAIMANA / OCMS ingest feed. Highlights missing data attributes required for advanced predictive modeling.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "12px", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>
                  ✓ Consistently Available Fields (100% Ingest Rate):
                </div>
                <ul style={{ fontSize: "0.72rem", color: "#14532d", paddingLeft: "16px", lineHeight: 1.6 }}>
                  <li><code>sector</code> — Functional line classification</li>
                  <li><code>implementing_agency</code> — Responsible executing PSU/Ministry</li>
                  <li><code>project_name</code> — Official sanctioned title</li>
                  <li><code>original_cost_cr</code> — Initial cabinet sanction (₹ Cr)</li>
                  <li><code>latest_revised_cost_cr</code> — Current approved revised estimate (₹ Cr)</li>
                  <li><code>physical_progress_pct</code> — Reported milestone completion (0-100%)</li>
                  <li><code>latest_revised_completion_date</code> — DD/MM/YYYY target date</li>
                </ul>
              </div>

              <div style={{ padding: "12px", border: "1px solid #fed7aa", backgroundColor: "#fff7ed", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a3412", marginBottom: "6px" }}>
                  ⚠ Recommended Additional Fields for Full Deployment:
                </div>
                <ul style={{ fontSize: "0.72rem", color: "#7c2d12", paddingLeft: "16px", lineHeight: 1.6 }}>
                  <li><code>cumulative_expenditure_cr</code> — Actual cash outflow to date</li>
                  <li><code>original_completion_date</code> — Baseline sanction deadline</li>
                  <li><code>project_sanction_date</code> — Date of CCEA approval</li>
                  <li><code>contractor_ids</code> — Major EPC contractor entities</li>
                  <li><code>clearance_milestones</code> — Forest, environmental, and railway clearances</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Official Document Sign-Off Block ─────────────────────── */}
        <div style={{ marginTop: "var(--space-2)", paddingTop: "16px", borderTop: "1px solid #cbd5e1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "0.72rem" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Prepared By:</div>
            <div style={{ color: "#475569", marginTop: "2px" }}>PRISM Autonomous Analytics Subsystem</div>
            <div style={{ color: "#94a3b8", fontSize: "0.68rem" }}>Deterministic Risk Engine v1.0.0</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Data Provenance:</div>
            <div style={{ color: "#475569", marginTop: "2px" }}>PAIMANA / OCMS National Database</div>
            <div style={{ color: "#94a3b8", fontSize: "0.68rem" }}>Ref Sample: paimana_real_sample.csv</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Submitted To:</div>
            <div style={{ color: "#475569", marginTop: "2px" }}>Director General, MoSPI / CCI</div>
            <div style={{ color: "#94a3b8", fontSize: "0.68rem" }}>Sardar Patel Bhavan, New Delhi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
