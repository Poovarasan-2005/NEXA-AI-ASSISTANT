"use client";

import { useState } from "react";
import { Database, Brain, Network, Wrench, Play, ShieldCheck, UserCheck, ChevronDown, Check, Sparkles } from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  label: string;
  role: string;
  icon: any;
  color: string;
  borderGlow: string;
  activeMetrics: string;
}

const STAGES: PipelineStage[] = [
  {
    id: "memory",
    name: "MEMORY",
    label: "Continuous Multi-Tier Store",
    role: "Injects episodic, semantic & preference records without context leakage.",
    icon: Database,
    color: "text-cyan-400",
    borderGlow: "border-cyan-500/50 shadow-glow-cyan",
    activeMetrics: "Indexed Nodes: 14,892 | Recall Latency: 4ms",
  },
  {
    id: "reasoning",
    name: "REASONING",
    label: "Zero-Trust Intent Disambiguation",
    role: "Analyzes semantic intent, evaluates constraints, filters adversarial prompts.",
    icon: Brain,
    color: "text-purple-400",
    borderGlow: "border-purple-500/50 shadow-glow-violet",
    activeMetrics: "Prompt Injection Filter: ACTIVE | Multi-Agent Consensus: 99.2%",
  },
  {
    id: "planning",
    name: "PLANNING",
    label: "Subtask Decomposition Engine",
    role: "Deconstructs complex goals into verifiable subtasks with risk boundaries.",
    icon: Network,
    color: "text-blue-400",
    borderGlow: "border-blue-500/50 shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)]",
    activeMetrics: "Dynamic DAG: 4 Parallel Branches | Checkpoint Fallback: Ready",
  },
  {
    id: "tools",
    name: "TOOLS",
    label: "Permission-Gated Tool Registry",
    role: "Attaches sandbox execution environments, MCP servers, and verified APIs.",
    icon: Wrench,
    color: "text-amber-400",
    borderGlow: "border-amber-500/50 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]",
    activeMetrics: "Connected Connectors: 18 | Micro-Sandbox Isolation: v8-isolate",
  },
  {
    id: "execution",
    name: "EXECUTION",
    label: "Sandboxed Autonomous Run",
    role: "Executes low-risk operations and packages high-risk actions for confirmation.",
    icon: Play,
    color: "text-rose-400",
    borderGlow: "border-rose-500/50 shadow-glow-rose",
    activeMetrics: "Execution Boundary: Strict Containment | Memory Cap: 512MB",
  },
  {
    id: "verification",
    name: "VERIFICATION",
    label: "Factual & Security Judge",
    role: "Validates citations, checks code syntax, scrubs accidental credential leaks.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    borderGlow: "border-emerald-500/50 shadow-glow-emerald",
    activeMetrics: "Factual Grounding: 100% | Secret Scrubbing: PASS",
  },
  {
    id: "user",
    name: "USER",
    label: "Sovereign Human Control",
    role: "Human Approval Firewall. The user retains ultimate authority over high-impact actions.",
    icon: UserCheck,
    color: "text-cyan-300",
    borderGlow: "border-cyan-400/80 shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)]",
    activeMetrics: "Approval Gate: ENFORCED | Audit Signature: Tamper-Resistant",
  },
];

export function HeroCommandCore() {
  const [activeStage, setActiveStage] = useState<string>("planning");

  const current = STAGES.find((s) => s.id === activeStage) || STAGES[2];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-6 md:p-8 glass-panel border border-white/10 bg-[#0A0D15]/90 shadow-2xl overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of the Command-Core */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
            NEXA COMMAND-CORE ARCHITECTURE // LIVE SIMULATOR
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero-Trust Human Firewall</span>
        </div>
      </div>

      {/* Main interactive visualization grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
        {/* Left Column: Flow of the 7 Stages */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;

            return (
              <div key={stage.id} className="relative group">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? `glass-panel ${stage.borderGlow} bg-white/5`
                      : "bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-white/10" : "bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${stage.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">0{idx + 1}</span>
                        <span className="font-semibold text-sm tracking-wide text-white font-mono">
                          {stage.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 hidden sm:block">{stage.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stage.id === "user" ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        FINAL CONTROL
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-slate-500" />
                    )}
                  </div>
                </button>

                {/* Connector arrow between stages */}
                {idx < STAGES.length - 1 && (
                  <div className="w-full flex justify-center py-0.5">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Stage Diagnostic Inspector */}
        <div className="lg:col-span-5 h-full">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#0E1320] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400">INSPECTION NODE</span>
                <span className="text-xs font-mono text-cyan-400">{current.name}</span>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-bold text-white mb-1">{current.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{current.role}</p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      REAL-TIME TELEMETRY
                    </div>
                    <div className="text-cyan-300">{current.activeMetrics}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      SAFETY CHECKS
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Boundary Isolation Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Human Override Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audit Trail Inscribed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] font-mono text-slate-400">
                AI CAN ASSIST. AI CAN PLAN.{" "}
                <span className="text-cyan-400 font-semibold">YOU MAINTAIN CONTROL.</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
