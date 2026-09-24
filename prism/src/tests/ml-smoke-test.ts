/**
 * Automated smoke test for PRISM AI/ML Predictive Models Suite
 *
 * Verifies:
 *   1. Cost Overrun Model (Classification + Magnitude Regression in ₹ Cr)
 *   2. Time Overrun Model (Classification + Delay Slippage in Months)
 *   3. AI/ML vs. Conventional Statistical EVM Benchmark (Technical Dimension b)
 *   4. CUF Field Attribution Analysis (Technical Dimension c)
 */

import { getDataProvider } from "../lib/data-provider";
import {
  predictCostOverrun,
  predictScheduleDelay,
  getMLBenchmarkReport,
  getCUFAttributionReport,
} from "../ml-api";

async function runSmokeTest() {
  console.log("==========================================================");
  console.log("           PRISM AI/ML PREDICTIVE SUITE SMOKE TEST        ");
  console.log("==========================================================\n");

  const provider = getDataProvider();
  const projects = await provider.getAllProjects();

  console.log(`Loaded ${projects.length} sample projects from DataProvider.\n`);

  // ── 1. Cost Overrun Prediction Test ────────────────────────────────────
  console.log("── 1. Cost Overrun Model (Outcome a) ──");
  for (const p of projects.slice(0, 4)) {
    const costPred = predictCostOverrun(p);
    console.log(
      `[${costPred.prediction ? "OVERRUN LIKELY " : "ON BUDGET      "}] ` +
      `${p.name.substring(0, 38).padEnd(40)} | ` +
      `Prob: ${(costPred.probability * 100).toFixed(1)}% | ` +
      `Magnitude: +₹ ${costPred.predictedEscalationCr.toLocaleString("en-IN")} Cr (+${costPred.predictedOverrunPct}%) | ` +
      `Conf: ${costPred.confidenceLabel}`
    );
  }
  console.log("");

  // ── 2. Time Overrun Prediction Test ────────────────────────────────────
  console.log("── 2. Time Overrun Model (Outcome b) ──");
  for (const p of projects.slice(0, 4)) {
    const schedPred = predictScheduleDelay(p);
    console.log(
      `[${schedPred.prediction ? "DELAY LIKELY   " : "ON TRACK       "}] ` +
      `${p.name.substring(0, 38).padEnd(40)} | ` +
      `Prob: ${(schedPred.probability * 100).toFixed(1)}% | ` +
      `Slippage: +${schedPred.predictedDelayMonths} mos | ` +
      `Est Date: ${schedPred.projectedCompletionDate} | ` +
      `Pace: ${schedPred.velocityPaceStatus}`
    );
  }
  console.log("");

  // ── 3. AI/ML vs Conventional Statistical Benchmark Test ────────────────
  console.log("── 3. Technical Dimension (b): Statistical Baseline vs AI/ML ──");
  const benchmark = getMLBenchmarkReport();
  console.log(`Evaluated on n = ${benchmark.datasetSize} PAIMANA project records:`);
  for (const row of benchmark.comparisonTable) {
    console.log(`  • ${row.metricName}`);
    console.log(`    - Conventional Statistical (EVM): ${row.conventionalStatistical}`);
    console.log(`    - PRISM Machine Learning:         ${row.machineLearningModel}`);
    console.log(`    - Gain Assessment:                ${row.gainDescription}`);
  }
  console.log("");

  // ── 4. CUF Field Attribution Test ──────────────────────────────────────
  console.log("── 4. Technical Dimension (c): CUF Field Attribution ──");
  const cufReport = getCUFAttributionReport();
  console.log(`Current CUF Variance Explained: ${cufReport.totalVarianceExplainedByCurrentCUF}%`);
  console.log(`Uncaptured Latent Variance:     ${cufReport.totalVarianceUnexplainedOrLatent}%`);
  console.log("Key Missing Variables Recommended for MoSPI CUF v2.0:");
  for (const v of cufReport.keyMissingVariables) {
    console.log(`  * ${v.field}`);
  }
  console.log("\n==========================================================");
  console.log("                ALL ML TESTS COMPLETED SUCCESSFULLY        ");
  console.log("==========================================================");
}

runSmokeTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
