"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
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
      href: "#",
      isAvailable: false,
      badge: "Phase 3",
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "Reports",
      href: "#",
      isAvailable: false,
      badge: "Phase 3",
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
      href: "#",
      isAvailable: false,
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      label: "Alerts",
      href: "#",
      isAvailable: false,
      badge: "3",
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandHeader}>
        <div className={styles.emblem} aria-hidden="true">
          {/* Government of India Emblem Symbol */}
          <svg viewBox="0 0 48 48" fill="currentColor" width="34" height="34">
            <circle cx="24" cy="24" r="21" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
            <circle cx="24" cy="24" r="6" fill="none" stroke="#d97706" strokeWidth="1.5" />
            <path d="M24 6 v6 M24 36 v6 M6 24 h6 M36 24 h6 M11 11 l4 4 M33 33 l4 4 M11 37 l4-4 M33 15 l4-4" stroke="#d97706" strokeWidth="1.5" />
          </svg>
        </div>
        <div className={styles.brandText}>
          <span className={styles.countryTitle}>Government of India</span>
          <span className={styles.ministrySubtitle}>
            Ministry of Statistics &amp; Programme Implementation
          </span>
        </div>
      </div>

      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href !== "#" && pathname.startsWith(item.href);

          if (!item.isAvailable) {
            return (
              <li key={item.label} className={styles.navItem}>
                <span
                  className={styles.navLink}
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                  title="Coming in later phases"
                >
                  {item.icon}
                  <span className={styles.navText}>{item.label}</span>
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </span>
              </li>
            );
          }

          return (
            <li key={item.label} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.icon}
                <span className={styles.navText}>{item.label}</span>
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.sidebarFooter}>
        <div className={styles.paimanaLink}>
          <span>Built with PAIMANA Data</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </div>
        <p className={styles.tagline}>
          A More Accountable<br />
          A More Developed India
        </p>
      </div>
    </aside>
  );
}
