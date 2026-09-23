/**
 * PRISM — Small representative PAIMANA sample dataset.
 *
 * ⚠️  PROTOTYPE DATA — 8 records selected from a 20-row CSV sample.
 * Covers multiple sectors, cost ranges, progress levels, cost overruns,
 * and both delayed and on-track projects.
 *
 * This file is the ONLY place raw PAIMANA-shaped records live.
 * It is consumed exclusively by the data-provider adapter.
 */

/**
 * Raw shape mirroring the CSV columns exactly.
 * This type is private to the data layer — UI never sees it.
 */
export interface PaimanaRawRecord {
  sector: string;
  implementing_agency: string;
  project_name: string;
  original_cost_cr: number;
  physical_progress_pct: number;
  latest_revised_cost_cr: number;
  latest_revised_completion_date: string; // DD/MM/YYYY as in CSV
}

/**
 * 8 representative records chosen to demonstrate:
 *  - 8 distinct sectors
 *  - Cost range: ₹842 Cr → ₹108,000 Cr
 *  - Progress range: 0% → 94%
 *  - Cost overruns (BharatNet, Rajasthan Refinery, NMDC Pipeline)
 *  - Likely delayed (Rewas Port completion 2023, NBCC completion 2025)
 *  - On-track (Mumbai-Ahmedabad HSR, IIT Palakkad)
 */
export const PAIMANA_SAMPLE: PaimanaRawRecord[] = [
  {
    sector: "Education",
    implementing_agency: "INDIAN INSTITUTE OF TECHNOLOGY PALAKKAD",
    project_name:
      "Phase B of Construction of Permanent Campus of IIT Palakkad",
    original_cost_cr: 1527,
    physical_progress_pct: 0,
    latest_revised_cost_cr: 1527,
    latest_revised_completion_date: "31/10/2028",
  },
  {
    sector: "Waste & Water",
    implementing_agency: "National Mission for Clean Ganga",
    project_name:
      "Interception & Diversion with Rehabilitation of sewerage scheme at Agra under Hybrid annuity based PPP model-Namami Gange Programme",
    original_cost_cr: 842,
    physical_progress_pct: 80,
    latest_revised_cost_cr: 842,
    latest_revised_completion_date: "31/12/2026",
  },
  {
    sector: "Railways",
    implementing_agency: "National High Speed Rail Corporation (NHSRC)",
    project_name: "Mumbai-Ahmedabad High Speed Rail Project- 508 km",
    original_cost_cr: 108000,
    physical_progress_pct: 60,
    latest_revised_cost_cr: 108000,
    latest_revised_completion_date: "31/12/2029",
  },
  {
    sector: "Telecommunication",
    implementing_agency: "Department of Telecommunications (DoT)",
    project_name: "BharatNet",
    original_cost_cr: 61109,
    physical_progress_pct: 82,
    latest_revised_cost_cr: 188000,
    latest_revised_completion_date: "31/03/2027",
  },
  {
    sector: "Energy Storage",
    implementing_agency: "Ministry of Petroleum & Natural Gas",
    project_name: "Rajasthan Refinery Project",
    original_cost_cr: 43129,
    physical_progress_pct: 92,
    latest_revised_cost_cr: 79459,
    latest_revised_completion_date: "30/06/2026",
  },
  {
    sector: "Real Estate",
    implementing_agency:
      "National Buildings Construction Corporation (NBCC)",
    project_name:
      "Redevelopment of Seven General Pool Residential Accommodation (GPRA) Colonies in Delhi",
    original_cost_cr: 32850,
    physical_progress_pct: 47,
    latest_revised_cost_cr: 32841,
    latest_revised_completion_date: "31/12/2025",
  },
  {
    sector: "Shipping",
    implementing_agency: "Reliance Industries Ltd",
    project_name: "Rewas Port Project",
    original_cost_cr: 6000,
    physical_progress_pct: 88,
    latest_revised_cost_cr: 6000,
    latest_revised_completion_date: "31/03/2023",
  },
  {
    sector: "Steel",
    implementing_agency:
      "National Mineral Development Corporation Limited (NMDC)",
    project_name: "NMDC Slurry Pipeline Project Phase-1",
    original_cost_cr: 2907,
    physical_progress_pct: 94,
    latest_revised_cost_cr: 5427,
    latest_revised_completion_date: "31/05/2026",
  },
];
