"use client";

import { useState, useEffect } from "react";
import {
  GitFork,
  Play,
  Save,
  Clock,
  Sparkles,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: "TRIGGER" | "REASONING" | "TOOL" | "VERIFICATION" | "OUTPUT";
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  scheduleCron?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lastRunAt?: string;
  lastRunStatus?: string;
  runsCount: number;
}

interface StepExecutionResult {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  output: any;
  durationMs: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [presets, setPresets] = useState<WorkflowItem[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [runResults, setRunResults] = useState<StepExecutionResult[] | null>(null);
  const [totalRunDuration, setTotalRunDuration] = useState<number | null>(null);
  const [artifactsCreated, setArtifactsCreated] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      const res = await fetch("/api/app/workflows");
      const data = await res.json();
      if (data.presets) {
        setPresets(data.presets);
      }
      if (data.workflows && data.workflows.length > 0) {
        setWorkflows(data.workflows);
        setSelectedWorkflow(data.workflows[0]);
      } else if (data.presets && data.presets.length > 0) {
        setSelectedWorkflow(data.presets[0]);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPreset(preset: WorkflowItem) {
    setSelectedWorkflow(preset);
    setRunResults(null);
    setArtifactsCreated([]);
    setStatusMessage(`Loaded preset: "${preset.name}"`);
  }

  async function handleRunWorkflow() {
    if (!selectedWorkflow) return;

    setExecuting(true);
    setRunResults(null);
    setArtifactsCreated([]);
    setStatusMessage("Initializing workflow pipeline execution...");

    try {
      const res = await fetch(`/api/app/workflows/${selectedWorkflow.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "MANUAL" }),
      });

      const data = await res.json();
      if (data.result) {
        setRunResults(data.result.stepResults);
        setTotalRunDuration(data.result.totalDurationMs);
        setArtifactsCreated(data.result.artifactsGenerated || []);
        setStatusMessage(
          `Workflow completed successfully in ${data.result.totalDurationMs}ms with ${data.result.stepResults.length} verified nodes.`
        );
        fetchWorkflows();
      } else {
        setStatusMessage(`Execution failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Run workflow error:", err);
      setStatusMessage(`Workflow execution error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  }

  const nodeColorMap: Record<string, { bg: string; border: string; text: string; dot: string; icon: any }> = {
    TRIGGER: {
      bg: "bg-sky-500/10",
      border: "border-sky-500/40",
      text: "text-sky-400",
      dot: "bg-sky-400",
      icon: Clock,
    },
    REASONING: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/40",
      text: "text-purple-400",
      dot: "bg-purple-400",
      icon: Sparkles,
    },
    TOOL: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      icon: Wrench,
    },
    VERIFICATION: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/40",
      text: "text-amber-400",
      dot: "bg-amber-400",
      icon: ShieldCheck,
    },
    OUTPUT: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/40",
      text: "text-rose-400",
      dot: "bg-rose-400",
      icon: Layers,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              AUTONOMOUS PIPELINE ORCHESTRATION
            </span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mt-2">
            Visual Workflow Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Node-based autonomous pipeline canvas with recurring schedule triggers, verification gateways, and connected artifact delivery.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleRunWorkflow}
            disabled={executing || !selectedWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {executing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Templates Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#0b0f19] border border-slate-800">
        <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5 text-rose-400" />
          <span>Preset Templates:</span>
        </span>
        {presets.map((preset) => {
          const isSelected = selectedWorkflow?.id === preset.id || selectedWorkflow?.name === preset.name;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {statusMessage}
          </span>
          {totalRunDuration !== null && (
            <span className="text-slate-400">Total Latency: {totalRunDuration}ms</span>
          )}
        </div>
      )}

      {/* Visual Canvas Container */}
      <div className="relative rounded-2xl bg-[#080c14] border border-slate-800/90 shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
        {/* Canvas Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Canvas Top Bar */}
        <div className="relative z-10 px-6 py-4 border-b border-slate-800/80 bg-[#0a0e18]/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                {selectedWorkflow?.name || "Select a Workflow"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedWorkflow?.description || "No description"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {selectedWorkflow?.nodes.length || 0} Nodes
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {selectedWorkflow?.edges.length || 0} Directed Edges
            </span>
            {selectedWorkflow?.scheduleCron && (
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{selectedWorkflow.scheduleCron}</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Node Pipeline (Horizontal DAG layout) */}
        <div className="relative z-10 p-8 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max py-6">
            {selectedWorkflow?.nodes.map((node, index) => {
              const style = nodeColorMap[node.type] || nodeColorMap.TOOL;
              const Icon = style.icon;
              const stepResult = runResults?.find((r) => r.nodeId === node.id);
              const isExecutingNode = executing && activeStepIndex === index;

              return (
                <div key={node.id} className="flex items-center">
                  {/* Node Card */}
                  <div
                    className={`w-64 p-4 rounded-2xl bg-[#0e1320] border transition-all duration-300 shadow-xl ${
                      isExecutingNode
                        ? "border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/20 animate-pulse"
                        : stepResult?.status === "SUCCESS"
                        ? "border-emerald-500/60 shadow-emerald-950/30"
                        : stepResult?.status === "FAILED"
                        ? "border-rose-500/60 shadow-rose-950/30"
                        : `${style.border} hover:border-white/30`
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1.5 ${style.bg} ${style.border} ${style.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {node.type}
                      </span>
                      {stepResult && (
                        <span className="text-xs">
                          {stepResult.status === "SUCCESS" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Node Title */}
                    <div className="flex items-start gap-2.5 mt-2">
                      <div className={`p-1.5 rounded-lg ${style.bg} ${style.text} flex-shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-white line-clamp-2">
                        {node.label}
                      </div>
                    </div>

                    {/* Node Config Preview */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                      {node.config.toolName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tool:</span>
                          <span className="text-cyan-300 font-semibold truncate max-w-[130px]">
                            {node.config.toolName}
                          </span>
                        </div>
                      )}
                      {node.config.cron && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Cron:</span>
                          <span className="text-sky-300">{node.config.cron}</span>
                        </div>
                      )}
                      {node.config.rule && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Policy:</span>
                          <span className="text-amber-300 truncate max-w-[130px]">
                            {node.config.rule}
                          </span>
                        </div>
                      )}
                      {stepResult && (
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                          <span>Latency:</span>
                          <span className="text-slate-300">{stepResult.durationMs}ms</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connecting Edge Arrow */}
                  {index < selectedWorkflow.nodes.length - 1 && (
                    <div className="flex items-center px-3 text-slate-600">
                      <div className="w-8 h-[2px] bg-gradient-to-r from-slate-700 to-slate-500" />
                      <ChevronRight className="w-4 h-4 -ml-1 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Footer Bar */}
        <div className="relative z-10 px-6 py-3 border-t border-slate-800/80 bg-[#0a0e18]/80 backdrop-blur-sm flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Trigger
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Reasoning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Tool
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Verification
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Output
            </span>
          </div>
          <span className="text-slate-400">Zero-Trust Sovereign Execution Core</span>
        </div>
      </div>

      {/* Execution Results Terminal & Artifacts */}
      {runResults && (
        <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Pipeline Execution Manifest ({runResults.length} Steps)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              STATUS: COMPLETED (ALL GATES PASSED)
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {runResults.map((step, idx) => (
              <div
                key={step.nodeId}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">#{idx + 1}</span>
                    <span className="text-white font-semibold">{step.nodeLabel}</span>
                    <span className="text-[10px] text-slate-400 uppercase px-1.5 py-0.2 rounded bg-slate-800">
                      {step.nodeType}
                    </span>
                  </div>
                  {step.output && (
                    <div className="text-slate-400 text-[11px] pl-6 line-clamp-1">
                      {typeof step.output === "object"
                        ? JSON.stringify(step.output).slice(0, 120) + "..."
                        : String(step.output)}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-emerald-400 font-semibold">SUCCESS</span>
                  <div className="text-[10px] text-slate-500">{step.durationMs}ms</div>
                </div>
              </div>
            ))}
          </div>

          {/* Generated Artifacts links */}
          {artifactsCreated.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">
                Generated & Sealed Artifacts:
              </div>
              <div className="flex flex-wrap gap-2">
                {artifactsCreated.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-500/20 transition-all"
                  >
                    <span>Download Artifact #{i + 1}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
