import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting NEXA AI database seed...");

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full system administration, user governance, security control, and audit access.",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Standard authenticated user with full control over own agents, memory, and tools.",
    },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: "AUDITOR" },
    update: {},
    create: {
      name: "AUDITOR",
      description: "Security and compliance officer with read-only access to audit logs and security events.",
    },
  });

  const developerRole = await prisma.role.upsert({
    where: { name: "DEVELOPER" },
    update: {},
    create: {
      name: "DEVELOPER",
      description: "Developer role with access to MCP integrations, sandbox debugging, and tool definitions.",
    },
  });

  // 2. Create Permissions
  const permissionsList = [
    { name: "memory:read", description: "View personal memory records", resource: "memory", action: "read" },
    { name: "memory:write", description: "Create and update personal memory", resource: "memory", action: "write" },
    { name: "memory:delete", description: "Delete personal memory records", resource: "memory", action: "delete" },
    { name: "task:create", description: "Create autonomous AI tasks", resource: "task", action: "create" },
    { name: "task:execute", description: "Execute tools and agents", resource: "task", action: "execute" },
    { name: "tool:use", description: "Invoke registered AI tools", resource: "tool", action: "use" },
    { name: "tool:manage", description: "Configure system tool registry", resource: "tool", action: "manage" },
    { name: "user:read", description: "View user directory", resource: "user", action: "read" },
    { name: "user:manage", description: "Modify user status and permissions", resource: "user", action: "manage" },
    { name: "user:suspend", description: "Suspend or lock user accounts", resource: "user", action: "suspend" },
    { name: "audit:read", description: "Access tamper-evident security audit logs", resource: "audit", action: "read" },
    { name: "system:settings", description: "Configure global system parameters", resource: "system", action: "settings" },
    { name: "security:manage", description: "Manage global security policies", resource: "security", action: "manage" },
  ];

  const createdPermissions = [];
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions.push(p);
  }

  // Assign permissions to ADMIN (All)
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Assign permissions to USER (User resources)
  const userPermNames = ["memory:read", "memory:write", "memory:delete", "task:create", "task:execute", "tool:use"];
  for (const perm of createdPermissions.filter((p) => userPermNames.includes(p.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 3. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nexa.ai" },
    update: {},
    create: {
      email: "admin@nexa.ai",
      passwordHash: adminPasswordHash,
      name: "NEXA Administrator",
      roleId: adminRole.id,
      accountState: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      autonomyLevel: "ASK_BEFORE_ACTING",
    },
  });

  // 4. Create Standard Demo User
  const userPasswordHash = await bcrypt.hash("UserPassword123!", 10);
  const standardUser = await prisma.user.upsert({
    where: { email: "user@nexa.ai" },
    update: {},
    create: {
      email: "user@nexa.ai",
      passwordHash: userPasswordHash,
      name: "Alex Rivera",
      roleId: userRole.id,
      accountState: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      autonomyLevel: "ASK_BEFORE_ACTING",
    },
  });

  // 5. Seed Core Tools with Risk Architecture
  const tools = [
    {
      name: "web_search",
      category: "RESEARCH",
      description: "Search the live web and synthesize authoritative sources with citations.",
      riskLevel: "LOW",
      requiresApproval: false,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { query: { type: "string" }, numResults: { type: "number" } },
        required: ["query"],
      }),
    },
    {
      name: "read_document",
      category: "FILES",
      description: "Extract, parse, and summarize contents of uploaded PDF, DOCX, and text files.",
      riskLevel: "LOW",
      requiresApproval: false,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { fileId: { type: "string" } },
        required: ["fileId"],
      }),
    },
    {
      name: "analyze_code",
      category: "SYSTEM",
      description: "Static code analysis, syntax verification, and vulnerability detection.",
      riskLevel: "MEDIUM",
      requiresApproval: false,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { code: { type: "string" }, language: { type: "string" } },
        required: ["code"],
      }),
    },
    {
      name: "execute_code",
      category: "SYSTEM",
      description: "Execute Python / JavaScript code in an isolated, monitored sandbox environment.",
      riskLevel: "HIGH",
      requiresApproval: true,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { language: { type: "string" }, script: { type: "string" } },
        required: ["script"],
      }),
    },
    {
      name: "send_email",
      category: "INTEGRATION",
      description: "Dispatch email notifications and reports to verified external recipients.",
      riskLevel: "HIGH",
      requiresApproval: true,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { recipient: { type: "string" }, subject: { type: "string" }, body: { type: "string" } },
        required: ["recipient", "subject", "body"],
      }),
    },
    {
      name: "database_query",
      category: "SYSTEM",
      description: "Execute structured read/write queries against connected relational databases.",
      riskLevel: "HIGH",
      requiresApproval: true,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { connectionId: { type: "string" }, query: { type: "string" } },
        required: ["query"],
      }),
    },
    {
      name: "delete_resource",
      category: "DANGEROUS",
      description: "Permanently delete files, database tables, or project repositories.",
      riskLevel: "CRITICAL",
      requiresApproval: true,
      inputSchema: JSON.stringify({
        type: "object",
        properties: { resourceId: { type: "string" }, resourceType: { type: "string" } },
        required: ["resourceId"],
      }),
    },
  ];

  for (const t of tools) {
    await prisma.tool.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }

  // 6. Seed Feature Flags
  const flags = [
    { key: "VOICE_MODE", name: "Voice Interaction Mode", description: "Real-time speech-to-text and voice responses.", enabled: true },
    { key: "MCP_TOOLS", name: "Model Context Protocol", description: "Connect external MCP servers securely.", enabled: true },
    { key: "DEEP_RESEARCH", name: "Deep Research Agent", description: "Multi-turn recursive web exploration and cross-validation.", enabled: true },
    { key: "AUTONOMOUS_MODE", name: "Autonomous Mode", description: "Allow agents to chain subtasks automatically with approval boundaries.", enabled: true },
    { key: "PASSKEYS", name: "Passkeys / WebAuthn", description: "Biometric passwordless authentication support.", enabled: true },
    { key: "ADVANCED_MEMORY", name: "Multi-Tier Memory Architecture", description: "Semantic & episodic memory vector retrieval.", enabled: true },
  ];

  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: f,
    });
  }

  // 7. Seed Sample Memories for Alex Rivera
  const sampleMemories = [
    {
      userId: standardUser.id,
      type: "PREFERENCE",
      content: "Prefers TypeScript and functional React paradigms with strict Tailwind CSS styling.",
      source: "User Statement in onboarding",
      confidence: 0.98,
    },
    {
      userId: standardUser.id,
      type: "LONG_TERM",
      content: "Leading the NEXA Operating System infrastructure rollout with zero-trust security requirements.",
      source: "Project Brief Documentation",
      confidence: 0.95,
    },
    {
      userId: standardUser.id,
      type: "FACT",
      content: "Production API gateway enforces strict mutual TLS and OAuth2 client credentials.",
      source: "Security Architecture Review",
      confidence: 0.92,
    },
    {
      userId: standardUser.id,
      type: "TASK",
      content: "Review automated penetration testing results for tool sandbox execution boundaries.",
      source: "Task Planner Engine",
      confidence: 0.88,
    },
  ];

  for (const m of sampleMemories) {
    await prisma.memory.create({ data: m });
  }

  // 8. Seed Sample Pending Approval for Human Firewall Demonstration
  await prisma.approval.create({
    data: {
      userId: standardUser.id,
      actionName: "Execute External Webhook Notification",
      reason: "Agent completed weekly risk synthesis and requests authorization to dispatch webhook to Slack #security-ops channel.",
      riskLevel: "HIGH",
      dataPayload: JSON.stringify({
        endpoint: "https://hooks.slack.com/services/T00/B00/XXXX",
        payloadSummary: "Weekly Security & Compliance Health Report (98.7% uptime, 0 critical incidents)",
        affectedScope: "External Network Outbound",
      }),
      status: "PENDING",
    },
  });

  // 9. Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      actorRole: "ADMIN",
      action: "SYSTEM_INITIALIZATION",
      resource: "system",
      resourceId: "core",
      details: JSON.stringify({ version: "0.1.0", environment: "development", securityLevel: "ZERO_TRUST" }),
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  console.log("✅ NEXA AI database seeded successfully!");
  console.log("Admin account: admin@nexa.ai / AdminPassword123!");
  console.log("User account:  user@nexa.ai / UserPassword123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
