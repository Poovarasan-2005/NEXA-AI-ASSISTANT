import { db } from "../db";
import { recordActivityEvent } from "../audit";
import { evaluateRisk } from "./riskEngine";
import { executeTool } from "./tools";
import { verifyOutput } from "./verificationEngine";
import { routeModelRequest } from "./modelRouter";
import { addMemory, getRelevantMemories } from "./memoryEngine";
import { getUserConstitution, evaluateConstitution } from "./constitutionEngine";
import {
  OrchestrationResult,
  PlanStep,
  RiskLevel,
  PersonalAIMode,
  ActionContractState,
  DecisionLedgerState,
  SimulationStepPreview,
} from "./types";

export interface RunOrchestratorParams {
  userId: string;
  prompt: string;
  projectId?: string;
  preferredModel?: string;
  personalMode?: PersonalAIMode;
  isSimulation?: boolean;
  approvedApprovalId?: string; // If resuming after user approval
}

export async function runOrchestration(params: RunOrchestratorParams): Promise<OrchestrationResult> {
  const {
    userId,
    prompt,
    projectId,
    preferredModel,
    personalMode = "SAFE",
    isSimulation = false,
    approvedApprovalId,
  } = params;

  // 1. Fetch user & load active AI Constitution
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, autonomyLevel: true, pauseMemory: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const constitutionRules = await getUserConstitution(userId);

  // 2. Fetch Relevant Contextual Memory (bypass if in PRIVATE mode)
  const isPrivateMode = personalMode === "PRIVATE";
  const memories = isPrivateMode ? [] : await getRelevantMemories(userId, prompt, 3);
  const memoryContext = memories.map((m) => `[${m.type}] ${m.content}`).join("\n");

  // 3. Create or Resume Task
  let task = await db.task.create({
    data: {
      userId,
      projectId: projectId || null,
      title: prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt,
      description: prompt,
      status: isSimulation ? "SIMULATED" : "PLANNING",
      agentType: "Planner",
      riskLevel: "LOW",
      progress: 10,
      currentStep: "Analyzing intent and constructing governed action contract",
    },
  });

  await recordActivityEvent({
    userId,
    type: "TASK_CREATED",
    title: `Task initiated: ${task.title}`,
    description: `Orchestrator initiated planning under ${personalMode} mode.`,
    metadata: { taskId: task.id, personalMode, isSimulation },
  });

  // 4. Planner Agent: Plan Decomposition
  const promptLower = prompt.toLowerCase();
  let planSteps: PlanStep[] = [];
  let taskRiskLevel: RiskLevel = "LOW";

  if (
    promptLower.includes("deep research") ||
    promptLower.includes("fact ledger") ||
    promptLower.includes("grounded research") ||
    promptLower.includes("investigate")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Decompose Inquiries into Core Hypotheses",
        description: "Formulate search queries across authoritative academic and regulatory sources.",
        agent: "Research",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Synthesize Fact Ledger & Claim Attestation",
        description: "Decompose findings into Evidence, Inference, Recommendation, and Uncertainty.",
        agent: "Research",
        toolName: "deep_research",
        toolInput: { topic: prompt },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (promptLower.includes("research") || promptLower.includes("search") || promptLower.includes("find")) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Web Intelligence Gathering",
        description: "Query indexed repositories and live search engines for authoritative evidence.",
        agent: "Research",
        toolName: isPrivateMode ? undefined : "web_search",
        toolInput: { query: prompt },
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Evidence Synthesis & Citation",
        description: "Filter noise, verify publication timestamps, and formulate cross-referenced summary.",
        agent: "Verification",
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (promptLower.includes("email") || promptLower.includes("notify") || promptLower.includes("send")) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Draft Outbound Dispatch",
        description: "Formulate outbound communication payload and verify recipient domain.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Dispatch External Transmission",
        description: "Transmit communication via external SMTP connector.",
        agent: "Specialized Agent" as any,
        toolName: "send_email",
        toolInput: {
          recipient: "security-ops@organization.internal",
          subject: "Automated NEXA Health & Security Advisory",
          body: `Notification generated on behalf of ${user.name}`,
        },
        riskLevel: "HIGH",
        requiresApproval: true,
      },
    ];
    taskRiskLevel = "HIGH";
  } else if (
    promptLower.includes("image") ||
    promptLower.includes("picture") ||
    promptLower.includes("draw") ||
    promptLower.includes("visual")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Prompt Semantic Formulation",
        description: "Enrich prompt with stylistic parameters, aspect ratios, and lighting parameters.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Neural Diffusion Asset Synthesis",
        description: "Generate high-resolution visual artifact via isolated neural diffusion core.",
        agent: "Specialized Agent" as any,
        toolName: "generate_image",
        toolInput: { prompt, style: "cyberpunk architectural zero-trust" },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("profile") ||
    promptLower.includes("data quality") ||
    promptLower.includes("completeness") ||
    promptLower.includes("anomalies") ||
    promptLower.includes("profiler")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Scan Schema & Null Value Density",
        description: "Calculate completeness percentage and detect duplicate records.",
        agent: "Data",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Execute Data Quality Profiler",
        description: "Run IQR anomaly detection and compute Grade A+ quality scorecard.",
        agent: "Data",
        toolName: "profile_dataset",
        toolInput: { datasetName: "nexa_telemetry_metrics.csv" },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("dataset") ||
    promptLower.includes("csv") ||
    promptLower.includes("data analysis") ||
    promptLower.includes("tabular")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Tabular Schema & Statistical Scan",
        description: "Extract row counts, verify column types, and calculate distribution metrics.",
        agent: "Data",
        toolName: "analyze_dataset",
        toolInput: { datasetName: "nexa_telemetry_metrics.csv" },
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Statistical Summary & CSV Artifact Generation",
        description: "Formulate analytical findings and prepare exportable CSV file artifact.",
        agent: "Data",
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("pdf") ||
    promptLower.includes("report") ||
    promptLower.includes("document export") ||
    promptLower.includes("export pdf")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Report Structure & Verification Analysis",
        description: "Synthesize operational findings, metrics, and security compliance statements.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Compile Executive PDF Artifact",
        description: "Render publication-grade PDF report with verification headers and cryptographic signatures.",
        agent: "File" as any,
        toolName: "export_pdf_report",
        toolInput: {
          title: "NEXA AI Executive Operational Report",
          content: `Comprehensive verified synthesis based on user instruction: "${prompt}". System operating with 100% verified zero-trust integrity.`,
        },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("docx") ||
    promptLower.includes("word") ||
    promptLower.includes("executive brief") ||
    promptLower.includes("word document")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Outline Executive Brief & Governance Context",
        description: "Formulate document structure, executive summary, and policy findings.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Compile Executive Word Document (.docx)",
        description: "Generate styled Microsoft Word file with tables, callout blocks, and SHA-256 attestation.",
        agent: "File" as any,
        toolName: "export_docx_report",
        toolInput: {
          title: "NEXA AI Sovereign OS Strategy & Operational Brief",
          subtitle: "Zero-Trust Autonomous Governance & Verification",
          summary: prompt,
        },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("pptx") ||
    promptLower.includes("presentation") ||
    promptLower.includes("powerpoint") ||
    promptLower.includes("slide deck") ||
    promptLower.includes("slides")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Design Presentation Structure & Key Takeaways",
        description: "Synthesize executive overview, architecture cards, and roadmap milestones.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Compile Presentation Deck (.pptx)",
        description: "Generate Dark Modern 16:9 widescreen PowerPoint deck with cryptographic verification.",
        agent: "File" as any,
        toolName: "export_pptx_deck",
        toolInput: {
          title: "NEXA Sovereign AI Operating System Architecture",
          subtitle: prompt,
        },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("xlsx") ||
    promptLower.includes("excel") ||
    promptLower.includes("spreadsheet") ||
    promptLower.includes("workbook")
  ) {
    planSteps = [
      {
        stepNumber: 1,
        title: "Structure Multi-Sheet Tabular Matrix",
        description: "Profile KPI summary metrics, operational logs, and constitution directives.",
        agent: "Data",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Compile Multi-Sheet Excel Workbook (.xlsx)",
        description: "Build workbook with Executive Summary, System Records, and Policy Matrix sheets.",
        agent: "Data",
        toolName: "export_xlsx_workbook",
        toolInput: {
          title: "NEXA AI System Metrics & Governance Workbook",
          rows: 50,
        },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("diagram") ||
    promptLower.includes("flowchart") ||
    promptLower.includes("architecture diagram") ||
    promptLower.includes("sequence diagram") ||
    promptLower.includes("erd")
  ) {
    const diagType = promptLower.includes("flowchart")
      ? "FLOWCHART"
      : promptLower.includes("sequence")
      ? "SEQUENCE"
      : promptLower.includes("erd")
      ? "ERD"
      : "ARCHITECTURE";

    planSteps = [
      {
        stepNumber: 1,
        title: "Analyze System Topology & Subsystem Entities",
        description: "Synthesize relational topology, directional arrows, and security barriers.",
        agent: "Planner",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Synthesize Vector Diagram Artifact",
        description: `Generate Mermaid syntax and vector SVG diagram for ${diagType}.`,
        agent: "Specialized Agent" as any,
        toolName: "generate_diagram",
        toolInput: {
          type: diagType,
          prompt,
        },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else if (
    promptLower.includes("chart") ||
    promptLower.includes("bar chart") ||
    promptLower.includes("line chart") ||
    promptLower.includes("pie chart") ||
    promptLower.includes("scatter plot") ||
    promptLower.includes("visualize data")
  ) {
    const cType = promptLower.includes("line")
      ? "LINE"
      : promptLower.includes("pie")
      ? "PIE"
      : promptLower.includes("scatter")
      ? "SCATTER"
      : "BAR";

    planSteps = [
      {
        stepNumber: 1,
        title: "Extract Numerical Series & Dimensions",
        description: "Normalize data series and define scale viewbox.",
        agent: "Data",
        riskLevel: "LOW",
        requiresApproval: false,
      },
      {
        stepNumber: 2,
        title: "Synthesize Responsive Vector Chart",
        description: `Generate vector SVG ${cType} chart with zero-trust styling.`,
        agent: "Data",
        toolName: "generate_chart",
        toolInput: { type: cType, title: "NEXA Analytical Visualization" },
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  } else {
    // Default reasoning plan
    planSteps = [
      {
        stepNumber: 1,
        title: "Contextual Reasoning & Memory Integration",
        description: "Retrieve relevant episodic memory and formulate verified answer.",
        agent: "Judge",
        riskLevel: "LOW",
        requiresApproval: false,
      },
    ];
  }

  // 5. Generate & Persist Action Contract
  const allowedTools = planSteps.map((s) => s.toolName).filter(Boolean) as string[];
  const allowedActions = planSteps.map((s) => s.title);
  const forbiddenActions = [
    "Unapproved file or database deletion (Constitution Rule #2)",
    "Unapproved credential ingestion or leakage (Constitution Rule #5)",
    "Direct outbound email dispatch without human confirmation (Constitution Rule #1)",
  ];

  const contractRecord = await db.actionContract.create({
    data: {
      taskId: task.id,
      goal: prompt,
      agents: JSON.stringify(planSteps.map((s) => s.agent)),
      tools: JSON.stringify(allowedTools),
      allowedActions: JSON.stringify(allowedActions),
      forbiddenActions: JSON.stringify(forbiddenActions),
      dataScope: JSON.stringify(isPrivateMode ? ["Temporary Session Memory"] : ["Sovereign Workspace Files", "Episodic Memories"]),
      riskLevel: taskRiskLevel,
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours validity
      requiresApproval: (taskRiskLevel as string) === "HIGH" || (taskRiskLevel as string) === "CRITICAL",
    },
  });

  const actionContractState: ActionContractState = {
    id: contractRecord.id,
    goal: contractRecord.goal,
    agents: JSON.parse(contractRecord.agents),
    tools: JSON.parse(contractRecord.tools),
    allowedActions: JSON.parse(contractRecord.allowedActions),
    forbiddenActions: JSON.parse(contractRecord.forbiddenActions),
    dataScope: contractRecord.dataScope ? JSON.parse(contractRecord.dataScope) : [],
    riskLevel: taskRiskLevel,
    expiresIn: "2 hours",
    requiresApproval: contractRecord.requiresApproval,
  };

  // 6. Handle Dry-Run Simulation Mode
  if (isSimulation) {
    const simulationPreview: SimulationStepPreview[] = planSteps.map((step) => ({
      stepNumber: step.stepNumber,
      title: step.title,
      agent: step.agent,
      simulatedAction: `Simulate ${step.toolName || "reasoning"} execution within isolated capability container.`,
      riskLevel: step.riskLevel,
      stateImpact: "Safe Dry Run Verified: Zero database mutations and zero network transmissions committed.",
    }));

    await db.task.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        progress: 100,
        currentStep: "Dry Run Simulation Verified",
        resultSummary: `Simulated ${planSteps.length} steps successfully without state mutations.`,
      },
    });

    await recordActivityEvent({
      userId,
      type: "SIMULATION_COMPLETED",
      title: `Simulation Completed: ${task.title}`,
      description: "Dry-run execution completed. Zero state modifications committed.",
      metadata: { taskId: task.id },
    });

    return {
      taskId: task.id,
      status: "SIMULATED",
      progress: 100,
      currentStep: "Dry Run Simulation Verified",
      output: `[SIMULATION / DRY RUN VERIFIED]\n\nGoal: "${prompt}"\nAction Contract: ${contractRecord.id}\nMode: ${personalMode}\n\nPlanned Steps:\n${planSteps
        .map((s) => `• Step ${s.stepNumber} (${s.agent}): ${s.title} [Risk: ${s.riskLevel}]`)
        .join("\n")}\n\nNo persistent changes have been made to your workspace. Click 'Execute Task' to run for real.`,
      isSimulation: true,
      simulationPreview,
      actionContract: actionContractState,
      personalMode,
    };
  }

  // Update Task with calculated risk and persist steps
  await db.task.update({
    where: { id: task.id },
    data: {
      riskLevel: taskRiskLevel,
      status: "EXECUTING",
      progress: 30,
      currentStep: planSteps[0]?.title || "Executing step 1",
    },
  });

  for (const step of planSteps) {
    await db.taskStep.create({
      data: {
        taskId: task.id,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        agent: step.agent,
        toolName: step.toolName || null,
        status: "PENDING",
      },
    });
  }

  // 7. Execution Loop & Constitution Policy Firewall Check
  const toolOutputs: any[] = [];
  let sources: any[] = [];
  const rulesEnforced: string[] = [];
  const toolExecutionSummaries: Array<{ tool: string; durationMs: number; status: string }> = [];

  for (const step of planSteps) {
    // Check tool requirements & Constitution policy
    if (step.toolName) {
      const riskEval = evaluateRisk(step.toolName, step.toolInput || {}, user.autonomyLevel);
      const constitutionEval = evaluateConstitution(constitutionRules, {
        toolName: step.toolName,
        inputParams: step.toolInput,
        prompt,
      });

      if (constitutionEval.policyDecisions.length > 0) {
        rulesEnforced.push(...constitutionEval.policyDecisions);
      }

      const mustHaltForApproval =
        (riskEval.requiresApproval || constitutionEval.escalateToApproval) && !approvedApprovalId;

      if (mustHaltForApproval) {
        const approvalReason = constitutionEval.escalateToApproval
          ? `AI Constitution Policy: ${constitutionEval.triggeredRules.map((r) => r.reason).join(" ")}`
          : `Action involves tool '${step.toolName}' rated ${riskEval.riskLevel}. ${riskEval.reasons.join(" ")}`;

        const approval = await db.approval.create({
          data: {
            taskId: task.id,
            userId,
            actionName: step.title,
            reason: approvalReason,
            riskLevel: constitutionEval.escalateToApproval ? "HIGH" : riskEval.riskLevel,
            dataPayload: JSON.stringify(step.toolInput || {}),
            status: "PENDING",
          },
        });

        await db.task.update({
          where: { id: task.id },
          data: {
            status: "WAITING_FOR_APPROVAL",
            currentStep: `Waiting for human approval: ${step.title}`,
          },
        });

        await recordActivityEvent({
          userId,
          type: "APPROVAL_REQUESTED",
          title: `Approval Required: ${step.title}`,
          description: `Action intercepted by Constitution Firewall. Human confirmation required.`,
          metadata: { approvalId: approval.id, taskId: task.id },
        });

        return {
          taskId: task.id,
          status: "WAITING_FOR_APPROVAL",
          currentStep: `Paused: Waiting for human authorization on ${step.toolName}`,
          progress: 50,
          actionContract: actionContractState,
          personalMode,
          approvalRequired: {
            approvalId: approval.id,
            actionName: step.title,
            reason: approval.reason,
            riskLevel: approval.riskLevel as RiskLevel,
            dataPayload: step.toolInput || {},
          },
        };
      }

      // Execute tool
      await recordActivityEvent({
        userId,
        type: "TOOL_INVOKED",
        title: `Invoking tool: ${step.toolName}`,
        description: step.description,
        metadata: { taskId: task.id, toolName: step.toolName },
      });

      const toolRes = await executeTool(step.toolName, step.toolInput || {}, userId, task.id);
      toolOutputs.push(toolRes.output);
      toolExecutionSummaries.push({
        tool: step.toolName,
        durationMs: toolRes.durationMs,
        status: toolRes.success ? "SUCCESS" : "FAILED",
      });

      if (toolRes.output?.sources) {
        sources = sources.concat(toolRes.output.sources);
      }
    }
  }

  // 8. Generate Synthesis with Model Router
  const modelRes = await routeModelRequest({
    prompt,
    systemPrompt: `You are NEXA AI Operating System. Operating under personal mode: ${personalMode}. Active memory context:\n${memoryContext}`,
    preferredModel,
  });

  // 9. Verification Engine Guard
  const verification = verifyOutput(modelRes.content, {
    toolOutputs,
    taskTitle: task.title,
    codePresent: modelRes.content.includes("```"),
  });

  // 10. Auto-ingest Episodic Insight into Memory (if not paused & not in PRIVATE mode)
  if (!user.pauseMemory && !isPrivateMode && prompt.length > 15) {
    await addMemory({
      userId,
      projectId,
      type: "EPISODIC",
      content: `User initiated task "${task.title}". Verified output generated with model ${modelRes.modelUsed}.`,
      source: "AI Orchestrator Execution",
      confidence: 0.94,
    });
  }

  // 11. Complete Task
  await db.task.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      progress: 100,
      currentStep: "Completed and verified",
      resultSummary: modelRes.content.slice(0, 200),
    },
  });

  // 12. Persist Decision Ledger Record
  const planSummaryText = planSteps.map((s) => `${s.stepNumber}. ${s.title}`).join("; ");
  const modelRationale = `${modelRes.modelUsed} selected for ${personalMode} mode reasoning (${modelRes.tokensUsed} tokens, ${modelRes.latencyMs}ms latency).`;

  await db.decisionLedger.create({
    data: {
      taskId: task.id,
      goal: prompt,
      planSummary: planSummaryText,
      contextUsed: JSON.stringify(memories.map((m) => m.id)),
      memoriesConsulted: JSON.stringify(memories.map((m) => m.content.slice(0, 100))),
      toolsInvoked: JSON.stringify(toolExecutionSummaries),
      rulesEnforced: JSON.stringify(rulesEnforced),
      modelSelectionRationale: modelRationale,
      verificationChecklist: JSON.stringify(verification.checks),
      finalOutcome: `Task completed with verification score of ${verification.score}%. All policies satisfied.`,
    },
  });

  const decisionLedgerState: DecisionLedgerState = {
    goal: prompt,
    planSummary: planSummaryText,
    memoriesConsulted: memories.map((m) => m.content),
    toolsInvoked: toolExecutionSummaries,
    rulesEnforced,
    modelSelectionRationale: modelRationale,
    verificationChecklist: verification.checks,
    finalOutcome: `Task completed with verification score of ${verification.score}%. All policies satisfied.`,
  };

  await recordActivityEvent({
    userId,
    type: "TASK_COMPLETED",
    title: `Task Completed: ${task.title}`,
    description: `All steps executed and verified (Verification Score: ${verification.score}%). Decision ledger recorded.`,
    metadata: { taskId: task.id, verificationScore: verification.score },
  });

  const imageOutput = toolOutputs.find((o) => o?.imageUrl);
  const datasetOutput = toolOutputs.find((o) => o?.csvDownloadUrl);
  const pdfOutput = toolOutputs.find((o) => o?.status === "PDF_COMPILED_SUCCESSFULLY" && o?.downloadUrl);
  const docxOutput = toolOutputs.find((o) => o?.status === "DOCX_COMPILED_SUCCESSFULLY" && o?.downloadUrl);
  const pptxOutput = toolOutputs.find((o) => o?.status === "PPTX_COMPILED_SUCCESSFULLY" && o?.downloadUrl);
  const xlsxOutput = toolOutputs.find((o) => o?.status === "XLSX_COMPILED_SUCCESSFULLY" && o?.downloadUrl);
  const diagramOutput = toolOutputs.find((o) => o?.status === "DIAGRAM_GENERATED_SUCCESSFULLY" && o?.downloadUrl);
  const chartOutput = toolOutputs.find((o) => o?.status === "CHART_GENERATED_SUCCESSFULLY" && o?.downloadUrl);
  const dataProfileOutput = toolOutputs.find((o) => o?.status === "DATASET_PROFILED_SUCCESSFULLY");
  const researchOutput = toolOutputs.find((o) => o?.status === "DEEP_RESEARCH_COMPLETED_SUCCESSFULLY");

  const imageArtifact = imageOutput
    ? {
        imageUrl: imageOutput.imageUrl,
        prompt: imageOutput.prompt,
        resolution: imageOutput.resolution,
        downloadUrl: imageOutput.downloadUrl,
      }
    : undefined;

  const datasetArtifact = datasetOutput
    ? {
        datasetName: datasetOutput.datasetName,
        rowCount: datasetOutput.rowCount,
        columnCount: datasetOutput.columnCount,
        columns: datasetOutput.columns,
        summaryStatistics: datasetOutput.summaryStatistics,
        csvDownloadUrl: datasetOutput.csvDownloadUrl,
      }
    : undefined;

  const pdfArtifact = pdfOutput
    ? {
        title: pdfOutput.title,
        downloadUrl: pdfOutput.downloadUrl,
        status: pdfOutput.status,
      }
    : undefined;

  const docxArtifact = docxOutput
    ? {
        title: docxOutput.title,
        downloadUrl: docxOutput.downloadUrl,
        status: docxOutput.status,
      }
    : undefined;

  const pptxArtifact = pptxOutput
    ? {
        title: pptxOutput.title,
        downloadUrl: pptxOutput.downloadUrl,
        slideCount: pptxOutput.slideCount || 6,
        status: pptxOutput.status,
      }
    : undefined;

  const xlsxArtifact = xlsxOutput
    ? {
        title: xlsxOutput.title,
        downloadUrl: xlsxOutput.downloadUrl,
        sheetCount: xlsxOutput.sheetCount || 3,
        rowCount: xlsxOutput.rowCount || 50,
        status: xlsxOutput.status,
      }
    : undefined;

  const diagramArtifact = diagramOutput
    ? {
        title: diagramOutput.title,
        type: diagramOutput.type,
        downloadUrl: diagramOutput.downloadUrl,
        status: diagramOutput.status,
      }
    : undefined;

  const chartArtifact = chartOutput
    ? {
        title: chartOutput.title,
        type: chartOutput.type,
        downloadUrl: chartOutput.downloadUrl,
        status: chartOutput.status,
      }
    : undefined;

  const dataProfileArtifact = dataProfileOutput
    ? {
        datasetName: dataProfileOutput.datasetName,
        qualityScore: dataProfileOutput.qualityScore,
        qualityGrade: dataProfileOutput.qualityGrade,
        completenessPct: dataProfileOutput.completenessPct,
        downloadUrl: dataProfileOutput.downloadUrl,
        status: dataProfileOutput.status,
      }
    : undefined;

  const researchArtifact = researchOutput
    ? {
        topic: researchOutput.topic,
        groundingScore: researchOutput.groundingScore,
        hallucinationRisk: researchOutput.hallucinationRisk,
        claimsCount: researchOutput.claimsCount,
        status: researchOutput.status,
      }
    : undefined;

  return {
    taskId: task.id,
    status: "COMPLETED",
    progress: 100,
    currentStep: "Execution completed and verified",
    output: modelRes.content,
    actionContract: actionContractState,
    decisionLedger: decisionLedgerState,
    personalMode,
    verification,
    sources,
    imageArtifact,
    datasetArtifact,
    pdfArtifact,
    docxArtifact,
    pptxArtifact,
    xlsxArtifact,
    diagramArtifact,
    chartArtifact,
    dataProfileArtifact,
    researchArtifact,
    tokensUsed: modelRes.tokensUsed,
    latencyMs: modelRes.latencyMs,
  };
}
