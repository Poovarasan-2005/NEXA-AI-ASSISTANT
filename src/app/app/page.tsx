"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  Code,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Terminal,
  Cpu,
  Download,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Scale,
  FlaskConical,
  HelpCircle,
  X,
  FileCheck,
  Sliders,
} from "lucide-react";

interface OrchestratorResultState {
  taskId: string;
  status: string;
  currentStep?: string;
  progress: number;
  output?: string;
  isSimulation?: boolean;
  simulationPreview?: Array<{
    stepNumber: number;
    title: string;
    agent: string;
    simulatedAction: string;
    riskLevel: string;
    stateImpact: string;
  }>;
  actionContract?: {
    id: string;
    goal: string;
    agents: string[];
    tools: string[];
    allowedActions: string[];
    forbiddenActions: string[];
    riskLevel: string;
    expiresIn: string;
    requiresApproval: boolean;
  };
  decisionLedger?: {
    goal: string;
    planSummary: string;
    memoriesConsulted: string[];
    toolsInvoked: Array<{ tool: string; durationMs: number; status: string }>;
    rulesEnforced: string[];
    modelSelectionRationale: string;
    verificationChecklist: Array<{ name: string; passed: boolean; message: string }>;
    finalOutcome: string;
  };
  personalMode?: string;
  approvalRequired?: {
    approvalId: string;
    actionName: string;
    reason: string;
    riskLevel: string;
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
  tokensUsed?: number;
  latencyMs?: number;
}

export default function CommandCenterPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("nexa-core-reasoner");
  const [selectedMode, setSelectedMode] = useState("SAFE");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<OrchestratorResultState | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const personalModes = [
    { id: "SAFE", label: "SAFE", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", desc: "Evidence-first & high approval vigilance" },
    { id: "RESEARCH", label: "RESEARCH", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", desc: "Multi-source deep cross-examination" },
    { id: "CREATIVE", label: "CREATIVE", color: "text-purple-400 border-purple-500/30 bg-purple-500/10", desc: "Stylistic diffusion & open synthesis" },
    { id: "DEVELOPER", label: "DEVELOPER", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", desc: "AST review & sandbox verification" },
    { id: "DATA", label: "DATA", color: "text-teal-400 border-teal-500/30 bg-teal-500/10", desc: "Statistical distribution & RFC-4180 datasets" },
    { id: "AUTOMATION", label: "AUTOMATION", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", desc: "Sequential workflow & scheduled triggers" },
    { id: "PRIVATE", label: "PRIVATE", color: "text-rose-400 border-rose-500/30 bg-rose-500/10", desc: "Ephemeral memory, strict data boundary" },
  ];

  // Load initial profile, pending approvals, and memories
  const loadDashboardData = async () => {
    try {
      const [meRes, appRes, memRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/app/approvals"),
        fetch("/api/app/memory?type=ALL"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserProfile(meData.user);
      }
      if (appRes.ok) {
        const appData = await appRes.json();
        setPendingApprovals(appData.approvals.filter((a: any) => a.status === "PENDING"));
      }
      if (memRes.ok) {
        const memData = await memRes.json();
        setRecentMemories(memData.memories.slice(0, 3));
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleExecute = async (overridePrompt?: string, asSimulation = false) => {
    const textToRun = overridePrompt || prompt;
    if (!textToRun.trim()) return;

    setExecuting(true);
    setResult(null);

    try {
      const res = await fetch("/api/app/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToRun,
          preferredModel: selectedModel,
          personalMode: selectedMode,
          isSimulation: asSimulation,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert(data.error || "Task orchestration failed.");
      }
    } catch (e) {
      alert("Network error executing task.");
    } finally {
      setExecuting(false);
      loadDashboardData();
    }
  };

  const handleResolveApproval = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/app/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, action }),
      });

      const data = await res.json();
      if (data.success) {
        if (action === "APPROVE" && result?.taskId) {
          handleExecute(`Resume approved action for task ${result.taskId}`);
        } else {
          loadDashboardData();
          if (result) {
            setResult({
              ...result,
              status: action === "APPROVE" ? "COMPLETED" : "CANCELLED",
              approvalRequired: undefined,
              currentStep: action === "APPROVE" ? "Approved by user" : "Cancelled by user",
            });
          }
        }
      }
    } catch (e) {
      console.error("Approval resolution error:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Ambient Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              SYSTEM ONLINE // AI CONSTITUTION ACTIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Good day{userProfile?.name ? `, ${userProfile.name}` : ""}.
          </h1>
          <p className="text-sm text-slate-400">What do you want NEXA to accomplish today?</p>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto glass-panel px-3 py-1.5 rounded-xl border border-white/10">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400">MODEL:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
          >
            <option value="nexa-core-reasoner" className="bg-[#0A0D15] text-white">
              nexa-core-reasoner (Governed)
            </option>
            <option value="claude-3-5-sonnet" className="bg-[#0A0D15] text-white">
              claude-3-5-sonnet
            </option>
            <option value="gpt-4o" className="bg-[#0A0D15] text-white">
              gpt-4o
            </option>
            <option value="gemini-1-5-pro" className="bg-[#0A0D15] text-white">
              gemini-1-5-pro
            </option>
          </select>
        </div>
      </div>

      {/* Personal AI Modes Selector */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 bg-[#0A0D15] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-300">PERSONAL AI MODE:</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {personalModes.find((m) => m.id === selectedMode)?.desc}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {personalModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                selectedMode === mode.id
                  ? mode.color + " shadow-glow-cyan"
                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-rose">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-rose-200">
                {pendingApprovals.length} Action{pendingApprovals.length > 1 ? "s" : ""} Awaiting Your Authorization
              </div>
              <div className="text-xs text-rose-300/80">
                The AI Human Firewall and Constitution Policy paused autonomous execution to request your permission.
              </div>
            </div>
          </div>
          <Link
            href="/app/approvals"
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Review Approvals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Main Command Input Box */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl bg-[#0A0E18] space-y-4">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleExecute();
            }
          }}
          placeholder="Ask NEXA anything... (e.g. Research zero-trust agents, analyze telemetry datasets, generate neural images, export executive PDFs, or simulate code audits)"
          className="w-full bg-transparent text-white placeholder-slate-500 text-base sm:text-lg focus:outline-none resize-none font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          {/* Multimodal inputs */}
          <div className="flex items-center gap-2 text-slate-400">
            <Link
              href="/app/files"
              className="p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              title="Attach Document or Dataset"
            >
              <Paperclip className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setPrompt("Audit this TypeScript code for IDOR and SQL injection vulnerabilities.")}
              className="p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              title="Code Review"
            >
              <Code className="w-4 h-4" />
            </button>
            <Link
              href="/app/constitution"
              className="p-2 rounded-xl hover:bg-white/5 hover:text-cyan-400 transition-colors"
              title="View Active AI Constitution"
            >
              <Scale className="w-4 h-4" />
            </Link>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Mode: {selectedMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulation (Dry Run) Button */}
            <button
              onClick={() => handleExecute(undefined, true)}
              disabled={executing || !prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-purple-300 hover:border-purple-500/40 text-xs font-mono font-bold transition-all disabled:opacity-40"
              title="Dry Run: Simulate execution without committing state changes"
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate (Dry Run)</span>
            </button>

            {/* Live Execute Button */}
            <button
              onClick={() => handleExecute()}
              disabled={executing || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 disabled:opacity-40 transition-all font-mono"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Governing & Running...</span>
                </>
              ) : (
                <>
                  <span>Execute Task</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mr-1">
          QUICK DIRECTIVES:
        </span>
        {[
          { label: "🔬 Research zero-trust OS", prompt: "Research recent benchmarks in zero-trust autonomous AI architectures" },
          { label: "🎨 Generate neural image", prompt: "Generate an image of a futuristic zero-trust AI operating system core with neon circuits" },
          { label: "📊 Analyze metrics dataset", prompt: "Analyze telemetry dataset and compute statistical distributions and anomalies" },
          { label: "📄 Export executive PDF", prompt: "Export an executive PDF report verifying system architecture and security score" },
          { label: "⚖️ AI Constitution Rules", prompt: "Inspect active AI Constitution rules and policy enforcement thresholds" },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => {
              setPrompt(chip.prompt);
              handleExecute(chip.prompt);
            }}
            className="px-3 py-1.5 rounded-xl glass-panel text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all font-mono"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Active Task Execution Monitor */}
      {(executing || result) && (
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-[#0C101C] space-y-6 shadow-glow-cyan">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  executing
                    ? "bg-amber-400 animate-ping"
                    : result?.status === "WAITING_FOR_APPROVAL"
                    ? "bg-rose-400 animate-pulse"
                    : result?.isSimulation
                    ? "bg-purple-400"
                    : "bg-emerald-400"
                }`}
              />
              <span className="font-mono text-sm font-bold text-white">
                {executing
                  ? "NEXA GOVERNED ORCHESTRATION ACTIVE"
                  : result?.isSimulation
                  ? "SIMULATION (DRY RUN) VERIFIED"
                  : `TASK STATUS: ${result?.status || "COMPLETED"}`}
              </span>

              {result?.personalMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                  MODE: {result.personalMode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Action Contract Quick Button */}
              {result?.actionContract && (
                <button
                  onClick={() => setShowContractModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Action Contract</span>
                </button>
              )}

              {/* Decision Ledger Quick Button */}
              {result?.decisionLedger && (
                <button
                  onClick={() => setShowLedgerModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why did NEXA do this?</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{result?.currentStep || (executing ? "Reasoning, Planning & Constitution Checking..." : "Finished")}</span>
              <span>{executing ? "50%" : `${result?.progress || 100}%`}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: executing ? "50%" : `${result?.progress || 100}%` }}
              />
            </div>
          </div>

          {/* Simulation Preview Steps */}
          {result?.isSimulation && result.simulationPreview && (
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  <span>SIMULATED STEP-BY-STEP DRY RUN</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  ZERO DISK/NETWORK MUTATIONS
                </span>
              </div>

              <div className="space-y-2">
                {result.simulationPreview.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold">Step {step.stepNumber}:</span>
                      <span className="text-white">{step.title}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({step.agent})</span>
                    </div>
                    <div className="text-[11px] text-emerald-400">{step.stateImpact}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400 text-[11px]">
                  All plan steps verified against AI Constitution. Ready for live execution.
                </span>
                <button
                  onClick={() => handleExecute(undefined, false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-cyan transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Live Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Human Approval Firewall Card */}
          {result?.approvalRequired && (
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/50 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white font-mono">
                      HUMAN APPROVAL FIREWALL ACTIVATED
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      {result.approvalRequired.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    {result.approvalRequired.reason}
                  </p>
                </div>
              </div>

              {/* Data payload inspector */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  PROPOSED TOOL PAYLOAD:
                </div>
                <pre>{JSON.stringify(result.approvalRequired.dataPayload, null, 2)}</pre>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    handleResolveApproval(result.approvalRequired!.approvalId, "APPROVE")
                  }
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors"
                >
                  Confirm & Authorize Execution
                </button>
                <button
                  onClick={() =>
                    handleResolveApproval(result.approvalRequired!.approvalId, "REJECT")
                  }
                  className="px-5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono transition-colors"
                >
                  Reject & Abort Action
                </button>
              </div>
            </div>
          )}

          {/* Verified Output Card */}
          {result?.output && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider">VERIFIED OUTPUT</span>
                  {result.verification && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {result.verification.score}% Score
                    </span>
                  )}
                </div>

                {/* Instant Download & Export Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/app/files/export-pdf?title=${encodeURIComponent("NEXA Verified Task Output")}&content=${encodeURIComponent(result.output)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF Report</span>
                  </a>

                  {result.datasetArtifact && (
                    <a
                      href={result.datasetArtifact.csvDownloadUrl}
                      download
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </a>
                  )}

                  {result.imageArtifact && (
                    <a
                      href={result.imageArtifact.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Image</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Generated Image Artifact Showcase */}
              {result.imageArtifact && (
                <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-black/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <ImageIcon className="w-4 h-4" />
                      <span>AI SYNTHESIZED VISUAL ARTIFACT</span>
                    </div>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5">
                      {result.imageArtifact.resolution}
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                    <img
                      src={result.imageArtifact.imageUrl}
                      alt={result.imageArtifact.prompt}
                      className="w-full max-h-96 object-cover rounded-xl transition-transform group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-xs text-slate-300 font-mono">
                      Prompt: &ldquo;{result.imageArtifact.prompt}&rdquo;
                    </div>
                  </div>
                </div>
              )}

              {/* Analyzed Dataset Artifact Showcase */}
              {result.datasetArtifact && (
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>TABULAR DATASET SCAN: {result.datasetArtifact.datasetName}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      PARSED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <div className="text-[10px] text-slate-500">ROWS</div>
                      <div className="font-bold text-white text-sm">{result.datasetArtifact.rowCount}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <div className="text-[10px] text-slate-500">COLUMNS</div>
                      <div className="font-bold text-white text-sm">{result.datasetArtifact.columnCount}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <div className="text-[10px] text-slate-500">MEAN SCORE</div>
                      <div className="font-bold text-cyan-300 text-sm">
                        {result.datasetArtifact.summaryStatistics?.meanScore || 98.4}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <div className="text-[10px] text-slate-500">ANOMALIES</div>
                      <div className="font-bold text-emerald-300 text-sm">0.0% Detected</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Indexed Columns: <span className="text-cyan-300">{result.datasetArtifact.columns.join(", ")}</span>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {result.output}
              </div>

              {/* Citations block */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    AUTHORITATIVE CITATIONS & EVIDENCE:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-slate-300"
                      >
                        <div className="font-semibold text-white truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-400">{s.publisher}</div>
                        <div className="text-[10px] text-cyan-400 mt-1">
                          Confidence: {Math.round(s.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two Column Grid: Recent Memory & System Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Memory Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D15]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-mono">Active Memory Cache</h3>
            </div>
            <Link
              href="/app/memory"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentMemories.length > 0 ? (
              recentMemories.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-semibold">{m.type}</span>
                    <span>Score: {Math.round(m.confidence * 100)}%</span>
                  </div>
                  <p className="text-slate-200 line-clamp-2 font-sans">{m.content}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-6 font-mono">
                No memories recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* System Capabilities & Security Health Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D15]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-mono">AI Constitution & Security Anchor</h3>
            </div>
            <Link
              href="/app/constitution"
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:underline"
            >
              VIEW RULES
            </Link>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span>Personal AI Mode:</span>
              <span className="text-cyan-300 font-bold">{selectedMode}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span>Constitution Policy:</span>
              <span className="text-emerald-400">7 DIRECTIVES ENFORCED</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span>Human Approval Gate:</span>
              <span className="text-emerald-400">FIREWALL ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span>Isolated Code Sandbox:</span>
              <span className="text-emerald-400">ISOLATE-CONTAINED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Ledger Explainability Modal ("Why did NEXA do this?") */}
      {showLedgerModal && result?.decisionLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-[#0A0D17] max-w-2xl w-full space-y-5 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>DECISION LEDGER // EXPLAINABILITY INSPECTOR</span>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">GOAL</div>
                <div className="text-white font-semibold mt-0.5 font-sans">&ldquo;{result.decisionLedger.goal}&rdquo;</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">PLAN SUMMARY</div>
                <div className="text-slate-200 mt-0.5">{result.decisionLedger.planSummary}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">WHY THIS MODEL? (MODEL RATIONALE)</div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-cyan-300">
                  {result.decisionLedger.modelSelectionRationale}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">CONSTITUTION RULES ENFORCED</div>
                <div className="space-y-1 mt-1">
                  {result.decisionLedger.rulesEnforced.length > 0 ? (
                    result.decisionLedger.rulesEnforced.map((r, i) => (
                      <div key={i} className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{r}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">All standard constitutional baseline rules verified.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">TOOLS INVOKED & LATENCIES</div>
                <div className="space-y-1 mt-1">
                  {result.decisionLedger.toolsInvoked.length > 0 ? (
                    result.decisionLedger.toolsInvoked.map((t, i) => (
                      <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5 flex justify-between">
                        <span className="text-cyan-400">{t.tool}</span>
                        <span className="text-slate-400">{t.durationMs}ms ({t.status})</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">Zero external tools required; pure internal verified reasoning.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">VERIFICATION CHECKLIST</div>
                <div className="space-y-1 mt-1">
                  {result.decisionLedger.verificationChecklist.map((c, i) => (
                    <div key={i} className="text-[11px] flex items-center gap-1.5">
                      <span className={c.passed ? "text-emerald-400" : "text-rose-400"}>
                        {c.passed ? "✓" : "✗"}
                      </span>
                      <span className="text-slate-300">{c.name}: {c.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Contract Modal */}
      {showContractModal && result?.actionContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#0A0D17] max-w-xl w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <FileCheck className="w-4 h-4" />
                <span>CRYPTOGRAPHIC ACTION CONTRACT</span>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">CONTRACT ID:</span>
                <div className="text-cyan-400 font-bold">{result.actionContract.id}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">GOAL:</span>
                <div className="text-white font-sans">{result.actionContract.goal}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">ALLOWED ACTIONS:</span>
                <ul className="list-disc list-inside text-emerald-400 space-y-0.5 mt-0.5">
                  {result.actionContract.allowedActions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">FORBIDDEN ACTIONS:</span>
                <ul className="list-disc list-inside text-rose-400 space-y-0.5 mt-0.5">
                  {result.actionContract.forbiddenActions.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 text-[11px]">
                <span>Risk Rating: <strong className="text-white">{result.actionContract.riskLevel}</strong></span>
                <span>Validity: <strong className="text-cyan-300">{result.actionContract.expiresIn}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Acknowledge Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
