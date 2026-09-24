import Link from "next/link";
import { getDataProvider } from "@/lib/data-provider";
import {
  computePortfolioAnalytics,
  formatCr,
  getProjectRiskLevel,
} from "@/analytics/portfolio-stats";
import { RiskBadge } from "@/components";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const provider = getDataProvider();
  const projects = await provider.getAllProjects();
  const analytics = computePortfolioAnalytics(projects);

  const highRiskCount = analytics.highRiskCount;
  const mediumRiskCount = projects.filter(
    (p) => getProjectRiskLevel(p) === "MEDIUM"
  ).length;
  const lowRiskCount = projects.filter(
    (p) => getProjectRiskLevel(p) === "LOW"
  ).length;

  const maxSectorCost = Math.max(
    ...analytics.sectors.map((s) => s.totalRevisedCostCr),
    1
  );

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────────── */}
      <section className={styles.headerRow}>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greetingTitle}>Good morning,</h1>
          <p className={styles.greetingSubtitle}>
            Here&apos;s the latest status of India&apos;s central development projects.
          </p>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.metaText}>
            As per PAIMANA data &nbsp;|&nbsp; Last updated: 22 Sep 2026, 10:30 AM
          </span>
          <div className={styles.scopeSelect}>
            <span>All India</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── 5 Primary KPI Cards ─────────────────────────────────────── */}
      <section className={styles.kpiGrid}>
        {/* KPI 1: Total Projects */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.kpiIconWrap} ${styles.iconBlue}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiNumber}>{analytics.totalProjects}</div>
          <div className={styles.kpiTitle}>Total Projects</div>
          <div className={styles.kpiSubtext}>
            <span className={styles.trendNeutral}>Central Infrastructure Portfolio</span>
          </div>
        </div>

        {/* KPI 2: High-Risk Projects */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.kpiIconWrap} ${styles.iconRed}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiNumber}>{analytics.highRiskCount}</div>
          <div className={styles.kpiTitle}>High-Risk Projects</div>
          <div className={styles.kpiSubtext}>
            <span className={styles.trendUpRed}>
              ↑ {analytics.highRiskPercentage}% of sample
            </span>
          </div>
        </div>

        {/* KPI 3: Sectors */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.kpiIconWrap} ${styles.iconPurple}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiNumber}>{analytics.totalSectorsCount}</div>
          <div className={styles.kpiTitle}>Sectors</div>
          <div className={styles.kpiSubtext}>
            <span className={styles.trendNeutral}>Central ministries &amp; agencies</span>
          </div>
        </div>

        {/* KPI 4: Potential Cost-Risk Exposure */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.kpiIconWrap} ${styles.iconGreen}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiNumber}>
            {formatCr(analytics.potentialCostRiskExposureCr)}
          </div>
          <div className={styles.kpiTitle}>Potential Cost-Risk Exposure</div>
          <div className={styles.kpiSubtext}>
            <span className={styles.trendUpRed}>Reported budget escalation</span>
          </div>
        </div>

        {/* KPI 5: Potential Schedule-Risk Exposure */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <div className={`${styles.kpiIconWrap} ${styles.iconAmber}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiNumber}>
            {formatCr(analytics.potentialScheduleRiskExposureCr)}
          </div>
          <div className={styles.kpiTitle}>Potential Schedule-Risk Exposure</div>
          <div className={styles.kpiSubtext}>
            <span className={styles.trendUpRed}>
              {analytics.delayedCount} delayed project{analytics.delayedCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Middle Grid (3 Columns) ─────────────────────────────────── */}
      <section className={styles.middleGrid}>
        {/* Card 1: Project Risk Distribution */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Project Risk Distribution</h2>
            <Link href="/projects" className={styles.cardActionLink}>
              All Projects →
            </Link>
          </div>

          <div className={styles.riskOverviewContent}>
            <div>
              <div
                className={styles.riskBarComposite}
                title={`High: ${highRiskCount}, Medium: ${mediumRiskCount}, Low: ${lowRiskCount}`}
              >
                <div
                  className={styles.riskSegmentHigh}
                  style={{ width: `${(highRiskCount / analytics.totalProjects) * 100}%` }}
                />
                <div
                  className={styles.riskSegmentMedium}
                  style={{ width: `${(mediumRiskCount / analytics.totalProjects) * 100}%` }}
                />
                <div
                  className={styles.riskSegmentLow}
                  style={{ width: `${(lowRiskCount / analytics.totalProjects) * 100}%` }}
                />
              </div>

              <div className={styles.riskLegendGrid} style={{ marginTop: "16px" }}>
                <div className={styles.riskLegendItem}>
                  <div className={styles.legendDotLabel}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                    High Risk
                  </div>
                  <div className={styles.legendCount}>{highRiskCount}</div>
                </div>

                <div className={styles.riskLegendItem}>
                  <div className={styles.legendDotLabel}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    Medium Risk
                  </div>
                  <div className={styles.legendCount}>{mediumRiskCount}</div>
                </div>

                <div className={styles.riskLegendItem}>
                  <div className={styles.legendDotLabel}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    Low Risk
                  </div>
                  <div className={styles.legendCount}>{lowRiskCount}</div>
                </div>
              </div>
            </div>

            <div className={styles.distributionNotice}>
              <strong>PRISM Surveillance Policy:</strong> High risk is flagged when cost escalation exceeds 20% or when the target completion date has passed with incomplete physical milestones.
            </div>
          </div>
        </div>

        {/* Card 2: Projects by Sector (Clickable -> Sector Page) */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Projects by Sector</h2>
            <Link href="/sectors" className={styles.cardActionLink}>
              View All Sectors →
            </Link>
          </div>

          <div className={styles.sectorList}>
            {analytics.sectors.map((s) => {
              const widthPct = Math.max(12, Math.round((s.totalRevisedCostCr / maxSectorCost) * 100));
              const isHigh = s.dominantRisk === "HIGH";

              return (
                <Link
                  key={s.sector}
                  href={`/sectors/${encodeURIComponent(s.sector)}`}
                  className={styles.sectorRow}
                  title={`View ${s.sector} projects`}
                >
                  <div className={styles.sectorRowTop}>
                    <span className={styles.sectorName}>
                      {s.sector} ({s.projectCount})
                    </span>
                    <span className={styles.sectorCost}>
                      {formatCr(s.totalRevisedCostCr)}
                    </span>
                  </div>
                  <div className={styles.sectorBarTrack}>
                    <div
                      className={`${styles.sectorBarFill} ${isHigh ? styles.sectorBarHighRisk : ""}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Card 3: Recent Risk Changes (Clickable -> Project Detail) */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Risk Changes</h2>
            <Link href="/projects" className={styles.cardActionLink}>
              View all
            </Link>
          </div>

          <div className={styles.riskChangesList}>
            {analytics.recentRiskChanges.map((change) => {
              const isHigh = change.riskLevel === "HIGH";

              return (
                <Link
                  key={change.id}
                  href={`/projects/${change.id}`}
                  className={styles.changeItem}
                >
                  <div
                    className={`${styles.changeIconBox} ${
                      isHigh ? styles.changeIconHigh : styles.changeIconOnTrack
                    }`}
                  >
                    {isHigh ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.changeContent}>
                    <div className={styles.changeTitleRow}>
                      <span className={styles.changeProjectName}>
                        {change.projectName}
                      </span>
                      <span className={styles.changeTime}>
                        {change.timestampLabel}
                      </span>
                    </div>
                    <div className={styles.changeDesc}>{change.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom Section: Key Insights & Viksit Bharat Banner ──────── */}
      <section className={styles.bottomGrid}>
        <div className={styles.insightsCard}>
          <h2 className={styles.cardTitle}>Key Surveillance Insights</h2>
          <div className={styles.insightsGrid}>
            <div className={styles.insightPill}>
              <div className={styles.insightIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Cost Escalation Concentration:</strong> Telecommunications &amp; Energy Storage represent &gt;95% of total cost overrun exposure.
              </div>
            </div>

            <div className={styles.insightPill}>
              <div className={styles.insightIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Schedule Slippage:</strong> Rewas Port target date (31/03/2023) lapsed with ₹6,000 Cr capital tied up at 88% completion.
              </div>
            </div>

            <div className={styles.insightPill}>
              <div className={styles.insightIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Capital Mobilization:</strong> High Speed Rail (₹1,08,000 Cr) maintains original sanctioned budget at 60% progress.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.viksitBanner}>
          <div className={styles.viksitContent}>
            <span className={styles.viksitTitle}>Viksit Bharat</span>
            <span className={styles.viksitSub}>Through Transparent Data</span>
          </div>
          <Link href="/projects" className={styles.viksitBtn} title="Explore Projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
