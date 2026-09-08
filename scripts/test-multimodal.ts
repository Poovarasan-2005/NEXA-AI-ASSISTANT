const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING NEXA MULTIMODAL FEATURE TEST SUITE ===\n");
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
      headers: { "Content-Type": "application/json", "x-nexa-test": "true" },
      body: JSON.stringify({ email: "user@nexa.ai", password: "UserPassword123!" }),
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      userCookie = setCookie.split(";")[0];
      return true;
    }
    const errText = await res.text();
    console.log(`[LOGIN FAILED status: ${res.status} body: ${errText}]`);
    return false;
  });

  // 2. Test CSV Dataset Export - Telemetry
  await test("CSV Export: Telemetry Dataset", async () => {
    const res = await fetch(`${BASE_URL}/api/app/files/export-csv?type=telemetry&rows=15`, {
      headers: { Cookie: userCookie },
    });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    const isCsv = contentType.includes("text/csv");
    const hasHeader = text.includes("id,metric_name,subsystem,status,efficiency_score");
    const lineCount = text.trim().split("\n").length;
    return res.status === 200 && isCsv && hasHeader && lineCount === 16;
  });

  // 3. Test CSV Dataset Export - Audit Logs
  await test("CSV Export: Security Audit Dataset", async () => {
    const res = await fetch(`${BASE_URL}/api/app/files/export-csv?type=audit&rows=20`, {
      headers: { Cookie: userCookie },
    });
    const text = await res.text();
    const isCsv = (res.headers.get("content-type") || "").includes("text/csv");
    const hasHeader = text.includes("event_id,timestamp,action,user_id,ip_address,risk_level");
    return res.status === 200 && isCsv && hasHeader;
  });

  // 4. Test PDF Report Export
  await test("Executive PDF Exporter with Verified Security Stamp", async () => {
    const res = await fetch(
      `${BASE_URL}/api/app/files/export-pdf?title=Operational+Security+Certification&content=All+v8-isolates+verified+active.`,
      { headers: { Cookie: userCookie } }
    );
    const html = await res.text();
    const hasPrint = html.includes("@media print");
    const hasTitle = html.includes("Operational Security Certification");
    const hasBadge = html.includes("VERIFIED GRADE A");
    return res.status === 200 && hasPrint && hasTitle && hasBadge;
  });

  // 5. Test Image Generation API
  let generatedImageId = "";
  await test("AI Image Generation API (/api/app/images POST)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Futuristic zero-trust neural architecture core with blue neon lights",
        style: "cyberpunk",
        resolution: "1024x1024",
      }),
    });
    const data: any = await res.json();
    if (data.success && data.image?.url && data.image?.downloadUrl) {
      generatedImageId = data.image.id;
      return true;
    }
    return false;
  });

  // 6. Test Image Gallery API
  await test("AI Image Gallery API (/api/app/images GET)", async () => {
    const res = await fetch(`${BASE_URL}/api/app/images`, {
      headers: { Cookie: userCookie },
    });
    const data: any = await res.json();
    return res.status === 200 && data.success && Array.isArray(data.images) && data.images.length > 0;
  });

  // 7. Test AI Orchestrator Image Synthesis Prompt
  await test("AI Orchestrator Image Generation Trigger & Artifact", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Generate an image of a quantum computing core in cyberpunk style",
      }),
    });
    const data: any = await res.json();
    if (!data.result?.imageArtifact) {
      console.log("\n[DEBUG TEST 7 result]:", JSON.stringify(data, null, 2));
    }
    return (
      res.status === 200 &&
      data.success &&
      data.result?.imageArtifact?.imageUrl !== undefined &&
      data.result?.imageArtifact?.downloadUrl !== undefined
    );
  });

  // 8. Test AI Orchestrator Dataset Generation Trigger & Artifact
  await test("AI Orchestrator Tabular Dataset Trigger & Artifact", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Analyze the system telemetry dataset and give me a CSV download",
      }),
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.result?.datasetArtifact?.csvDownloadUrl !== undefined &&
      data.result?.datasetArtifact?.rowCount > 0
    );
  });

  // 9. Test AI Orchestrator PDF Export Trigger & Artifact
  await test("AI Orchestrator PDF Report Trigger & Artifact", async () => {
    const res = await fetch(`${BASE_URL}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Compile an executive PDF report verifying our zero-trust system state",
      }),
    });
    const data: any = await res.json();
    return (
      res.status === 200 &&
      data.success &&
      data.result?.pdfArtifact?.downloadUrl !== undefined
    );
  });

  console.log(`\n=============================================`);
  console.log(`TEST SUITE RESULTS: ${passed}/${total} PASSED`);
  console.log(`=============================================`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runTests().catch((e) => {
  console.error("Multimodal suite error:", e);
  process.exitCode = 1;
});
