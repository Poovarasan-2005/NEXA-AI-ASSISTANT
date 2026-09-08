export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AgentType =
  | "Planner"
  | "Research"
  | "Coding"
  | "File"
  | "Browser"
  | "Data"
  | "Memory"
  | "Verification"
  | "Judge";

export type TaskStatus =
  | "CREATED"
  | "PLANNING"
  | "EXECUTING"
  | "WAITING_FOR_TOOL"
  | "WAITING_FOR_APPROVAL"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "PAUSED"
  | "CANCELLED"
  | "SIMULATED";

export type PersonalAIMode =
  | "SAFE"
  | "RESEARCH"
  | "CREATIVE"
  | "DEVELOPER"
  | "DATA"
  | "AUTOMATION"
  | "PRIVATE";

export interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
  agent: AgentType;
  toolName?: string;
  toolInput?: Record<string, any>;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
}

export interface ActionContractState {
  id: string;
  goal: string;
  agents: string[];
  tools: string[];
  allowedActions: string[];
  forbiddenActions: string[];
  dataScope: string[];
  riskLevel: RiskLevel;
  expiresIn: string;
  requiresApproval: boolean;
}

export interface DecisionLedgerState {
  id?: string;
  goal: string;
  planSummary: string;
  memoriesConsulted: string[];
  toolsInvoked: Array<{ tool: string; durationMs: number; status: string }>;
  rulesEnforced: string[];
  modelSelectionRationale: string;
  verificationChecklist: Array<{ name: string; passed: boolean; message: string }>;
  finalOutcome: string;
}

export interface SimulationStepPreview {
  stepNumber: number;
  title: string;
  agent: string;
  simulatedAction: string;
  riskLevel: RiskLevel;
  stateImpact: string;
}

export interface OrchestrationResult {
  taskId: string;
  status: TaskStatus;
  currentStep?: string;
  progress: number;
  output?: string;
  isSimulation?: boolean;
  simulationPreview?: SimulationStepPreview[];
  actionContract?: ActionContractState;
  decisionLedger?: DecisionLedgerState;
  personalMode?: PersonalAIMode;
  approvalRequired?: {
    approvalId: string;
    actionName: string;
    reason: string;
    riskLevel: RiskLevel;
    dataPayload: Record<string, any>;
  };
  verification?: {
    passed: boolean;
    score: number;
    checks: Array<{ name: string; passed: boolean; message: string }>;
  };
  sources?: Array<{ title: string; url?: string; publisher?: string; confidence: number }>;
  imageArtifact?: {
    imageUrl: string;
    prompt: string;
    resolution: string;
    downloadUrl: string;
  };
  datasetArtifact?: {
    datasetName: string;
    rowCount: number;
    columnCount: number;
    columns: string[];
    summaryStatistics: Record<string, any>;
    csvDownloadUrl: string;
  };
  pdfArtifact?: {
    title: string;
    downloadUrl: string;
    status: string;
  };
  docxArtifact?: {
    title: string;
    downloadUrl: string;
    status: string;
  };
  pptxArtifact?: {
    title: string;
    downloadUrl: string;
    slideCount: number;
    status: string;
  };
  xlsxArtifact?: {
    title: string;
    downloadUrl: string;
    sheetCount: number;
    rowCount: number;
    status: string;
  };
  diagramArtifact?: {
    title: string;
    type: string;
    downloadUrl: string;
    status: string;
  };
  chartArtifact?: {
    title: string;
    type: string;
    downloadUrl: string;
    status: string;
  };
  dataProfileArtifact?: {
    datasetName: string;
    qualityScore: number;
    qualityGrade: string;
    completenessPct: number;
    downloadUrl: string;
    status: string;
  };
  researchArtifact?: {
    topic: string;
    groundingScore: number;
    hallucinationRisk: string;
    claimsCount: number;
    status: string;
  };
  tokensUsed?: number;
  latencyMs?: number;
}
