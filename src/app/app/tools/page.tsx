"use client";

import { useEffect, useState } from "react";
import { Wrench, Shield, AlertTriangle, CheckCircle2, RefreshCw, Terminal, Layers } from "lucide-react";

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTools = async () => {
    try {
      const res = await fetch("/api/app/tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools);
      }
    } catch (e) {
      console.error("Failed to load tools:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white">Tool & Capability Registry</h1>
        </div>
        <p className="text-xs text-slate-400">
          Sandboxed connectors, external integrations, and risk boundaries assigned to autonomous agents.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Scanning tool registry...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const isCritical = tool.riskLevel === "CRITICAL";
            const isHigh = tool.riskLevel === "HIGH";
            const isMedium = tool.riskLevel === "MEDIUM";

            const riskBadge = isCritical
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : isHigh
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : isMedium
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

            return (
              <div
                key={tool.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0A0D15] space-y-4 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-base text-white">{tool.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskBadge}`}>
                      {tool.riskLevel} RISK
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-3">{tool.description}</div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/5">
                      CATEGORY: {tool.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded border ${
                        tool.requiresApproval
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {tool.requiresApproval ? "Approval Enforced" : "Autonomous Run Permitted"}
                    </span>
                  </div>
                </div>

                {/* Schema snippet */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-[10px] text-slate-400">
                  <div className="text-slate-500 uppercase mb-1">INPUT SCHEMA DEFINITION</div>
                  <pre className="truncate">{tool.inputSchema}</pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
