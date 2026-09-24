"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import styles from "./sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isAvailable: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Sectors",
      href: "/sectors",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      label: "Projects",
      href: "/projects",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      label: "Risk Analysis",
      href: "/risk-analysis",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "iPRISM AI",
      href: "/iprism",
      isAvailable: true,
      badge: "AI",
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      label: "Reports",
      href: "/reports",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      label: "Data Explorer",
      href: "/data-explorer",
      isAvailable: true,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
      aria-label="Main Navigation"
    >
      {/* Brand Header with clickable Logo navigating to Landing Page and Permanent Collapsible Arrow */}
      <div className={styles.brandHeader}>
        <Link
          href="/"
          className={styles.brandLink}
          title="Return to PRISM Landing Page"
          id="sidebar-logo-link"
        >
          <div className={styles.emblem} aria-hidden="true">
            {/* Government of India Emblem Symbol */}
            <svg viewBox="0 0 48 48" fill="currentColor" width="34" height="34">
              <circle cx="24" cy="24" r="21" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
              <circle cx="24" cy="24" r="6" fill="none" stroke="#d97706" strokeWidth="1.5" />
              <path
                d="M24 6 v6 M24 36 v6 M6 24 h6 M36 24 h6 M11 11 l4 4 M33 33 l4 4 M11 37 l4-4 M33 15 l4-4"
                stroke="#d97706"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <div className={styles.brandText}>
              <span className={styles.countryTitle}>Government of India</span>
              <span className={styles.ministrySubtitle}>
                Ministry of Statistics &amp; Programme Implementation
              </span>
            </div>
          )}
        </Link>

        {/* Permanent Collapsible Arrow: Stays ON at all times, points LEFT (<) when opened, RIGHT (>) when closed */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={styles.collapseArrowBtn}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          aria-label={isCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          id="sidebar-collapse-arrow"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.arrowIcon}
          >
            {isCollapsed ? (
              /* Points RIGHT (>) when closed/collapsed to expand */
              <polyline points="9 18 15 12 9 6" />
            ) : (
              /* Points LEFT (<) when opened/expanded to collapse */
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));

          return (
            <li key={item.label} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.iconWrapper}>{item.icon}</span>
                {!isCollapsed && <span className={styles.navText}>{item.label}</span>}
                {!isCollapsed && item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Clean Footer Area: No buttons at bottom */}
      {!isCollapsed && (
        <div className={styles.sidebarFooter}>
          <p className={styles.tagline}>
            A More Accountable<br />
            A More Developed India
          </p>
        </div>
      )}
    </aside>
  );
}
