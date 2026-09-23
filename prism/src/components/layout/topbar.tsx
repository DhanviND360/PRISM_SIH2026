import styles from "./topbar.module.css";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
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
        <span className={styles.prototypeTag}>PAIMANA Sample Data</span>

        <button className={styles.bellButton} aria-label="Notifications" title="No unread alerts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.bellDot} />
        </button>

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
