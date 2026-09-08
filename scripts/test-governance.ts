export {};
const BASE_URL = "http://localhost:3000";

async function runGovernanceTests() {
  console.log("=== STARTING NEXA AI GOVERNANCE & SIGNATURE FEATURES TEST SUITE ===\n");
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<boolean>) {
    total++;
    process.stdout.write(`[TEST ${total}] ${name}... `);
    try {
      const ok = await fn();
      if (ok) {
        console.log("✅ PASSED");
        passed++;
      } else {
        console.log("❌ FAILED");
      }
    } catch (e: any) {
      console.log(`❌ ERROR: ${e.message}`);
    }
  }

  // 1. Authenticate user
  let userCookie = "";
  await test("User Authentication & Session Issuance", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@nexa.ai", password: "UserPassword123!" }),
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      userCookie = setCookie.split(";")[0];
      return true;
    }
    return false;
  });

  // 2. Fetch AI Constitution (7 baseline rules)
  let ruleIdToToggle = "";
  await test("AI Constitution API (/api/app/constitution GET)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/constitution`, {
      headers: { Cookie: userCookie },
    });
    const data: any = await res.json();
    if (data.success && Array.isArray(data.rules) && data.rules.length >= 7) {
      ruleIdToToggle = data.rules[0].id;
      return true;
    }
    return false;
  });

  // 3. AI Constitution Amendment & Toggle
  await test("AI Constitution Policy Toggle & Ratification", async () => {
    // Add custom amendment
    const addRes = await fetch(`${BASE_URL}/api/app/constitution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        action: "ADD",
        content: "Always ask before connecting to external cloud storage providers.",
        category: "PRIVACY",
      }),
    });
    const addData: any = await addRes.json();

    // Toggle rule
    const toggleRes = await fetch(`${BASE_URL}/api/app/constitution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        ruleId: ruleIdToToggle,
        enforced: true,
      }),
    });
    const toggleData: any = await toggleRes.json();

    return addData.success && toggleData.success;
  });

  // 4. Simulation / Dry Run Engine
  await test("Simulation / Dry Run Engine (isSimulation: true)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Analyze the uploaded sales dataset and simulate cleaning steps",
        isSimulation: true,
        personalMode: "DATA",
      }),
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.result?.status === "SIMULATED" &&
      data.result?.isSimulation === true &&
      Array.isArray(data.result?.simulationPreview) &&
      data.result?.simulationPreview.length > 0 &&
      data.result?.actionContract?.id !== undefined
    );
  });

  // 5. Action Contract Generation on Live Task
  let liveTaskId = "";
  await test("Cryptographic Action Contract Generation & Storage", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Research the latest advancements in zero-trust personal AI operating systems",
        personalMode: "RESEARCH",
      }),
    });
    const data: any = await res.json();
    if (data.success && data.result?.actionContract?.id) {
      liveTaskId = data.result.taskId;
      return (
        data.result.actionContract.allowedActions.length > 0 &&
        data.result.actionContract.forbiddenActions.length > 0
      );
    }
    return false;
  });

  // 6. Decision Ledger & "Why did NEXA do this?" Retrieval
  await test("Decision Ledger Explainability API (/api/app/decision-ledger GET)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/decision-ledger?taskId=${liveTaskId}`, {
      headers: { Cookie: userCookie },
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.decisionLedger?.goal !== undefined &&
      data.decisionLedger?.planSummary !== undefined &&
      data.decisionLedger?.modelSelectionRationale !== undefined &&
      Array.isArray(data.decisionLedger?.verificationChecklist)
    );
  });

  // 7. Personal AI Mode: PRIVATE Mode Execution
  await test("Personal AI Mode: PRIVATE (Zero External Leaks & Ephemeral)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Synthesize private confidential strategy notes without external search",
        personalMode: "PRIVATE",
      }),
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.result?.personalMode === "PRIVATE" &&
      data.result?.actionContract?.dataScope.includes("Temporary Session Memory")
    );
  });

  // 8. Constitution Policy Firewall Interception
  await test("Constitution Policy Firewall Interception (Rule #1: Outbound Email)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Send an email notification to external-auditor@enterprise.com with audit log summary",
        personalMode: "SAFE",
      }),
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.result?.status === "WAITING_FOR_APPROVAL" &&
      data.result?.approvalRequired !== undefined &&
      data.result?.approvalRequired.reason.includes("AI Constitution Policy")
    );
  });

  console.log(`\n======================================================`);
  console.log(`GOVERNANCE TEST SUITE RESULTS: ${passed}/${total} PASSED`);
  console.log(`======================================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runGovernanceTests();
