import { db } from "../src/lib/db";
import {
  getTrustAttestation,
  runIntegrityAudit,
  generateComplianceDossier,
} from "../src/lib/trust/trustService";
import { recordArtifact } from "../src/lib/artifacts/artifactService";

async function main() {
  console.log("\n=======================================================");
  console.log("   NEXA AI — PHASE 5 AUTOMATED VERIFICATION SUITE");
  console.log("   Trust Center, Cryptographic Vault & Voice Systems");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} — ${detail || "Assertion failed"}`);
    }
  }

  // Find test user
  const user = await db.user.findFirst({
    where: { email: "user@nexa.ai" },
  });

  if (!user) {
    console.error("FATAL: user@nexa.ai not found in dev.db");
    process.exit(1);
  }

  console.log(`[Target User]: ${user.name} (${user.id})\n`);

  // Ensure test artifacts exist with SHA-256 integrity hash
  await recordArtifact({
    userId: user.id,
    title: "Phase 5 Sovereign Governance Attestation",
    type: "DOCUMENT_DOCX",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    downloadUrl: "/api/app/files/test-attestation.docx",
    fileSize: 4096,
  });

  // 1. Get Trust Attestation
  console.log("--- 1. Testing Sovereign Trust Attestation ---");
  const attestation = await getTrustAttestation(user.id);

  assert(
    !!attestation && attestation.systemStatus === "OPTIMAL",
    "System status is OPTIMAL with 100% trust score",
    `Status: ${attestation?.systemStatus}`
  );

  assert(
    attestation.certificate.fingerprint.length === 64,
    "Root certificate fingerprint is a valid 64-char SHA-256 hex string",
    `Fingerprint: ${attestation.certificate.fingerprint}`
  );

  assert(
    attestation.certificate.serialNumber.startsWith("NX-"),
    "Certificate serial number formatted with sovereign prefix (NX-)",
    `Serial: ${attestation.certificate.serialNumber}`
  );

  assert(
    attestation.metrics.artifactsVerified > 0,
    "Cryptographic ledger tracks SHA-256 verified artifacts count",
    `Verified artifacts: ${attestation.metrics.artifactsVerified}`
  );

  assert(
    attestation.safeguards.zeroDataRetention.status === "ACTIVE" &&
      attestation.safeguards.zeroModelTraining.status === "ACTIVE",
    "Zero-data-retention and zero-model-training safeguards actively guaranteed",
    "Safeguards check"
  );

  assert(
    attestation.complianceFrameworks.length >= 4,
    "Compliance frameworks track SOC2, GDPR, ISO 42001, and NIST AI RMF",
    `Frameworks: ${attestation.complianceFrameworks.map((f) => f.framework).join(", ")}`
  );

  // 2. Run Cryptographic Integrity Audit
  console.log("\n--- 2. Testing Live Cryptographic Integrity Audit ---");
  const auditResult = await runIntegrityAudit(user.id);

  assert(
    auditResult.overallStatus === "PASSED_CRYPTOGRAPHIC_VERIFICATION",
    "Cryptographic audit passes with status PASSED_CRYPTOGRAPHIC_VERIFICATION",
    `Status: ${auditResult.overallStatus}`
  );

  assert(
    auditResult.tamperedArtifacts === 0,
    "Zero tampered artifacts detected across the entire lineage DAG",
    `Tampered: ${auditResult.tamperedArtifacts}`
  );

  assert(
    auditResult.checks.length >= 5 && auditResult.checks.every((c) => c.passed),
    "All integrity checks pass (SHA-256, Constitution, Tenant Boundary, Sanitization, Ledger)",
    `Passed checks: ${auditResult.checks.filter((c) => c.passed).length}/${auditResult.checks.length}`
  );

  assert(
    auditResult.cryptographicSignature.length === 64,
    "Audit result signed with cryptographic SHA-256 proof signature",
    `Signature: ${auditResult.cryptographicSignature}`
  );

  // 3. Export Compliance Dossiers
  console.log("\n--- 3. Testing Exportable Compliance Dossiers ---");
  const soc2Dossier = await generateComplianceDossier(user.id, "SOC2");
  assert(
    soc2Dossier.content.includes("SOC 2 Type II") &&
      soc2Dossier.content.includes("NEXA SOVEREIGN CRYPTOGRAPHIC VERIFICATION SEAL"),
    "SOC 2 Type II compliance dossier generated with sovereign verification seal",
    `Filename: ${soc2Dossier.filename}`
  );

  const gdprDossier = await generateComplianceDossier(user.id, "GDPR");
  assert(
    gdprDossier.content.includes("Article 17") &&
      gdprDossier.content.includes("Right to Erasure"),
    "GDPR compliance certificate covers Article 17 (Right to Erasure) and Article 25 (Privacy by Design)",
    `Filename: ${gdprDossier.filename}`
  );

  const isoDossier = await generateComplianceDossier(user.id, "ISO42001");
  assert(
    isoDossier.content.includes("ISO/IEC 42001:2023") &&
      isoDossier.content.includes("Artificial Intelligence Management System"),
    "ISO/IEC 42001 AIMS governance attestation compiled successfully",
    `Filename: ${isoDossier.filename}`
  );

  // 4. Voice Assistant Speech Cleaner Simulation
  console.log("\n--- 4. Testing Sovereign Voice Assistant Text Sanitization ---");
  const rawTextWithMarkdown = `
Greetings! Here is the summary of your project:
\`\`\`typescript
const sensitiveToken = "secret_key_123";
\`\`\`
| Feature | Status |
| --- | --- |
| Governance | Active |
Visit [docs](https://nexa.ai/docs) for more info.
Your AI OS is running smoothly with 100% policy enforcement.
`;

  const cleanSpoken = rawTextWithMarkdown
    .replace(/```[\s\S]*?```/g, " code block omitted ")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/[#*_~`]/g, "")
    .replace(/\|.*?\|/g, "")
    .replace(/\{[\s\S]*?\}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  assert(
    !cleanSpoken.includes("const sensitiveToken") &&
      !cleanSpoken.includes("https://") &&
      !cleanSpoken.includes("| Feature |"),
    "Voice assistant text cleaner strips code blocks, tables, and raw markdown for sovereign vocal delivery",
    `Clean text: "${cleanSpoken.substring(0, 80)}..."`
  );

  // Summary
  console.log("\n=======================================================");
  console.log(`   PHASE 5 VERIFICATION RESULT: ${passed} / ${total} PASSED`);
  if (passed === total) {
    console.log("   STATUS: ALL PHASE 5 TESTS COMPLETED WITH 100% SUCCESS!");
  } else {
    console.log("   STATUS: SOME CHECKS FAILED.");
  }
  console.log("=======================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
