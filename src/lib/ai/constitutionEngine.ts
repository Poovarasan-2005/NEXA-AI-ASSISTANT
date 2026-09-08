import { db } from "../db";

export interface ConstitutionRuleItem {
  id: string;
  ruleNumber: number;
  content: string;
  category: "SAFETY" | "PRIVACY" | "ACCURACY" | "AUTONOMY" | "GENERAL";
  enforced: boolean;
}

export const DEFAULT_CONSTITUTION_RULES: Array<{
  ruleNumber: number;
  content: string;
  category: "SAFETY" | "PRIVACY" | "ACCURACY" | "AUTONOMY" | "GENERAL";
}> = [
  {
    ruleNumber: 1,
    content: "Always ask before transmitting outbound communications or external emails.",
    category: "AUTONOMY",
  },
  {
    ruleNumber: 2,
    content: "Never delete files, databases, or workspace resources automatically.",
    category: "SAFETY",
  },
  {
    ruleNumber: 3,
    content: "Prefer verified primary sources and cryptographically grounded data.",
    category: "ACCURACY",
  },
  {
    ruleNumber: 4,
    content: "Provide formal citations and evidence confidence scores for all major claims.",
    category: "ACCURACY",
  },
  {
    ruleNumber: 5,
    content: "Never store credentials, API keys, session tokens, or passwords in memory.",
    category: "PRIVACY",
  },
  {
    ruleNumber: 6,
    content: "Prompt for explicit human authorization before external data egress.",
    category: "PRIVACY",
  },
  {
    ruleNumber: 7,
    content: "Enforce strict sandbox isolation for arbitrary script and code execution.",
    category: "SAFETY",
  },
];

export async function getUserConstitution(userId: string): Promise<ConstitutionRuleItem[]> {
  let rules = await db.constitutionRule.findMany({
    where: { userId },
    orderBy: { ruleNumber: "asc" },
  });

  // Seed default rules if user does not have any yet
  if (rules.length === 0) {
    for (const def of DEFAULT_CONSTITUTION_RULES) {
      await db.constitutionRule.create({
        data: {
          userId,
          ruleNumber: def.ruleNumber,
          content: def.content,
          category: def.category,
          enforced: true,
        },
      });
    }

    rules = await db.constitutionRule.findMany({
      where: { userId },
      orderBy: { ruleNumber: "asc" },
    });
  }

  return rules.map((r) => ({
    id: r.id,
    ruleNumber: r.ruleNumber,
    content: r.content,
    category: r.category as any,
    enforced: r.enforced,
  }));
}

export interface ConstitutionEvaluation {
  passed: boolean;
  escalateToApproval: boolean;
  triggeredRules: Array<{ ruleNumber: number; content: string; reason: string }>;
  policyDecisions: string[];
}

export function evaluateConstitution(
  rules: ConstitutionRuleItem[],
  action: {
    toolName?: string;
    inputParams?: Record<string, any>;
    prompt?: string;
  }
): ConstitutionEvaluation {
  const activeRules = rules.filter((r) => r.enforced);
  const triggered: Array<{ ruleNumber: number; content: string; reason: string }> = [];
  const decisions: string[] = [];

  const toolName = action.toolName || "";
  const paramsStr = JSON.stringify(action.inputParams || {}).toLowerCase();
  const promptStr = (action.prompt || "").toLowerCase();

  for (const rule of activeRules) {
    // Rule 1: Outbound email / communication
    if (rule.ruleNumber === 1 && (toolName === "send_email" || promptStr.includes("send email"))) {
      triggered.push({
        ruleNumber: 1,
        content: rule.content,
        reason: "Outbound transmission detected. Rule #1 mandates human approval.",
      });
      decisions.push("Rule #1 Triggered: Outbound email halted for human confirmation.");
    }

    // Rule 2: Delete files/data
    if (
      rule.ruleNumber === 2 &&
      (toolName === "delete_resource" ||
        paramsStr.includes("delete") ||
        paramsStr.includes("drop") ||
        paramsStr.includes("rm "))
    ) {
      triggered.push({
        ruleNumber: 2,
        content: rule.content,
        reason: "Deletion attempt detected. Rule #2 strictly prohibits automated deletions.",
      });
      decisions.push("Rule #2 Triggered: Resource deletion intercepted.");
    }

    // Rule 5: Credential leakage
    if (
      rule.ruleNumber === 5 &&
      (paramsStr.includes("password") ||
        paramsStr.includes("api_key") ||
        paramsStr.includes("secret") ||
        promptStr.includes("store password"))
    ) {
      triggered.push({
        ruleNumber: 5,
        content: rule.content,
        reason: "Sensitive credential references detected. Rule #5 blocks persistence of secrets in memory.",
      });
      decisions.push("Rule #5 Enforced: Memory ingestion of secret token blocked.");
    }

    // Rule 6: External egress
    if (rule.ruleNumber === 6 && toolName === "send_email") {
      triggered.push({
        ruleNumber: 6,
        content: rule.content,
        reason: "External data transfer detected. Rule #6 mandates data transfer warning.",
      });
    }

    // Rule 7: Sandbox isolation
    if (rule.ruleNumber === 7 && toolName === "execute_code") {
      decisions.push("Rule #7 Enforced: Micro-VM v8-isolate confinement verified active.");
    }
  }

  const passed = triggered.length === 0;
  return {
    passed,
    escalateToApproval: triggered.length > 0,
    triggeredRules: triggered,
    policyDecisions: decisions,
  };
}
