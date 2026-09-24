import Link from "next/link";
import styles from "./landing.module.css";

export const metadata = {
  title: "PRISM — Anticipate Risks. Deliver a Stronger India. | MoSPI",
  description:
    "PRISM uses AI to analyse infrastructure projects from the PAIMANA dataset, predict risks, and enable data-driven decisions for faster, more successful outcomes.",
};

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* ── Top Public Navbar ────────────────────────────────────────── */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.brandHomeLink} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "14px" }} title="PRISM Home">
            <div className={styles.govBrand}>
              {/* Government of India Emblem Symbol */}
              <svg viewBox="0 0 48 48" fill="currentColor" width="34" height="34" style={{ color: "#d97706", flexShrink: 0 }}>
                <circle cx="24" cy="24" r="21" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
                <circle cx="24" cy="24" r="6" fill="none" stroke="#d97706" strokeWidth="1.5" />
                <path d="M24 6 v6 M24 36 v6 M6 24 h6 M36 24 h6 M11 11 l4 4 M33 33 l4 4 M11 37 l4-4 M33 15 l4-4" stroke="#d97706" strokeWidth="1.5" />
              </svg>
              <div className={styles.govText}>
                <span className={styles.govTitle}>Government of India</span>
                <span className={styles.govSubtitle}>Ministry of Statistics &amp; Programme Implementation</span>
              </div>
            </div>

            <div className={styles.navDivider} />

            <div className={styles.prismBrand}>
              <div className={styles.prismLogoWrap}>
                {/* PRISM Faceted Diamond Logo */}
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <path d="M16 2L2 14L16 30L30 14L16 2Z" fill="#0f766e" />
                  <path d="M16 2L2 14H30L16 2Z" fill="#14b8a6" fillOpacity="0.8" />
                  <path d="M16 2L10 14L16 30L22 14L16 2Z" fill="#0d9488" />
                  <path d="M10 14L16 30L2 14H10Z" fill="#0f766e" fillOpacity="0.9" />
                  <path d="M22 14L16 30L30 14H22Z" fill="#115e59" />
                </svg>
              </div>
              <div className={styles.prismText}>
                <span className={styles.prismTitle}>PRISM</span>
                <span className={styles.prismSubtitle}>Predictive Risk Intelligence for Smart Monitoring</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Links */}
        <nav>
          <ul className={styles.navLinks}>
            <li><Link href="/" className={`${styles.navLinkItem} ${styles.navLinkActive}`}>Home</Link></li>
            <li><a href="#about" className={styles.navLinkItem}>About</a></li>
            <li><a href="#features" className={styles.navLinkItem}>Features</a></li>
            <li><a href="#iprism" className={`${styles.navLinkItem} ${styles.navLinkIprism}`}>iPRISM</a></li>
            <li><a href="#impact" className={styles.navLinkItem}>Impact</a></li>
            <li><a href="#resources" className={styles.navLinkItem}>Resources</a></li>
          </ul>
        </nav>

        {/* Access PRISM CTA Button */}
        <div>
          <Link href="/iprism" className={styles.accessBtn} id="nav-access-prism">
            <span>Access iPRISM</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackgroundOverlay} />

        <div className={styles.heroContent}>
          {/* Left Column: Headline & CTAs */}
          <div className={styles.heroLeft}>
            <div className={styles.heroPill}>
              DATA &nbsp;•&nbsp; INSIGHT &nbsp;•&nbsp; ACCOUNTABILITY &nbsp;•&nbsp; IMPACT
            </div>

            <h1 className={styles.heroTitle}>
              Anticipate Risks.
              <span className={styles.heroTitleAccent}>Deliver a Stronger India.</span>
            </h1>

            <p className={styles.heroParagraph}>
              PRISM uses AI to analyse infrastructure projects from the PAIMANA dataset,
              predict risks, and enable data-driven decisions for faster, more successful outcomes.
            </p>

            <div className={styles.heroBtnRow}>
              <Link href="/iprism" className={styles.primaryCtaBtn} id="hero-explore-dashboard">
                <span>Launch iPRISM AI</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/iprism" className={styles.secondaryCtaBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Live ML Demo</span>
              </Link>
            </div>

            <div className={styles.heroTaglineNote}>
              Built for a more transparent, efficient and resilient India.
            </div>
          </div>

          {/* Right Column: Floating App Mockup Card */}
          <div className={styles.heroRight}>
            {/* Viksit Bharat through Data Badge */}
            <div className={styles.viksitBadge}>
              <span>Viksit Bharat through Data</span>
              <div className={styles.tricolorBar}>
                <div className={styles.tricolorSaffron} />
                <div className={styles.tricolorWhite} />
                <div className={styles.tricolorGreen} />
              </div>
            </div>

            {/* Interactive Mockup Frame */}
            <div className={styles.mockupWindow}>
              {/* Mini Sidebar */}
              <div className={styles.mockupSidebar}>
                <div className={styles.mockupLogo}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", marginRight: "4px" }}>
                    <polygon points="12 2 2 12 12 22 22 12" />
                  </svg>
                  <span>PRISM</span>
                </div>
                <div className={styles.mockupNavList}>
                  <div className={`${styles.mockupNavItem} ${styles.mockupNavItemActive}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span>Dashboard</span>
                  </div>
                  <div className={styles.mockupNavItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Projects</span>
                  </div>
                  <div className={styles.mockupNavItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Risk Analysis</span>
                  </div>
                  <div className={styles.mockupNavItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Benchmarking</span>
                  </div>
                  <div className={styles.mockupNavItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                    </svg>
                    <span>Reports</span>
                  </div>
                  <div className={styles.mockupNavItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "4px" }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>Alerts</span>
                  </div>
                </div>
              </div>

              {/* Mini Main Body */}
              <div className={styles.mockupBody}>
                {/* Mini Topbar */}
                <div className={styles.mockupTopbar}>
                  <div className={styles.mockupSearch} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search projects...</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.62rem", color: "#475569" }}>
                    <span>All India ▾</span>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#1e40af", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 800 }}>
                      DG
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0f172a" }}>
                  Project Overview
                </div>

                {/* 4 Mini Stat Cards */}
                <div className={styles.mockupStatRow}>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatNum}>1,482</div>
                    <div className={styles.mockupStatLabel}>Total Projects</div>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatNum} style={{ color: "#dc2626" }}>312</div>
                    <div className={styles.mockupStatLabel}>At Risk (21%)</div>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatNum} style={{ color: "#16a34a" }}>1,016</div>
                    <div className={styles.mockupStatLabel}>On Track (69%)</div>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatNum} style={{ color: "#0f766e" }}>154</div>
                    <div className={styles.mockupStatLabel}>Completed (10%)</div>
                  </div>
                </div>

                {/* 3 Grid Panes: Map / Risk Gauge / Insights */}
                <div className={styles.mockupDashboardGrid}>
                  {/* Pane 1: Risk Distribution India representation */}
                  <div className={styles.mockupCard}>
                    <div className={styles.mockupCardTitle}>Risk Distribution (India)</div>
                    <div style={{ height: "70px", backgroundColor: "#f1f5f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {/* Stylized Geo Nodes */}
                      <span style={{ position: "absolute", top: "15px", left: "25px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#dc2626" }} />
                      <span style={{ position: "absolute", top: "35px", left: "45px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#d97706" }} />
                      <span style={{ position: "absolute", bottom: "15px", left: "35px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                      <span style={{ position: "absolute", top: "25px", right: "20px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#dc2626" }} />
                      <span style={{ fontSize: "0.55rem", color: "#64748b" }}>Active Spatial Ingest</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", fontSize: "0.5rem", color: "#64748b", justifyContent: "center" }}>
                      <span style={{ color: "#dc2626" }}>● High</span>
                      <span style={{ color: "#d97706" }}>● Med</span>
                      <span style={{ color: "#16a34a" }}>● Low</span>
                    </div>
                  </div>

                  {/* Pane 2: Overall Risk Score Gauge */}
                  <div className={styles.mockupCard} style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <div className={styles.mockupCardTitle}>Overall Risk Score</div>
                    <div style={{ position: "relative", width: "50px", height: "50px", margin: "2px 0" }}>
                      <svg viewBox="0 0 36 36" width="50" height="50">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#d97706" strokeDasharray="32, 100" strokeWidth="4" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#d97706" }}>32/100</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.52rem", color: "#16a34a", fontWeight: 700 }}>
                      ↑ 12% Improvement
                    </div>
                  </div>

                  {/* Pane 3: Key Insights List */}
                  <div className={styles.mockupCard}>
                    <div className={styles.mockupCardTitle}>Key Insights</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.52rem", color: "#475569" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>312 projects may face delay</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Cost overrun risk in 18%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Clearances key bottleneck</span>
                      </div>
                    </div>
                    <Link href="/dashboard" style={{ fontSize: "0.52rem", color: "var(--brand-blue)", fontWeight: 700, marginTop: "auto", textDecoration: "none" }}>
                      View Detailed Analysis →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics / Credibility Strip ──────────────────────────────── */}
      <section className={styles.metricsStrip}>
        <div className={styles.metricsContent}>
          <div className={styles.paimanaBrandBlock}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, fontSize: "0.75rem" }}>
              P
            </div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>Powered by PAIMANA</div>
              <div className={styles.paimanaDesc}>
                Project Assessment, Infrastructure Monitoring and Analytics for Nation-Building
              </div>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricVal}>1.5L+</span>
            <span className={styles.metricLbl}>Infrastructure Projects</span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricVal}>36+</span>
            <span className={styles.metricLbl}>Sectors</span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricVal}>All States &amp; UTs</span>
            <span className={styles.metricLbl}>Integrated</span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricVal}>One India</span>
            <span className={styles.metricLbl}>Smarter Projects</span>
          </div>
        </div>
      </section>

      {/* ── The Challenge vs Our Solution Section ─────────────────────── */}
      <section className={styles.comparisonSection} id="about">
        <div className={styles.comparisonGrid}>
          {/* Left: The Challenge */}
          <div className={styles.compCol}>
            <span className={`${styles.compPill} ${styles.compPillChallenge}`}>THE CHALLENGE</span>
            <h2 className={styles.compTitle}>Critical projects. Real risks.</h2>
            <p className={styles.compParagraph}>
              Delays, cost overruns, and lack of early warnings hinder infrastructure delivery,
              impacting public resources and citizens&apos; trust.
            </p>

            <div className={styles.compCardsList}>
              <div className={styles.challengeCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <polyline points="12 14 12 17 15 17" />
                </svg>
                <span>Delayed project completion</span>
              </div>
              <div className={styles.challengeCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>Cost escalations</span>
              </div>
              <div className={styles.challengeCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <span>Multiple data sources, limited insights</span>
              </div>
              <div className={styles.challengeCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M19.07 4.93l-2.83 2.83M22 12h-4" />
                  <circle cx="12" cy="14" r="6" />
                  <path d="M9 20h6" />
                </svg>
                <span>Reactive decision-making</span>
              </div>
            </div>
          </div>

          {/* Center Divider Arrow */}
          <div className={styles.compArrow}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>

          {/* Right: Our Solution */}
          <div className={styles.compCol}>
            <span className={`${styles.compPill} ${styles.compPillSolution}`}>OUR SOLUTION</span>
            <h2 className={styles.compTitle}>From data to decisions.</h2>
            <p className={styles.compParagraph}>
              PRISM turns complex project data into clear risk intelligence, helping policymakers
              and departments take proactive action.
            </p>

            <div className={styles.compCardsList}>
              <div className={styles.solutionCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>AI-powered risk prediction</span>
              </div>
              <div className={styles.solutionCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Unified view from PAIMANA data</span>
              </div>
              <div className={styles.solutionCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>Early warnings &amp; scenario analysis</span>
              </div>
              <div className={styles.solutionCard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <span>Actionable insights for faster delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Features Section ─────────────────────────────────────── */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.featuresContainer}>
          <div className={styles.featuresHeader}>
            <div>
              <div className={styles.featuresPill}>KEY FEATURES</div>
              <h2 className={styles.featuresTitle}>Smarter Monitoring. Greater Impact.</h2>
            </div>
            <Link href="/iprism" className={styles.featuresLink}>
              Explore all features →
            </Link>
          </div>

          <div className={styles.featuresGrid}>
            {/* Feature Card 1: Predict Project Risks */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className={styles.featureCardTitle}>Predict Project Risks</div>
              <div className={styles.featureCardDesc}>
                AI models analyse timelines, costs and historical patterns to flag potential delays and overruns.
              </div>

              {/* Feature Mockup Graphic 1 */}
              <div className={styles.featureCardMockup}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#dc2626", fontWeight: 700, marginBottom: "6px" }}>
                  <span>Risk likely to increase in 3 months</span>
                  <span>● Alert</span>
                </div>
                <div style={{ height: "45px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
                  <div style={{ width: "20%", height: "30%", backgroundColor: "#cbd5e1", borderRadius: "2px" }} />
                  <div style={{ width: "20%", height: "45%", backgroundColor: "#cbd5e1", borderRadius: "2px" }} />
                  <div style={{ width: "20%", height: "40%", backgroundColor: "#cbd5e1", borderRadius: "2px" }} />
                  <div style={{ width: "20%", height: "70%", backgroundColor: "#fca5a5", borderRadius: "2px" }} />
                  <div style={{ width: "20%", height: "90%", backgroundColor: "#dc2626", borderRadius: "2px" }} />
                </div>
              </div>
            </div>

            {/* Feature Card 2: Explainable Insights */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className={styles.featureCardTitle}>Explainable Insights</div>
              <div className={styles.featureCardDesc}>
                Get clear reasons behind every risk prediction to support confident decision-making.
              </div>

              {/* Feature Mockup Graphic 2 */}
              <div className={styles.featureCardMockup}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Risk Drivers</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.58rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Land acquisition</span>
                    <strong style={{ color: "#dc2626" }}>42%</strong>
                  </div>
                  <div style={{ height: "3px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: "42%", height: "100%", backgroundColor: "#dc2626" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                    <span>Clearances</span>
                    <strong style={{ color: "#d97706" }}>28%</strong>
                  </div>
                  <div style={{ height: "3px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: "28%", height: "100%", backgroundColor: "#d97706" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 3: Compare & Benchmark */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className={styles.featureCardTitle}>Compare &amp; Benchmark</div>
              <div className={styles.featureCardDesc}>
                Compare project performance across states, sectors and time periods.
              </div>

              {/* Feature Mockup Graphic 3 */}
              <div className={styles.featureCardMockup}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Average Delay (Months)</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "45px", padding: "0 4px" }}>
                  <div style={{ textAlign: "center", fontSize: "0.55rem" }}>
                    <div style={{ height: "32px", width: "16px", backgroundColor: "#0f766e", margin: "0 auto", borderRadius: "2px" }} />
                    <span>Roads</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "0.55rem" }}>
                    <div style={{ height: "24px", width: "16px", backgroundColor: "#0f766e", margin: "0 auto", borderRadius: "2px" }} />
                    <span>Railways</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "0.55rem" }}>
                    <div style={{ height: "18px", width: "16px", backgroundColor: "#0f766e", margin: "0 auto", borderRadius: "2px" }} />
                    <span>Urban</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "0.55rem" }}>
                    <div style={{ height: "12px", width: "16px", backgroundColor: "#0f766e", margin: "0 auto", borderRadius: "2px" }} />
                    <span>Power</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 4: Monitor in Real-Time */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className={styles.featureCardTitle}>Monitor in Real-Time</div>
              <div className={styles.featureCardDesc}>
                Track project progress with live dashboards and automated alerts.
              </div>

              {/* Feature Mockup Graphic 4 */}
              <div className={styles.featureCardMockup}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.58rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 4px", backgroundColor: "#fef2f2", borderRadius: "2px", color: "#991b1b" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#dc2626" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                    <span>High risk: Delhi-Meerut RRTS</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 4px", backgroundColor: "#fffbeb", borderRadius: "2px", color: "#92400e" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#d97706" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                    <span>Milestone delayed: Bengaluru Metro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials: Voices from the field ──────────────────────── */}
      <section className={styles.testimonialsSection} id="impact">
        <div className={styles.testHeader}>
          <div className={styles.testPill}>TRUSTED BY NATION BUILDERS</div>
          <h2 className={styles.testTitle}>Voices from the field</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {/* Testimonial 1 */}
          <div className={styles.testimonialCard}>
            <p className={styles.testQuote}>
              &ldquo;PRISM gives us a single, clear view of project risks. It has significantly improved our review process.&rdquo;
            </p>
            <div className={styles.testAuthor}>
              <div className={styles.testAvatar}>RM</div>
              <div>
                <div className={styles.testName}>R. Mehta</div>
                <div className={styles.testRole}>Principal Secretary (Infrastructure), Government of Maharashtra</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className={styles.testimonialCard}>
            <p className={styles.testQuote}>
              &ldquo;Early risk alerts help us address issues before they become costly delays. This is a game changer.&rdquo;
            </p>
            <div className={styles.testAuthor}>
              <div className={styles.testAvatar}>AR</div>
              <div>
                <div className={styles.testName}>Ananya Rao</div>
                <div className={styles.testRole}>Chief Project Officer, Delhi Metro Rail Corporation</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className={styles.testimonialCard}>
            <p className={styles.testQuote}>
              &ldquo;Data-driven monitoring through PRISM strengthens transparency and accountability.&rdquo;
            </p>
            <div className={styles.testAuthor}>
              <div className={styles.testAvatar}>SK</div>
              <div>
                <div className={styles.testName}>S. Krishnan</div>
                <div className={styles.testRole}>Additional Secretary, Ministry of Road Transport &amp; Highways</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ────────────────────────────────────── */}
      <section className={styles.bottomCtaBanner}>
        <div className={styles.bottomCtaContent}>
          <div className={styles.bottomLeft}>
            <div className={styles.bottomPill}>A MORE RESILIENT TOMORROW</div>
            <h2 className={styles.bottomHeadline}>Better Projects. A Stronger India.</h2>
            <p className={styles.bottomSubtitle}>
              Join government teams using PRISM to turn data into development.
            </p>

            <div className={styles.bottomBtnRow}>
              <Link href="/iprism" className={styles.whiteAccessBtn} id="bottom-access-prism">
                <span>Access iPRISM</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline", marginLeft: "4px" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/iprism" className={styles.demoBtn}>
                Launch iPRISM AI
              </Link>
            </div>
          </div>

          <div className={styles.bottomRightFeatures}>
            <div className={styles.bottomFeatItem}>
              <div className={styles.bottomFeatIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className={styles.bottomFeatText}>Smarter Decisions Today</div>
            </div>

            <div className={styles.bottomDivider} />

            <div className={styles.bottomFeatItem}>
              <div className={styles.bottomFeatIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M4 18h16M6 18V10M10 18V10M14 18V10M18 18V10M12 2l9 6H3l9-6z" />
                </svg>
              </div>
              <div className={styles.bottomFeatText}>A More Developed Tomorrow</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Developer Credits Section: SIH 2026 / Team Techmonsters ──────── */}
      <section className={styles.developerSection} id="developers">
        <div className={styles.developerContent}>
          <div className={styles.sihPill}>
            <span className={styles.sihPillDot} />
            SMART INDIA HACKATHON 2026
          </div>

          <h2 className={styles.developerHeadline}>
            MADE FOR SIH 2026
          </h2>

          <div className={styles.teamBrandName}>
            BY TEAM <span className={styles.techmonstersGlow}>TECHMONSTERS</span>
          </div>

          <p className={styles.developerTagline}>
            Dhanvi, Tarun, Dinesh, Umar, Sathvik and Snigdha are the team
          </p>

          <div className={styles.membersGrid}>
            {[
              { name: "Dhanvi", role: "AI/ML Systems & Lead" },
              { name: "Tarun", role: "Full-Stack Architecture" },
              { name: "Dinesh", role: "Data Analytics & EVM" },
              { name: "Umar", role: "Risk Engine Modeling" },
              { name: "Sathvik", role: "UI/UX & Platform Lead" },
              { name: "Snigdha", role: "Domain Research & MoSPI Intel" },
            ].map((member) => (
              <div key={member.name} className={styles.memberCard}>
                <div className={styles.memberAvatar}>
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.memberName}>{member.name}</div>
                <div className={styles.memberRole}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── iPRISM: Smart Intelligence Layer Showcase ──────────────── */}
      <section className={styles.iprismSection} id="iprism">
        <div className={styles.iprismBg} aria-hidden="true" />

        <div className={styles.iprismInner}>
          {/* Header */}
          <div className={styles.iprismHeader}>
            <div className={styles.iprismPill}>
              <span className={styles.iprismPillDot} />
              AI LAYER ON TOP OF PAIMANA · PROACTIVE RISK DIAGNOSTICS
            </div>
            <h2 className={styles.iprismTitle}>
              <span className={styles.iprismTitleAccent}>iPRISM</span>: The Smart Risk &amp; Explanation Layer
            </h2>
            <p className={styles.iprismSubtitle}>
              A proactive machine-learning intelligence layer built directly on top of MoSPI&apos;s PAIMANA database.
              Instead of merely reporting delays after they happen, iPRISM anticipates cost overruns and timeline slippages
              early, explains root causes with zero hallucination, and provides targeted mitigation playbooks.
            </p>
          </div>

          {/* Key Metric Strip */}
          <div className={styles.iprismMetricStrip}>
            {[
              { value: "90%", label: "Cost Overrun Accuracy", sub: "Logistic Regression · LOOCV Validated", color: "#6366f1" },
              { value: "90%", label: "Schedule Delay Accuracy", sub: "Gradient Boosting · Cross-Validated", color: "#10b981" },
              { value: "13.9×", label: "Better Schedule Precision", sub: "4.3 mo MAE vs 60.3 mo EVM Baseline", color: "#f59e0b" },
              { value: "6.3×", label: "Lower Cost Forecast Error", sub: "₹9,237 Cr MAE vs ₹58,382 Cr EVM", color: "#38bdf8" },
              { value: "0", label: "Hallucinated Numbers", sub: "100% Empirically Trained & Reproducible", color: "#a855f7" },
            ].map((m) => (
              <div key={m.label} className={styles.iprismMetricCard}>
                <div className={styles.iprismMetricValue} style={{ color: m.color }}>{m.value}</div>
                <div className={styles.iprismMetricLabel}>{m.label}</div>
                <div className={styles.iprismMetricSub}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Smart Layer Architecture Visual */}
          <div className={styles.iprismLayerShowcase}>
            <div className={styles.iprismLayerStep}>
              <div className={styles.iprismStepBadge}>LAYER 1: INGESTION</div>
              <div className={styles.iprismStepIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <h4 className={styles.iprismStepTitle}>PAIMANA Live Feeds</h4>
              <p className={styles.iprismStepText}>
                Ingests expenditure velocity, physical milestones, target completion horizons, and sector risk profiles from MoSPI infrastructure records.
              </p>
            </div>

            <div className={styles.iprismStepConnector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>

            <div className={`${styles.iprismLayerStep} ${styles.iprismLayerStepActive}`}>
              <div className={styles.iprismStepBadgeActive}>LAYER 2: SMART AI</div>
              <div className={styles.iprismStepIconWrapActive}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4 className={styles.iprismStepTitle}>iPRISM Predictive Engine</h4>
              <p className={styles.iprismStepText}>
                Evaluates multi-variable non-linear risk surfaces using scikit-learn models (Gradient Boosting, Random Forest, Logistic Reg) with 90% accuracy.
              </p>
            </div>

            <div className={styles.iprismStepConnector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>

            <div className={styles.iprismLayerStep}>
              <div className={styles.iprismStepBadge}>LAYER 3: EXPLAINABILITY</div>
              <div className={styles.iprismStepIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h4 className={styles.iprismStepTitle}>Explainable Risk &amp; Playbooks</h4>
              <p className={styles.iprismStepText}>
                Breaks down exact root-cause drivers (financial lag vs physical velocity) and equips officers with actionable administrative intervention steps.
              </p>
            </div>
          </div>

          {/* 3 Core Value Pillars */}
          <div className={styles.iprismPillarsGrid}>
            <div className={styles.iprismPillarCard}>
              <div className={styles.iprismPillarIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.iprismPillarTitle}>Early Warning Horizon</h3>
              <p className={styles.iprismPillarDesc}>
                Flags project trajectory slippages 6 to 12 months ahead of traditional EVM thresholds, giving leadership crucial runway to intervene.
              </p>
            </div>

            <div className={styles.iprismPillarCard}>
              <div className={styles.iprismPillarIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className={styles.iprismPillarTitle}>Transparent Explainability (XAI)</h3>
              <p className={styles.iprismPillarDesc}>
                Eliminates opaque &quot;black box&quot; guessing. Every risk score is unpacked into tangible factors: capex intensity, land hurdles, or contractor delays.
              </p>
            </div>

            <div className={styles.iprismPillarCard}>
              <div className={styles.iprismPillarIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className={styles.iprismPillarTitle}>Targeted Mitigation Playbooks</h3>
              <p className={styles.iprismPillarDesc}>
                Transforms risk alerts into actionable operational checklists: state escalation protocols, milestone re-alignments, and vendor reviews.
              </p>
            </div>
          </div>

          {/* ── High-Impact CTA Strip Linking to /iprism Subpage ────── */}
          <div className={styles.iprismCtaStrip}>
            <div>
              <div className={styles.iprismCtaHeadline}>Explore iPRISM in the Government Portal</div>
              <div className={styles.iprismCtaSub}>
                Inspect real-time project risk dossiers, test what-if scenarios, and review verified scikit-learn LOOCV benchmarks.
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/iprism" className={styles.iprismCtaBtn} id="iprism-launch-portal-btn">
                Launch iPRISM AI Portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Footer ──────────────────────────────────────────── */}
      <footer className={styles.footer} id="resources">
        <div className={styles.footerContent}>
          <div className={styles.footerTop}>
            <div className={styles.govBrand}>
              <svg viewBox="0 0 48 48" fill="currentColor" width="30" height="30" style={{ color: "#d97706" }}>
                <circle cx="24" cy="24" r="21" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
                <circle cx="24" cy="24" r="6" fill="none" stroke="#d97706" strokeWidth="1.5" />
                <path d="M24 6 v6 M24 36 v6 M6 24 h6 M36 24 h6" stroke="#d97706" strokeWidth="1.5" />
              </svg>
              <div className={styles.govText}>
                <span className={styles.govTitle}>Government of India</span>
                <span className={styles.govSubtitle}>Ministry of Statistics &amp; Programme Implementation</span>
              </div>
            </div>

            <ul className={styles.footerLinks}>
              <li><a href="#about" className={styles.footerLinkItem}>About</a></li>
              <li><a href="#developers" className={styles.footerLinkItem}>Developers</a></li>
              <li><a href="#contact" className={styles.footerLinkItem}>Contact</a></li>
              <li><a href="#privacy" className={styles.footerLinkItem}>Privacy Policy</a></li>
              <li><a href="#terms" className={styles.footerLinkItem}>Terms of Use</a></li>
              <li><a href="#accessibility" className={styles.footerLinkItem}>Accessibility</a></li>
            </ul>

            <div className={styles.footerExternalLogos}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 900, color: "#1e3a8a", fontSize: "0.85rem" }}>Digital India</span>
                <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Power To Empower</span>
              </div>
              <div style={{ display: "flex", gap: "10px", fontSize: "0.72rem", color: "#475569" }}>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>india.gov.in</a>
                <span>•</span>
                <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>MyGov</a>
                <span>•</span>
                <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Data.gov.in</a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div>
              &copy; 2025 PRISM &nbsp;|&nbsp; Made for SIH 2026 by Team Techmonsters (Dhanvi, Tarun, Dinesh, Umar, Sathvik, Snigdha).
            </div>
            <div style={{ fontStyle: "italic", fontWeight: 700, color: "#64748b" }}>
              Satyameva Jayate
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
