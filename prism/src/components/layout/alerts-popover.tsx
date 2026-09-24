"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ActiveAlert } from "@/analytics/alert-service";
import styles from "./topbar.module.css";

interface AlertsPopoverProps {
  alerts: ActiveAlert[];
}

export function AlertsPopover({ alerts }: AlertsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING").length;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.alertPopoverContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bell Button */}
      <button
        type="button"
        className={`${styles.bellButton} ${isOpen ? styles.bellButtonActive : ""}`}
        aria-label="Active Early Warning Alerts"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        title={`${alerts.length} active alerts flagged by PRISM`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {alerts.length > 0 && (
          <span className={styles.bellBadge}>{alerts.length}</span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className={styles.alertsDropdown}>
          {/* Header */}
          <div className={styles.alertsHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1rem" }}>🔔</span>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                  Active Early Warning Alerts
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                  Flagged by PRISM Risk Engine &amp; Predictive Pipeline
                </div>
              </div>
            </div>

            <span className={styles.alertsSummaryBadge}>
              {criticalCount} Critical • {warningCount} Warning
            </span>
          </div>

          {/* Scrollable Alerts List */}
          <div className={styles.alertsList}>
            {alerts.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748b", fontSize: "0.78rem" }}>
                ✓ No active risk thresholds breached across monitored projects.
              </div>
            ) : (
              alerts.map((alert) => {
                const isCrit = alert.severity === "CRITICAL";
                const isWarn = alert.severity === "WARNING";

                return (
                  <Link
                    key={alert.id}
                    href={`/projects/${alert.projectId}`}
                    className={styles.alertCard}
                    onClick={() => setIsOpen(false)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                      <span
                        className={styles.alertSeverityTag}
                        style={{
                          backgroundColor: isCrit ? "#fee2e2" : isWarn ? "#fef3c7" : "#dbeafe",
                          color: isCrit ? "#991b1b" : isWarn ? "#92400e" : "#1e40af",
                          border: `1px solid ${isCrit ? "#fca5a5" : isWarn ? "#fcd34d" : "#bfdbfe"}`,
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                        {alert.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                      {alert.projectName}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: isCrit ? "#dc2626" : "#b45309", fontWeight: 600, marginTop: "2px" }}>
                      {alert.title}
                    </div>

                    <p style={{ fontSize: "0.7rem", color: "#475569", marginTop: "3px", lineHeight: 1.35 }}>
                      {alert.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px", fontSize: "0.66rem", color: "#64748b" }}>
                      <span>Sector: <strong>{alert.sector}</strong></span>
                      <span style={{ color: "var(--brand-blue)", fontWeight: 700 }}>Inspect Project →</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={styles.alertsFooter}>
            <Link
              href="/risk-analysis"
              className={styles.alertsFooterLink}
              onClick={() => setIsOpen(false)}
            >
              View Full Portfolio Risk Analysis Matrix →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
