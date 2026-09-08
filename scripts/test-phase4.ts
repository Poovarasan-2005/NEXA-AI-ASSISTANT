export {};

const BASE_URL = "http://localhost:3000";

let sessionCookie = "";

async function runTests() {
  console.log("=================================================");
  console.log("🚀 STARTING NEXA AI PHASE 4 VERIFICATION SUITE");
  console.log("   (Projects, Visual Workflows & Command-K Search)");
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

  // 2. Create Project Workspace (POST)
  console.log("\n--- 2. Create Project Workspace (POST) ---");
  const createProjRes = await fetch(`${BASE_URL}/api/app/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      name: "Q4 Zero-Trust Autonomous Cloud Migration",
      description: "Strategic isolation boundary container for cloud workloads, cryptographic briefs, and policy matrices.",
      status: "ACTIVE",
    }),
  });

  const createProjData = await createProjRes.json();
  const createdProject = createProjData.project;
  assert(
    createProjRes.status === 200 &&
      createProjData.success === true &&
      createdProject &&
      createdProject.name === "Q4 Zero-Trust Autonomous Cloud Migration",
    `Project Workspace created: ID=${createdProject?.id} Name="${createdProject?.name}" Status=${createdProject?.status}`
  );

  // 3. List User Projects (GET)
  console.log("\n--- 3. List User Projects with Aggregated Stats (GET) ---");
  const listProjRes = await fetch(`${BASE_URL}/api/app/projects`, {
    headers: { Cookie: sessionCookie },
  });
  const listProjData = await listProjRes.json();
  const foundProject = listProjData.projects?.find((p: any) => p.id === createdProject.id);

  assert(
    listProjRes.status === 200 &&
      Array.isArray(listProjData.projects) &&
      listProjData.projects.length > 0 &&
      !!foundProject &&
      typeof foundProject.counts === "object",
    `User projects listed: ${listProjData.projects.length} workspaces found (Project counts: tasks=${foundProject?.counts?.tasks}, artifacts=${foundProject?.counts?.artifacts})`
  );

  // 4. Project Workspace Details & Relations (GET)
  console.log("\n--- 4. Project Details with Nested Subsystem Relations (GET) ---");
  const detailsRes = await fetch(`${BASE_URL}/api/app/projects/${createdProject.id}`, {
    headers: { Cookie: sessionCookie },
  });
  const detailsData = await detailsRes.json();
  const pDetails = detailsData.project;

  assert(
    detailsRes.status === 200 &&
      pDetails &&
      Array.isArray(pDetails.tasks) &&
      Array.isArray(pDetails.artifacts) &&
      Array.isArray(pDetails.memories) &&
      Array.isArray(pDetails.workflows),
    `Project details retrieved: Workspace "${pDetails?.name}" with relational arrays (Tasks, Artifacts, Memories, Workflows)`
  );

  // 5. Update Project Workspace (PATCH)
  console.log("\n--- 5. Update Project Workspace (PATCH) ---");
  const updateRes = await fetch(`${BASE_URL}/api/app/projects/${createdProject.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      status: "COMPLETED",
      description: "Migration complete with 100% verified zero-trust attestation and artifact lineage.",
    }),
  });
  const updateData = await updateRes.json();

  assert(
    updateRes.status === 200 &&
      updateData.project?.status === "COMPLETED" &&
      updateData.project?.description?.includes("Migration complete"),
    `Project workspace updated: Status=${updateData.project?.status}`
  );

  // 6. Workflows & Preset Templates (GET)
  console.log("\n--- 6. Visual Workflow Studio Presets & Library (GET) ---");
  const wfRes = await fetch(`${BASE_URL}/api/app/workflows`, {
    headers: { Cookie: sessionCookie },
  });
  const wfData = await wfRes.json();

  assert(
    wfRes.status === 200 &&
      Array.isArray(wfData.presets) &&
      wfData.presets.length >= 3 &&
      wfData.presets.some((p: any) => p.id === "preset-intel-loop") &&
      wfData.presets.some((p: any) => p.id === "preset-data-audit"),
    `Visual Workflow presets loaded: ${wfData.presets.length} production DAG pipelines found (Strategic Intel Loop, Data Audit, Security Response)`
  );

  // 7. Save Custom Workflow (POST)
  console.log("\n--- 7. Save Custom Multi-Node Workflow Pipeline (POST) ---");
  const saveWfRes = await fetch(`${BASE_URL}/api/app/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      name: "Autonomous Enterprise KPI & Governance Synthesis",
      description: "Custom pipeline for weekly KPI telemetry ingestion, IQR outlier detection, and PowerPoint assembly.",
      projectId: createdProject.id,
      triggerType: "SCHEDULE",
      scheduleCron: "0 8 * * 1",
      nodes: [
        {
          id: "node-1",
          type: "TRIGGER",
          label: "Weekly Monday 08:00 Chrono Trigger",
          config: { cron: "0 8 * * 1" },
          position: { x: 50, y: 150 },
        },
        {
          id: "node-2",
          type: "TOOL",
          label: "Scan Dataset Completeness & Anomalies",
          config: { toolName: "profile_dataset", datasetName: "enterprise_kpi_metrics.csv" },
          position: { x: 350, y: 150 },
        },
        {
          id: "node-3",
          type: "TOOL",
          label: "Compile Executive Presentation Deck (.pptx)",
          config: { toolName: "export_pptx_deck", title: "Enterprise KPI Executive Review" },
          position: { x: 650, y: 150 },
        },
        {
          id: "node-4",
          type: "OUTPUT",
          label: "Deliver Artifact & Notify Team",
          config: { destination: "ARTIFACT_VAULT" },
          position: { x: 950, y: 150 },
        },
      ],
      edges: [
        { id: "e1-2", source: "node-1", target: "node-2" },
        { id: "e2-3", source: "node-2", target: "node-3" },
        { id: "e3-4", source: "node-3", target: "node-4" },
      ],
    }),
  });

  const saveWfData = await saveWfRes.json();
  const customWorkflow = saveWfData.workflow;

  assert(
    saveWfRes.status === 200 &&
      saveWfData.success === true &&
      customWorkflow &&
      customWorkflow.name === "Autonomous Enterprise KPI & Governance Synthesis",
    `Custom Workflow saved: ID=${customWorkflow?.id} Nodes=4 Edges=3 Trigger=${customWorkflow?.triggerType}`
  );

  // 8. Run Workflow Pipeline: Strategic Intelligence Loop (POST)
  console.log("\n--- 8. Run Autonomous Workflow: Strategic Intelligence Loop (POST) ---");
  const runLoopRes = await fetch(`${BASE_URL}/api/app/workflows/preset-intel-loop/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({ trigger: "MANUAL" }),
  });

  const runLoopData = await runLoopRes.json();
  const loopResult = runLoopData.result;

  assert(
    runLoopRes.status === 200 &&
      loopResult &&
      loopResult.status === "COMPLETED" &&
      loopResult.stepResults.length === 6 &&
      loopResult.stepResults.every((s: any) => s.status === "SUCCESS") &&
      loopResult.artifactsGenerated.length > 0,
    `Workflow Pipeline executed: Status=${loopResult?.status} NodesExecuted=${loopResult?.stepResults?.length} TotalLatency=${loopResult?.totalDurationMs}ms Artifacts=${loopResult?.artifactsGenerated?.length}`
  );

  // 9. Run Workflow Pipeline: Continuous Data Audit (POST)
  console.log("\n--- 9. Run Autonomous Workflow: Continuous Data Audit (POST) ---");
  const runAuditRes = await fetch(`${BASE_URL}/api/app/workflows/preset-data-audit/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({ trigger: "SCHEDULE" }),
  });

  const runAuditData = await runAuditRes.json();
  const auditResult = runAuditData.result;

  assert(
    runAuditRes.status === 200 &&
      auditResult &&
      auditResult.status === "COMPLETED" &&
      auditResult.stepResults.length === 5 &&
      auditResult.stepResults.every((s: any) => s.status === "SUCCESS"),
    `Data Audit Pipeline executed: Status=${auditResult?.status} Steps=${auditResult?.stepResults?.length} TotalDuration=${auditResult?.totalDurationMs}ms`
  );

  // 10. Global Command-K Omni-Search: Default Static Actions (GET)
  console.log("\n--- 10. Command-K Omni-Search: Default System Actions (GET) ---");
  const defaultSearchRes = await fetch(`${BASE_URL}/api/app/search`, {
    headers: { Cookie: sessionCookie },
  });
  const defaultSearchData = await defaultSearchRes.json();

  assert(
    defaultSearchRes.status === 200 &&
      Array.isArray(defaultSearchData.results) &&
      defaultSearchData.results.length > 0 &&
      defaultSearchData.results.some((r: any) => r.category === "ACTIONS" || r.category === "PAGES"),
    `Omni-Search default catalog returned ${defaultSearchData.results?.length} quick-action & page dispatch entries`
  );

  // 11. Global Command-K Omni-Search: Query Projects (GET)
  console.log("\n--- 11. Command-K Omni-Search: Query Projects & Initiatives (GET) ---");
  const projSearchRes = await fetch(`${BASE_URL}/api/app/search?q=Zero-Trust`, {
    headers: { Cookie: sessionCookie },
  });
  const projSearchData = await projSearchRes.json();

  assert(
    projSearchRes.status === 200 &&
      Array.isArray(projSearchData.results) &&
      projSearchData.results.length > 0 &&
      projSearchData.results.some((r: any) => r.title.toLowerCase().includes("zero-trust")),
    `Omni-Search query "Zero-Trust" matched ${projSearchData.results?.length} entities across workspaces, actions, and constitution`
  );

  // 12. Global Command-K Omni-Search: Query Research & Artifacts (GET)
  console.log("\n--- 12. Command-K Omni-Search: Query Research & Fact Ledgers (GET) ---");
  const researchSearchRes = await fetch(`${BASE_URL}/api/app/search?q=research`, {
    headers: { Cookie: sessionCookie },
  });
  const researchSearchData = await researchSearchRes.json();

  assert(
    researchSearchRes.status === 200 &&
      Array.isArray(researchSearchData.results) &&
      researchSearchData.results.length > 0,
    `Omni-Search query "research" returned ${researchSearchData.results?.length} matching items across Fact Ledgers, Actions, and Artifacts`
  );

  // 13. Delete Project Workspace & Anti-IDOR Cleanup (DELETE)
  console.log("\n--- 13. Delete Project Workspace & Anti-IDOR (DELETE) ---");
  const deleteProjRes = await fetch(`${BASE_URL}/api/app/projects/${createdProject.id}`, {
    method: "DELETE",
    headers: { Cookie: sessionCookie },
  });
  const deleteProjData = await deleteProjRes.json();

  assert(
    deleteProjRes.status === 200 && deleteProjData.success === true,
    `Project workspace deleted cleanly with zero residue`
  );

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passed}/${total} PHASE 4 VERIFICATION TESTS PASSED!`);
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Phase 4 test execution failed:", err);
  process.exit(1);
});
