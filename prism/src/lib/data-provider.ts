/**
 * PRISM — Data-access layer.
 *
 * UI components import `getDataProvider()` and call its methods.
 * They never touch raw CSV/JSON structures directly.
 *
 * To switch from sample data → live PAIMANA API:
 *   1. Create a new class implementing `DataProvider`.
 *   2. Change the factory function at the bottom of this file.
 *   3. No UI changes required.
 */

import type { Project, ProjectId, ProjectSummary, Sector } from "@/types/project";
import {
  PAIMANA_SAMPLE,
  type PaimanaRawRecord,
} from "@/data/sample/paimana-sample";

// ── Abstract interface ──────────────────────────────────────────────────

export interface DataProvider {
  /** Return all projects (full records). */
  getAllProjects(): Promise<Project[]>;

  /** Return a single project by id. */
  getProjectById(id: ProjectId): Promise<Project | null>;

  /** Return lightweight summaries for list views. */
  getProjectSummaries(): Promise<ProjectSummary[]>;

  /** Return the distinct set of sectors present in the data. */
  getSectors(): Promise<Sector[]>;

  /** Filter projects by sector. */
  getProjectsBySector(sector: Sector): Promise<Project[]>;
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Convert DD/MM/YYYY → ISO YYYY-MM-DD */
function parseDateDMY(raw: string): string {
  const [d, m, y] = raw.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Deterministic slug from project name (used as id in sample mode). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

/** Map one raw PAIMANA row → normalized Project. */
function normalizeRecord(raw: PaimanaRawRecord): Project {
  const isoDate = parseDateDMY(raw.latest_revised_completion_date);
  const costOverrunRatio =
    raw.original_cost_cr > 0
      ? raw.latest_revised_cost_cr / raw.original_cost_cr
      : 1;
  const isDelayed = new Date(isoDate) < new Date();

  return {
    id: slugify(raw.project_name),
    name: raw.project_name,
    sector: raw.sector,
    implementingAgency: raw.implementing_agency,
    originalCostCr: raw.original_cost_cr,
    revisedCostCr: raw.latest_revised_cost_cr,
    physicalProgressPct: raw.physical_progress_pct,
    revisedCompletionDate: isoDate,
    costOverrunRatio: Math.round(costOverrunRatio * 100) / 100,
    isDelayed,
  };
}

/** Extract a ProjectSummary from a full Project. */
function toSummary(p: Project): ProjectSummary {
  return {
    id: p.id,
    name: p.name,
    sector: p.sector,
    physicalProgressPct: p.physicalProgressPct,
    revisedCostCr: p.revisedCostCr,
    isDelayed: p.isDelayed,
  };
}

// ── Sample-data implementation ──────────────────────────────────────────

class SampleDataProvider implements DataProvider {
  private projects: Project[];

  constructor() {
    this.projects = PAIMANA_SAMPLE.map(normalizeRecord);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projects;
  }

  async getProjectById(id: ProjectId): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  async getProjectSummaries(): Promise<ProjectSummary[]> {
    return this.projects.map(toSummary);
  }

  async getSectors(): Promise<Sector[]> {
    return [...new Set(this.projects.map((p) => p.sector))].sort();
  }

  async getProjectsBySector(sector: Sector): Promise<Project[]> {
    return this.projects.filter((p) => p.sector === sector);
  }
}

// ── Factory (swap this to switch data source) ───────────────────────────

let _instance: DataProvider | null = null;

/**
 * Returns the singleton DataProvider.
 * Currently returns the sample-data adapter.
 * To connect to real PAIMANA, replace the constructor below.
 */
export function getDataProvider(): DataProvider {
  if (!_instance) {
    _instance = new SampleDataProvider();
  }
  return _instance;
}
