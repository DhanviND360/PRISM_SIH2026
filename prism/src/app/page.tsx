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
        </div>

        {/* Center Links */}
        <nav>
          <ul className={styles.navLinks}>
            <li><Link href="/" className={`${styles.navLinkItem} ${styles.navLinkActive}`}>Home</Link></li>
            <li><a href="#about" className={styles.navLinkItem}>About</a></li>
            <li><a href="#features" className={styles.navLinkItem}>Features</a></li>
            <li><a href="#impact" className={styles.navLinkItem}>Impact</a></li>
            <li><a href="#resources" className={styles.navLinkItem}>Resources</a></li>
          </ul>
        </nav>

        {/* Access PRISM CTA Button */}
        <div>
          <Link href="/dashboard" className={styles.accessBtn} id="nav-access-prism">
            <span>Access PRISM</span>
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
              <Link href="/dashboard" className={styles.primaryCtaBtn} id="hero-explore-dashboard">
                <span>Explore Dashboard</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/dashboard" className={styles.secondaryCtaBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Watch Demo</span>
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
                  <span>❖</span> PRISM
                </div>
                <div className={styles.mockupNavList}>
                  <div className={`${styles.mockupNavItem} ${styles.mockupNavItemActive}`}>
                    <span>⊞</span> Dashboard
                  </div>
                  <div className={styles.mockupNavItem}>
                    <span>≡</span> Projects
                  </div>
                  <div className={styles.mockupNavItem}>
                    <span>⚠</span> Risk Analysis
                  </div>
                  <div className={styles.mockupNavItem}>
                    <span>📊</span> Benchmarking
                  </div>
                  <div className={styles.mockupNavItem}>
                    <span>📄</span> Reports
                  </div>
                  <div className={styles.mockupNavItem}>
                    <span>🔔</span> Alerts
                  </div>
                </div>
              </div>

              {/* Mini Main Body */}
              <div className={styles.mockupBody}>
                {/* Mini Topbar */}
                <div className={styles.mockupTopbar}>
                  <div className={styles.mockupSearch}>🔍 Search projects...</div>
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
                      <div>⚠ 312 projects may face delay</div>
                      <div>⚠ Cost overrun risk in 18%</div>
                      <div>⚠ Clearances key bottleneck</div>
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
                <span>📅</span>
                <span>Delayed project completion</span>
              </div>
              <div className={styles.challengeCard}>
                <span>📈</span>
                <span>Cost escalations</span>
              </div>
              <div className={styles.challengeCard}>
                <span>🗂️</span>
                <span>Multiple data sources, limited insights</span>
              </div>
              <div className={styles.challengeCard}>
                <span>🚨</span>
                <span>Reactive decision-making</span>
              </div>
            </div>
          </div>

          {/* Center Divider Arrow */}
          <div className={styles.compArrow}>→</div>

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
                <span>⚡</span>
                <span>AI-powered risk prediction</span>
              </div>
              <div className={styles.solutionCard}>
                <span>🔗</span>
                <span>Unified view from PAIMANA data</span>
              </div>
              <div className={styles.solutionCard}>
                <span>📊</span>
                <span>Early warnings &amp; scenario analysis</span>
              </div>
              <div className={styles.solutionCard}>
                <span>🎯</span>
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
            <Link href="/dashboard" className={styles.featuresLink}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px", backgroundColor: "#fef2f2", borderRadius: "2px", color: "#991b1b" }}>
                    <span>🔴</span> High risk: Delhi-Meerut RRTS
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px", backgroundColor: "#fffbeb", borderRadius: "2px", color: "#92400e" }}>
                    <span>🟡</span> Milestone delayed: Bengaluru Metro
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
              <Link href="/dashboard" className={styles.whiteAccessBtn} id="bottom-access-prism">
                <span>Access PRISM</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline", marginLeft: "4px" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/dashboard" className={styles.demoBtn}>
                Request a Demo
              </Link>
            </div>
          </div>

          <div className={styles.bottomRightFeatures}>
            <div className={styles.bottomFeatItem}>
              <div className={styles.bottomFeatIcon}>🛡️</div>
              <div className={styles.bottomFeatText}>Smarter Decisions Today</div>
            </div>

            <div className={styles.bottomDivider} />

            <div className={styles.bottomFeatItem}>
              <div className={styles.bottomFeatIcon}>🏛️</div>
              <div className={styles.bottomFeatText}>A More Developed Tomorrow</div>
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
              &copy; 2025 PRISM. All rights reserved. &nbsp;|&nbsp; Building a Data-Driven, Developed India.
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
