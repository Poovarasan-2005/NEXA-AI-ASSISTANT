import { RiskLevel } from "./types";

export interface RiskEvaluation {
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  reasons: string[];
}

export function evaluateRisk(
  toolName: string,
  inputParams: Record<string, any>,
  userAutonomyLevel = "ASK_BEFORE_ACTING"
): RiskEvaluation {
  let riskLevel: RiskLevel = "LOW";
  const reasons: string[] = [];

  // Baseline tool risk classification
  switch (toolName) {
    case "delete_resource":
      riskLevel = "CRITICAL";
      reasons.push("Action involves irreversible deletion of data or system resources.");
      break;

    case "execute_code":
      riskLevel = "HIGH";
      reasons.push("Action executes code within an isolated execution sandbox.");
      break;

    case "send_email":
      riskLevel = "HIGH";
      reasons.push("Action dispatches outbound communications to external email addresses.");
      break;

    case "database_query":
      riskLevel = "HIGH";
      reasons.push("Action executes structured operations directly against connected database.");
      break;

    case "analyze_code":
      riskLevel = "MEDIUM";
      reasons.push("Action involves deep code inspection and static analysis.");
      break;

    case "generate_image":
    case "analyze_dataset":
    case "export_pdf_report":
    case "web_search":
    case "read_document":
    default:
      riskLevel = "LOW";
      reasons.push("Safe generative synthesis or read-only operation within sovereign boundaries.");
      break;
  }

  // Deep parameter heuristic inspection
  const paramString = JSON.stringify(inputParams).toLowerCase();
  if (
    paramString.includes("drop table") ||
    paramString.includes("delete from") ||
    paramString.includes("rm -rf") ||
    paramString.includes("format c:")
  ) {
    riskLevel = "CRITICAL";
    reasons.push("Destructive query pattern detected in execution parameters.");
  }

  if (paramString.includes("api_key") || paramString.includes("password") || paramString.includes("secret")) {
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
    reasons.push("Payload references sensitive credential terms.");
  }

  // Determine whether approval is required based on user's autonomy policy
  let requiresApproval = false;

  if (userAutonomyLevel === "ASK_BEFORE_ACTING") {
    // Requires approval for MEDIUM, HIGH, and CRITICAL
    requiresApproval = riskLevel !== "LOW";
  } else if (userAutonomyLevel === "ALLOW_LOW_RISK") {
    // Requires approval for HIGH and CRITICAL
    requiresApproval = riskLevel === "HIGH" || riskLevel === "CRITICAL";
  } else if (userAutonomyLevel === "ADVANCED_AUTOMATION") {
    // Requires approval only for CRITICAL
    requiresApproval = riskLevel === "CRITICAL";
  } else {
    requiresApproval = true;
  }

  return {
    riskLevel,
    requiresApproval,
    reasons,
  };
}
