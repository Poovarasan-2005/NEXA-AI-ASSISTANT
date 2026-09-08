import { execSync } from "child_process";

interface SuiteResult {
  name: string;
  script: string;
  success: boolean;
  passedCount: number;
  totalCount: number;
  durationMs: number;
  output: string;
}

async function runMasterSuite() {
  console.log("\n======================================================================");
  console.log("   NEXA AI — ULTIMATE MASTER VERIFICATION & RED-TEAM SUITE");
  console.log("   Sovereign Multimodal Personal AI Operating System");
  console.log("======================================================================\n");

  const suites = [
    { name: "Phase 1: AI Governance Core & Constitution", script: "npx tsx scripts/test-governance.ts" },
    { name: "Phase 2: Document, Visual & Diagram Studio", script: "npx tsx scripts/test-phase2.ts" },
    { name: "Phase 3: AI Data Studio & Deep Research", script: "npx tsx scripts/test-phase3.ts" },
    { name: "Phase 4: Projects, Workflows & Omni-Search", script: "npx tsx scripts/test-phase4.ts" },
    { name: "Phase 5: Trust Center & Voice Systems", script: "npx tsx scripts/test-phase5.ts" },
    { name: "Core Security & Anti-IDOR Hardening", script: "npx tsx scripts/test-security.ts" },
    { name: "Multimodal Generation & Diffusion", script: "npx tsx scripts/test-multimodal.ts" },
  ];

  const results: SuiteResult[] = [];
  let grandTotalPassed = 0;
  let grandTotalTests = 0;
  const overallStart = Date.now();

  for (const suite of suites) {
    console.log(`\n>>> EXECUTING SUITE: ${suite.name}...`);
    const start = Date.now();
    try {
      const output = execSync(suite.script, {
        cwd: process.cwd(),
        encoding: "utf-8",
        shell: "cmd.exe",
        stdio: ["pipe", "pipe", "pipe"],
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const durationMs = Date.now() - start;
      const passMatches = output.match(/(?:✓|✅)\s*(?:\[PASS\]|PASSED)/g);
      const summaryMatch =
        output.match(/(\d+)\s*\/\s*(\d+)\s*(?:PASSED|Passed|tests passed)/i) ||
        output.match(/(\d+)\s*\/\s*(\d+)/);
      const passedCount = summaryMatch ? parseInt(summaryMatch[1], 10) : (passMatches ? passMatches.length : 0);
      const totalCount = summaryMatch ? parseInt(summaryMatch[2], 10) : passedCount;

      grandTotalPassed += passedCount;
      grandTotalTests += totalCount;

      results.push({
        name: suite.name,
        script: suite.script,
        success: true,
        passedCount,
        totalCount,
        durationMs,
        output,
      });

      console.log(`>>> SUITE COMPLETED: ${suite.name} -> ${passedCount}/${totalCount} PASSED (${(durationMs / 1000).toFixed(2)}s)`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const stdout = err.stdout || "";
      const stderr = err.stderr || err.message;
      const passMatches = stdout.match(/✓ \[PASS\]/g);
      const passedCount = passMatches ? passMatches.length : 0;

      results.push({
        name: suite.name,
        script: suite.script,
        success: false,
        passedCount,
        totalCount: passedCount + 1,
        durationMs,
        output: `${stdout}\n${stderr}`,
      });

      grandTotalPassed += passedCount;
      grandTotalTests += passedCount + 1;

      console.error(`>>> SUITE FAILED: ${suite.name} (${(durationMs / 1000).toFixed(2)}s)`);
      console.error("FAIL STDOUT:", stdout);
      console.error("FAIL STDERR:", stderr);
    }
  }

  const totalDuration = ((Date.now() - overallStart) / 1000).toFixed(2);

  console.log("\n======================================================================");
  console.log("   NEXA AI — MASTER TEST RUN SUMMARY MATRIX");
  console.log("======================================================================");
  console.log(`Total Execution Time: ${totalDuration}s\n`);

  for (const res of results) {
    const statusPill = res.success ? "✓ PASSED" : "✗ FAILED";
    console.log(`  ${statusPill.padEnd(10)} | ${res.name.padEnd(46)} | ${res.passedCount}/${res.totalCount} checks | ${(res.durationMs / 1000).toFixed(2)}s`);
  }

  console.log("----------------------------------------------------------------------");
  console.log(`  GRAND TOTAL: ${grandTotalPassed} / ${grandTotalTests} CHECKS PASSED (${((grandTotalPassed / grandTotalTests) * 100).toFixed(1)}%)`);
  console.log("======================================================================\n");

  const allSuccess = results.every((r) => r.success);
  if (allSuccess) {
    console.log("  >>> ALL 5 MILESTONE PHASES & SECURITY SUITES FULLY VERIFIED! <<<");
    console.log("  NEXA OS IS FULLY HARDENED, GOVERNED & READY FOR PRODUCTION.\n");
    process.exit(0);
  } else {
    console.error("  >>> ONE OR MORE TEST SUITES REPORTED FAILURES. <<<\n");
    process.exit(1);
  }
}

runMasterSuite().catch((e) => {
  console.error("Master verification crashed:", e);
  process.exit(1);
});
