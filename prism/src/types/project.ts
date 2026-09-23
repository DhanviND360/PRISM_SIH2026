/**
 * PRISM — Normalized Project Schema
 *
 * Every field maps to an actual column in the PAIMANA/OCMS dataset.
 * This is the ONLY type that UI components and analytics modules consume.
 * When PRISM later connects to a live PAIMANA API, only the data-provider
 * adapter needs to change — this type stays stable.
 */

/** Unique project identifier (derived from dataset row or API id). */
export type ProjectId = string;

/** Sector / ministry vertical the project belongs to. */
export type Sector = string;

/**
 * Core normalized project record.
 *
 * All monetary values are in ₹ Crore (as reported in PAIMANA).
 * Dates are ISO-8601 strings (YYYY-MM-DD).
 */
export interface Project {
  /** Stable identifier — slugified project name for the sample dataset. */
  id: ProjectId;

  /** Human-readable project name (verbatim from PAIMANA). */
  name: string;

  /** Sector / vertical (e.g. "Railways", "Education"). */
  sector: Sector;

  /** Implementing agency name. */
  implementingAgency: string;

  /** Original sanctioned cost in ₹ Crore. */
  originalCostCr: number;

  /** Latest revised cost in ₹ Crore (may equal originalCostCr). */
  revisedCostCr: number;

  /** Physical progress percentage (0–100). */
  physicalProgressPct: number;

  /** Latest revised completion date (ISO-8601 YYYY-MM-DD). */
  revisedCompletionDate: string;

  // ── Derived / computed risk-related fields ────────────────────────────

  /** Cost overrun ratio: revisedCostCr / originalCostCr. ≥1 means overrun. */
  costOverrunRatio: number;

  /** Whether the revised completion date has already passed. */
  isDelayed: boolean;
}

/**
 * Lightweight project summary used in list views / search results.
 */
export type ProjectSummary = Pick<
  Project,
  | "id"
  | "name"
  | "sector"
  | "physicalProgressPct"
  | "revisedCostCr"
  | "isDelayed"
>;
