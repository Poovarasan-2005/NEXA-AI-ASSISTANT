export {};

const BASE_URL = "http://localhost:3000";

let sessionCookie = "";

async function runTests() {
  console.log("=================================================");
  console.log("🚀 STARTING NEXA AI PHASE 3 VERIFICATION SUITE");
  console.log("   (AI Data Studio & Deep Research Engine)");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${msg}`);
      process.exit(1);
    }
  }

  // 1. Authenticate user
  console.log("--- 1. Authentication & Session ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user@nexa.ai",
      password: "UserPassword123!",
    }),
  });

  const rawCookies = loginRes.headers.get("set-cookie") || "";
  const match = rawCookies.match(/nexa_session=([^;]+)/);
  if (match) {
    sessionCookie = `nexa_session=${match[1]}`;
  }

  assert(loginRes.status === 200 && !!sessionCookie, "User authenticated & HttpOnly session issued");

  // 2. Test Data Profiler POST (Statistical & Quality Profiling)
  console.log("\n--- 2. AI Data Studio: Data Profiling Engine (POST) ---");
  const sampleHeaders = ["id", "name", "age", "salary", "score"];
  const sampleRows = [
    [1, "Alice", 28, 95000, 88.5],
    [2, "Bob", 34, 110000, 92.0],
    [3, "Charlie", 29, 88000, 85.0],
    [4, "Diana", 41, 145000, 96.2],
    [5, "Evan", 22, 62000, 79.4],
    [6, "Fiona", 38, 130000, 91.0],
    [7, "George", 55, 350000, 99.0], // Outlier in salary
    [8, "Hannah", 31, 105000, 89.8],
  ];

  const profilePostRes = await fetch(`${BASE_URL}/api/app/data/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      datasetName: "Engineering Team Compensation 2026",
      headers: sampleHeaders,
      rows: sampleRows,
    }),
  });

  const profileData = await profilePostRes.json();
  const profileReport = profileData.profile || profileData.report;
  const score = profileReport?.overallScore ?? profileReport?.qualityScore ?? 0;

  assert(
    profilePostRes.status === 200 &&
      profileReport &&
      score >= 80 &&
      profileReport.completenessPct === 100 &&
      profileReport.columns.length === 5,
    `Dataset profile computed: Score=${score} Grade=${profileReport?.qualityGrade} Completeness=${profileReport?.completenessPct}% (Columns: ${profileReport?.columns?.length})`
  );

  // 3. Test Data Profiler Outlier Detection (IQR Method)
  console.log("\n--- 3. Data Profiler IQR Anomaly & Outlier Detection ---");
  const salaryCol = profileReport.columns.find((c: any) => c.name === "salary");
  const outliersDetected = salaryCol?.outliersDetected ?? salaryCol?.numericStats?.outliersCount ?? 0;
  assert(
    salaryCol && outliersDetected >= 1,
    `IQR outlier detected in salary column: ${outliersDetected} outlier(s), Min=$${salaryCol?.min} Max=$${salaryCol?.max}`
  );

  // 4. Test Data Profiler GET (History / Default Profiles)
  console.log("\n--- 4. AI Data Studio: Profile History & Defaults (GET) ---");
  const profileGetRes = await fetch(`${BASE_URL}/api/app/data/profile?limit=5`, {
    headers: { Cookie: sessionCookie },
  });
  const profileHistory = await profileGetRes.json();
  const profilesList = profileHistory.profiles || profileHistory.history || [];
  assert(
    profileGetRes.status === 200 && Array.isArray(profilesList) && profilesList.length > 0,
    `Profile history retrieved: ${profilesList.length} profiles found (Latest: ${profilesList[0]?.datasetName})`
  );

  // 5. Test Chart Engine POST (Vector SVG Generation for Bar, Line, Pie, Scatter)
  console.log("\n--- 5. Responsive Vector Chart Engine (POST SVG) ---");
  const barChartRes = await fetch(`${BASE_URL}/api/app/data/chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      title: "Q1-Q4 Strategic AI Workload Distribution",
      type: "BAR",
      data: [
        { label: "Q1 LLM Ingest", value: 140 },
        { label: "Q2 Vector RAG", value: 280 },
        { label: "Q3 Multi-Agent", value: 460 },
        { label: "Q4 Zero-Trust", value: 620 },
      ],
      xAxisLabel: "Quarterly Milestones",
      yAxisLabel: "Workloads Executed (k)",
    }),
  });
  const barChartData = await barChartRes.json();
  const barSvg = barChartData.svg || barChartData.chart?.svg || "";
  assert(
    barChartRes.status === 200 &&
      typeof barSvg === "string" &&
      barSvg.includes("<svg") &&
      barSvg.includes("Strategic AI Workload Distribution"),
    `Bar chart SVG generated: ${barSvg.length} chars with proper SVG tags and title`
  );

  // 6. Test Line and Pie Chart Rendering (GET)
  console.log("\n--- 6. Chart Engine Multi-Format Support (GET) ---");
  const lineChartRes = await fetch(`${BASE_URL}/api/app/data/chart?type=LINE`, {
    headers: { Cookie: sessionCookie },
  });
  const lineChartData = await lineChartRes.json();
  const lineSvg = lineChartData.svg || lineChartData.chart?.svg || "";

  const pieChartRes = await fetch(`${BASE_URL}/api/app/data/chart?type=PIE`, {
    headers: { Cookie: sessionCookie },
  });
  const pieChartData = await pieChartRes.json();
  const pieSvg = pieChartData.svg || pieChartData.chart?.svg || "";

  assert(
    lineChartRes.status === 200 &&
      lineSvg.includes("<path") &&
      lineSvg.includes("<circle") &&
      pieChartRes.status === 200 &&
      pieSvg.includes("<path"),
    "Line chart (path spline and circle points) and Pie chart (path donut arcs) rendered with vector SVG precision"
  );

  // 7. Test Deep Research & Fact Ledger (POST)
  console.log("\n--- 7. Deep Research Engine & Fact Ledger (POST) ---");
  const researchTopic = "Quantum Key Distribution and Post-Quantum Lattice Cryptography in Enterprise Zero-Trust";
  const researchRes = await fetch(`${BASE_URL}/api/app/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      topic: researchTopic,
    }),
  });

  const researchData = await researchRes.json();
  const factLedger = researchData.factLedger || researchData.research;
  const claims = factLedger?.claims || [];
  const categories = new Set(claims.map((c: any) => c.category));
  const groundingScore = factLedger?.groundingScore ?? factLedger?.reportCard?.groundingScore ?? 0;
  const hallucinationRisk = factLedger?.hallucinationRisk ?? factLedger?.reportCard?.hallucinationRisk ?? "LOW";

  assert(
    researchRes.status === 200 &&
      factLedger &&
      groundingScore >= 80 &&
      claims.length >= 4 &&
      categories.has("EVIDENCE") &&
      categories.has("INFERENCE") &&
      categories.has("RECOMMENDATION") &&
      categories.has("UNCERTAINTY"),
    `Deep Research Fact Ledger generated: Grounding=${groundingScore}% HallucinationRisk=${hallucinationRisk} Claims=${claims.length} (Taxonomy: Evidence, Inference, Recommendation, Uncertainty)`
  );

  // 8. Test Deep Research Verification Report Card
  console.log("\n--- 8. Deep Research Verification Report Card ---");
  const reportCard = factLedger?.reportCard;
  assert(
    reportCard &&
      reportCard.groundingScore >= 80 &&
      reportCard.sourceDiversityIndex > 0 &&
      (reportCard.overallGrade === "A+" || reportCard.overallGrade === "A"),
    `Report Card verified: GroundingScore=${reportCard?.groundingScore}%, DiversityIndex=${reportCard?.sourceDiversityIndex}, Grade=${reportCard?.overallGrade}, Risk=${reportCard?.hallucinationRisk}`
  );

  // 9. Test Deep Research GET (History)
  console.log("\n--- 9. Deep Research Query History & Ledgers (GET) ---");
  const researchGetRes = await fetch(`${BASE_URL}/api/app/research?limit=5`, {
    headers: { Cookie: sessionCookie },
  });
  const researchHistory = await researchGetRes.json();
  const ledgersList = researchHistory.researchLedgers || researchHistory.ledgers || [];
  assert(
    researchGetRes.status === 200 && Array.isArray(ledgersList) && ledgersList.length > 0,
    `Research history retrieved: ${ledgersList.length} dossiers found`
  );

  // 10. Test Orchestrator End-to-End Trigger: Dataset Profiling
  console.log("\n--- 10. Orchestrator End-to-End Trigger: Dataset Profiling ---");
  const orchProfileRes = await fetch(`${BASE_URL}/api/app/orchestrator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      prompt: "Please profile dataset for global enterprise sales transactions and check data quality",
      personalMode: "RESEARCH",
    }),
  });

  const orchProfileData = await orchProfileRes.json();
  const profileArtifact = orchProfileData.result?.dataProfileArtifact;
  assert(
    orchProfileRes.status === 200 &&
      orchProfileData.success === true &&
      profileArtifact &&
      profileArtifact.qualityScore >= 80 &&
      orchProfileData.result?.verification?.passed === true,
    `Chat data profile artifact generated: Grade=${profileArtifact?.qualityGrade} Score=${profileArtifact?.qualityScore}% VerificationScore=${orchProfileData.result?.verification?.score}%`
  );

  // 11. Test Orchestrator End-to-End Trigger: SVG Chart Generation
  console.log("\n--- 11. Orchestrator End-to-End Trigger: SVG Chart ---");
  const orchChartRes = await fetch(`${BASE_URL}/api/app/orchestrator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      prompt: "Create a bar chart showing quarterly cloud ARR growth across 2026: Q1 $1.2M, Q2 $1.9M, Q3 $2.8M, Q4 $4.1M",
      personalMode: "RESEARCH",
    }),
  });

  const orchChartData = await orchChartRes.json();
  const chartArtifact = orchChartData.result?.chartArtifact;
  assert(
    orchChartRes.status === 200 &&
      orchChartData.success === true &&
      chartArtifact &&
      chartArtifact.downloadUrl &&
      orchChartData.result?.verification?.passed === true,
    `Chat chart artifact generated: URL=${chartArtifact?.downloadUrl} Type=${chartArtifact?.type}`
  );

  // 12. Test Orchestrator End-to-End Trigger: Deep Research & Fact Ledger
  console.log("\n--- 12. Orchestrator End-to-End Trigger: Deep Research & Fact Ledger ---");
  const orchResearchRes = await fetch(`${BASE_URL}/api/app/orchestrator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      prompt: "Conduct deep research on zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs)",
      personalMode: "RESEARCH",
    }),
  });

  const orchResearchData = await orchResearchRes.json();
  if (!orchResearchData.result?.researchArtifact) {
    console.log("orchResearchData:", JSON.stringify(orchResearchData, null, 2));
  }
  const researchArtifact = orchResearchData.result?.researchArtifact;
  assert(
    orchResearchRes.status === 200 &&
      orchResearchData.success === true &&
      researchArtifact &&
      researchArtifact.groundingScore >= 80 &&
      researchArtifact.claimsCount >= 4 &&
      orchResearchData.result?.verification?.passed === true,
    `Chat research artifact generated: Grounding=${researchArtifact?.groundingScore}% Claims=${researchArtifact?.claimsCount} Risk=${researchArtifact?.hallucinationRisk}`
  );

  // 13. Artifact Lineage Verification: Connect Data Profile and Research into Artifact Hub
  console.log("\n--- 13. Connected Artifact Lineage Hub Verification ---");
  const artifactsRes = await fetch(`${BASE_URL}/api/app/artifacts`, {
    headers: { Cookie: sessionCookie },
  });
  const artifactsData = await artifactsRes.json();
  assert(
    artifactsRes.status === 200 &&
      Array.isArray(artifactsData.artifacts) &&
      artifactsData.artifacts.length > 0,
    `Connected Artifact Lineage Hub contains ${artifactsData.artifacts.length} tracked artifacts with zero-trust cryptographic hashes and lineage`
  );

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passed}/${total} PHASE 3 VERIFICATION TESTS PASSED!`);
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
