"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import { computeActiveAlerts, type ActiveAlert } from "@/analytics/alert-service";
import { useSidebar } from "./sidebar-context";
import { AlertsPopover } from "./alerts-popover";
import styles from "./topbar.module.css";

export function Topbar() {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const { isCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    getDataProvider()
      .getAllProjects()
      .then((projects) => {
        setAlerts(computeActiveAlerts(projects));
      })
      .catch((err) => {
        console.error("Failed to load alerts in topbar:", err);
      });
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
        {/* Sidebar Collapse/Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={styles.sidebarToggleBtn}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          aria-label={isCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          id="topbar-sidebar-toggle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            {isCollapsed ? (
              <polyline points="13 9 16 12 13 15" />
            ) : (
              <polyline points="15 9 12 12 15 15" />
            )}
          </svg>
        </button>

        {/* PRISM Brand Area - Clickable link navigating directly to Public Landing Page */}
        <Link
          href="/"
          className={styles.prismLogoLink}
          title="Return to PRISM Public Portal Home"
          id="topbar-logo-link"
        >
          <div className={styles.prismLogo}>
            {/* PRISM Brand Symbol: Intersecting multi-spectral prism */}
            <svg className={styles.prismIcon} viewBox="0 0 32 32" fill="none">
              <polygon points="16,4 4,26 28,26" stroke="#0f766e" strokeWidth="2.5" fill="rgba(15, 118, 110, 0.1)" />
              <polygon points="16,10 9,23 23,23" stroke="#047857" strokeWidth="1.5" fill="rgba(16, 185, 129, 0.2)" />
              <circle cx="16" cy="18" r="2.5" fill="#d97706" />
            </svg>
            <span className={styles.prismTitle}>PRISM</span>
          </div>
          <div className={styles.prismDivider} />
          <span className={styles.prismTagline}>
            Predictive Risk Intelligence for Smart Monitoring
          </span>
        </Link>
      </div>

      <div className={styles.searchArea}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search projects, sectors, agencies..."
          className={styles.searchInput}
          aria-label="Search projects and sectors"
          readOnly
        />
      </div>

      <div className={styles.userArea}>
        {/* Real-time early warning alerts popover on hover */}
        <AlertsPopover alerts={alerts} />

        <div className={styles.userProfile}>
          <div className={styles.avatar}>DG</div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>Director General</span>
            <span className={styles.userRole}>MoSPI, New Delhi</span>
          </div>
        </div>
      </div>
    </header>
  );
}
