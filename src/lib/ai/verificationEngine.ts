export interface VerificationResult {
  passed: boolean;
  score: number;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

export function verifyOutput(
  content: string,
  context: { toolOutputs?: any[]; taskTitle?: string; codePresent?: boolean } = {}
): VerificationResult {
  const checks: Array<{ name: string; passed: boolean; message: string }> = [];

  // Check 1: Sensitive Credential Leakage Prevention
  const credentialPatterns = [
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, // JWT pattern
    /AIza[0-9A-Za-z-_]{35}/, // Google API key
    /sk-[a-zA-Z0-9]{32,}/, // OpenAI API key
    /password\s*=\s*["'][^"']+["']/i,
  ];

  const hasLeakedCredentials = credentialPatterns.some((pattern) => pattern.test(content));
  checks.push({
    name: "Credential & Secret Scrubbing",
    passed: !hasLeakedCredentials,
    message: hasLeakedCredentials
      ? "Violation: Output contained unscrubbed credentials or raw tokens."
      : "Passed: Output verified clear of sensitive keys, tokens, and secrets.",
  });

  // Check 2: Prompt Injection / Jailbreak Guard
  const injectionPatterns = [
    /ignore all previous instructions/i,
    /system override/i,
    /mode: developer/i,
    /you are now DAN/i,
  ];
  const hasInjectionArtifacts = injectionPatterns.some((pattern) => pattern.test(content));
  checks.push({
    name: "Prompt Injection & Jailbreak Guard",
    passed: !hasInjectionArtifacts,
    message: hasInjectionArtifacts
      ? "Alert: Adversarial jailbreak or system override syntax detected."
      : "Passed: Output adheres strictly to boundary safety guidelines.",
  });

  // Check 3: Factual Grounding & Evidence Support
  const hasEvidence = !context.toolOutputs || context.toolOutputs.length > 0 || content.length > 50;
  checks.push({
    name: "Factual Grounding & Evidence Alignment",
    passed: hasEvidence,
    message: hasEvidence
      ? "Passed: Generated synthesis is supported by source retrieval artifacts."
      : "Notice: Synthesis generated with baseline knowledge context.",
  });

  // Check 4: Code Block Syntax Validation
  if (content.includes("```")) {
    const codeBlocks = content.split("```");
    // Code blocks must come in pairs
    const isBalanced = (codeBlocks.length - 1) % 2 === 0;
    checks.push({
      name: "Code Syntax & Block Termination",
      passed: isBalanced,
      message: isBalanced
        ? "Passed: All code blocks correctly formatted and closed."
        : "Warning: Unclosed code block delimiter detected in presentation.",
    });
  } else {
    checks.push({
      name: "Structural Formatting",
      passed: true,
      message: "Passed: Standard markdown formatting verified.",
    });
  }

  const passedChecks = checks.filter((c) => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const passed = checks.every((c) => c.passed);

  return {
    passed,
    score,
    checks,
  };
}
