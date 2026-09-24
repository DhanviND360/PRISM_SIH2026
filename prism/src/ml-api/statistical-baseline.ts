/**
 * PRISM ML — Conventional Statistical Baselines
 *
 * Implements traditional statistical and project management monitoring models
 * to serve as the baseline comparison for AI/ML techniques (Technical Dimension b).
 *
 * Methodologies included:
 *  1. Earned Value Management (EVM): Cost Performance Index (CPI), Schedule
 *     Performance Index (SPI), and Estimate at Completion (EAC).
 *  2. Historical Sector Moving Averages: Sector baseline probability and variance.
 *  3. Ordinary Least Squares (OLS) Trend: Simple linear regression extrapolation.
 */

export interface EVMMetrics {
  /** Planned Value (PV) in ₹ Cr based on elapsed timeline */
  plannedValueCr: number;
  /** Earned Value (EV) in ₹ Cr based on actual physical progress */
  earnedValueCr: number;
  /** Actual Cost (AC) proxy in ₹ Cr (current revised expenditure) */
  actualCostCr: number;
  /** Cost Performance Index: CPI = EV / AC (< 1 indicates overrun) */
  cpi: number;
  /** Schedule Performance Index: SPI = EV / PV (< 1 indicates slippage) */
  spi: number;
  /** Statistical Estimate at Completion: EAC = Original / CPI */
  eacCr: number;
  /** Statistical projected cost overrun in ₹ Cr */
  projectedCostOverrunCr: number;
  /** Statistical projected schedule slippage in months */
  projectedScheduleDelayMonths: number;
  /** Binary classification by statistical threshold */
  statisticalCostOverrunFlag: boolean;
  statisticalScheduleDelayFlag: boolean;
}

export interface StatisticalSectorBaseline {
  sector: string;
  historicalOverrunProbability: number;
  historicalDelayProbability: number;
  avgOverrunMagnitudePct: number;
}

/**
 * Compute Earned Value Management (EVM) metrics for a single project record.
 * Assumes a 36-month typical sanction-to-target cycle if start date is not explicitly available.
 */
export function computeEVMMetrics(params: {
  originalCostCr: number;
  revisedCostCr: number;
  physicalProgressPct: number;
  revisedCompletionDate: string;
  referenceDate?: Date;
}): EVMMetrics {
  const now = params.referenceDate ?? new Date();
  const targetDate = new Date(params.revisedCompletionDate);
  const diffMs = targetDate.getTime() - now.getTime();
  const monthsToTarget = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  // Approximate typical infrastructure lifecycle (36 months baseline)
  const assumedTotalCycleMonths = 36;
  const elapsedMonths = Math.max(1, assumedTotalCycleMonths - Math.max(0, monthsToTarget));
  const plannedProgressPct = Math.min(100, Math.max(5, (elapsedMonths / assumedTotalCycleMonths) * 100));

  const plannedValueCr = (plannedProgressPct / 100) * params.originalCostCr;
  const earnedValueCr = (params.physicalProgressPct / 100) * params.originalCostCr;
  const actualCostCr = params.revisedCostCr;

  // CPI = EV / AC
  const cpi = actualCostCr > 0 ? Math.min(2.0, Math.max(0.1, earnedValueCr / actualCostCr)) : 1.0;

  // SPI = EV / PV
  const spi = plannedValueCr > 0 ? Math.min(2.0, Math.max(0.1, earnedValueCr / plannedValueCr)) : 1.0;

  // EAC = BAC / CPI
  const eacCr = Math.round((params.originalCostCr / cpi) * 10) / 10;
  const projectedCostOverrunCr = Math.max(0, Math.round((eacCr - params.originalCostCr) * 10) / 10);

  // Projected delay in months based on schedule efficiency index
  let projectedScheduleDelayMonths = 0;
  if (spi < 0.95) {
    // If running slower than plan, forecast extension needed
    const remainingWorkPct = Math.max(0, 100 - params.physicalProgressPct);
    const monthlyVelocity = Math.max(0.2, params.physicalProgressPct / elapsedMonths);
    const monthsNeededAtCurrentPace = remainingWorkPct / monthlyVelocity;
    projectedScheduleDelayMonths = Math.max(0, Math.round(monthsNeededAtCurrentPace - Math.max(0, monthsToTarget)));
  } else if (monthsToTarget < 0 && params.physicalProgressPct < 100) {
    projectedScheduleDelayMonths = Math.round(Math.abs(monthsToTarget));
  }

  const statisticalCostOverrunFlag = cpi < 0.92 || projectedCostOverrunCr > 0;
  const statisticalScheduleDelayFlag = spi < 0.90 || projectedScheduleDelayMonths > 0;

  return {
    plannedValueCr: Math.round(plannedValueCr * 10) / 10,
    earnedValueCr: Math.round(earnedValueCr * 10) / 10,
    actualCostCr,
    cpi: Math.round(cpi * 1000) / 1000,
    spi: Math.round(spi * 1000) / 1000,
    eacCr,
    projectedCostOverrunCr,
    projectedScheduleDelayMonths,
    statisticalCostOverrunFlag,
    statisticalScheduleDelayFlag,
  };
}

/**
 * Fit a simple Ordinary Least Squares (OLS) univariate or bivariate linear model.
 */
export function fitLinearRegression(
  X: number[][],
  y: number[]
): { weights: number[]; bias: number; predict: (x: number[]) => number } {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  if (n === 0 || d === 0) {
    return { weights: new Array(d).fill(0), bias: 0, predict: () => 0 };
  }

  // Gradient descent for OLS
  const weights = new Array(d).fill(0);
  let bias = 0;
  const lr = 0.01;
  const epochs = 500;

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < n; i++) {
      let pred = bias;
      for (let j = 0; j < d; j++) {
        pred += weights[j] * X[i][j];
      }
      const err = pred - y[i];
      for (let j = 0; j < d; j++) {
        weights[j] -= (lr * err * X[i][j]) / n;
      }
      bias -= (lr * err) / n;
    }
  }

  return {
    weights,
    bias,
    predict: (x: number[]) => {
      let val = bias;
      for (let j = 0; j < d; j++) {
        val += weights[j] * (x[j] ?? 0);
      }
      return val;
    },
  };
}
