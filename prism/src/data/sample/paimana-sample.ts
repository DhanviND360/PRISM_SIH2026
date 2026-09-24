/**
 * PRISM — PAIMANA Dataset Repository
 *
 * Contains the official PAIMANA project records from the Ministry of Statistics
 * & Programme Implementation (MoSPI) monitoring framework.
 *
 * Converted from paimana_real_sample.csv.
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

export const PAIMANA_SAMPLE: PaimanaRawRecord[] = [
  {
    sector: "Education",
    implementing_agency: "INDIAN INSTITUTE OF TECHNOLOGY PALAKKAD",
    project_name: "Phase B of Construction of Permanent Campus of IIT Palakkad",
    original_cost_cr: 1527,
    physical_progress_pct: 0,
    latest_revised_cost_cr: 1527,
    latest_revised_completion_date: "31/10/2028",
  },
  {
    sector: "Waste & Water",
    implementing_agency: "National Mission for Clean Ganga",
    project_name: "Interception & Diversion with Rehabilitation of sewerage scheme at Agra under Hybrid annuity based PPP model-Namami Gange Programme",
    original_cost_cr: 842,
    physical_progress_pct: 80,
    latest_revised_cost_cr: 842,
    latest_revised_completion_date: "31/12/2026",
  },
  {
    sector: "Logistics Infrastructure",
    implementing_agency: "NHIDCL",
    project_name: "Integrated Multi Modal Logistics Hub at Nangal Chaudhary in Haryana - Other Trunk Infrastructure Development Phase 1",
    original_cost_cr: 763,
    physical_progress_pct: 60,
    latest_revised_cost_cr: 763,
    latest_revised_completion_date: "15/05/2028",
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
    sector: "Urban Public Transport",
    implementing_agency: "Chennai Metro Rail Limited (CMRL)",
    project_name: "Chennai Metro Rail Phase-II Development Project",
    original_cost_cr: 63246,
    physical_progress_pct: 53,
    latest_revised_cost_cr: 63246,
    latest_revised_completion_date: "31/08/2029",
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
    sector: "Oil & Gas",
    implementing_agency: "Ministry of Petroleum & Natural Gas",
    project_name: "Ethylene Cracker Project at Bina Refinery including downstream Petrochemical Plants and expansion of Refinery",
    original_cost_cr: 43367,
    physical_progress_pct: 26,
    latest_revised_cost_cr: 43367,
    latest_revised_completion_date: "31/05/2028",
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
    implementing_agency: "National Buildings Construction Corporation (NBCC)",
    project_name: "Redevelopment of Seven General Pool Residential Accommodation (GPRA) Colonies in Delhi",
    original_cost_cr: 32850,
    physical_progress_pct: 47,
    latest_revised_cost_cr: 32841,
    latest_revised_completion_date: "31/12/2025",
  },
  {
    sector: "Electricity Generation",
    implementing_agency: "National Hydroelectric Power Corporation Limited (NHPC)",
    project_name: "Dibang Multipurpose Project",
    original_cost_cr: 31876,
    physical_progress_pct: 17,
    latest_revised_cost_cr: 31876,
    latest_revised_completion_date: "26/02/2032",
  },
  {
    sector: "Coal",
    implementing_agency: "Northern Coalfields Limited (NCL)",
    project_name: "JAYANT EXPN. [20 TO 38 MTPA]",
    original_cost_cr: 25560,
    physical_progress_pct: 1,
    latest_revised_cost_cr: 25560,
    latest_revised_completion_date: "31/03/2032",
  },
  {
    sector: "Transmission & Distribution",
    implementing_agency: "Adani Transmission Limited",
    project_name: "RAJASTHAN PART I POWER TRANSMISSION LIMITED",
    original_cost_cr: 25000,
    physical_progress_pct: 2,
    latest_revised_cost_cr: 25000,
    latest_revised_completion_date: "20/07/2029",
  },
  {
    sector: "Water Resources",
    implementing_agency: "Department of Water Resources River Development & Ganga Rejuvenation",
    project_name: "Ken-Betwa Linking Development Project",
    original_cost_cr: 21030,
    physical_progress_pct: 0,
    latest_revised_cost_cr: 21030,
    latest_revised_completion_date: "31/03/2029",
  },
  {
    sector: "Roads & Highways",
    implementing_agency: "NHIDCL",
    project_name: "Construction of Connecting Road from Z-Morh Tunnel to Zojila Tunnel and Zojila Tunnel across Zojila Pass",
    original_cost_cr: 6809,
    physical_progress_pct: 66,
    latest_revised_cost_cr: 6809,
    latest_revised_completion_date: "28/02/2028",
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
    sector: "Inland Waterways",
    implementing_agency: "Inland Waterways Authority of India (IWAI)",
    project_name: "Jal Marg Vikas Project",
    original_cost_cr: 5369,
    physical_progress_pct: 81,
    latest_revised_cost_cr: 5061,
    latest_revised_completion_date: "31/12/2025",
  },
  {
    sector: "Healthcare",
    implementing_agency: "PMSSY and Institute of National Importance",
    project_name: "Redevelopment of Residential colonies at Ayur Vigyan Nagar and West Ansari Nagar campuses of AIIMS New Delhi",
    original_cost_cr: 4441,
    physical_progress_pct: 61,
    latest_revised_cost_cr: 4441,
    latest_revised_completion_date: "02/06/2027",
  },
  {
    sector: "Metals & Mining",
    implementing_agency: "National Aluminium Company Limited (NALCO)",
    project_name: "Expansion of Alumina Refinery Plant with addition of 5th Stream",
    original_cost_cr: 4103,
    physical_progress_pct: 94,
    latest_revised_cost_cr: 5677,
    latest_revised_completion_date: "30/06/2026",
  },
  {
    sector: "Steel",
    implementing_agency: "National Mineral Development Corporation Limited (NMDC)",
    project_name: "NMDC Slurry Pipeline Project Phase-1",
    original_cost_cr: 2907,
    physical_progress_pct: 94,
    latest_revised_cost_cr: 5427,
    latest_revised_completion_date: "31/05/2026",
  },
  {
    sector: "Aviation & Aviation Infrastructure",
    implementing_agency: "Airport Authority of India (AAI)",
    project_name: "Development of Lal Bahadur Shastri International Airport Varanasi including New Terminal Building and allied works",
    original_cost_cr: 2870,
    physical_progress_pct: 27,
    latest_revised_cost_cr: 2870,
    latest_revised_completion_date: "20/07/2027",
  },
];
