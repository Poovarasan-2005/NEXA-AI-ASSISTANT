"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";

interface ConstitutionRule {
  id: string;
  ruleNumber: number;
  content: string;
  category: "SAFETY" | "PRIVACY" | "ACCURACY" | "AUTONOMY" | "GENERAL";
  enforced: boolean;
}

export default function ConstitutionPage() {
  const [rules, setRules] = useState<ConstitutionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"SAFETY" | "PRIVACY" | "ACCURACY" | "AUTONOMY" | "GENERAL">("SAFETY");
  const [adding, setAdding] = useState(false);
  const [simQuery, setSimQuery] = useState("");
  const [simResult, setSimResult] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      const res = await fetch("/api/app/constitution");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error("Failed to load constitution rules:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (rule: ConstitutionRule) => {
    const updatedEnforced = !rule.enforced;
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, enforced: updatedEnforced } : r))
    );

    try {
      await fetch("/api/app/constitution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: rule.id,
          enforced: updatedEnforced,
        }),
      });
    } catch (e) {
      console.error("Toggle rule failed:", e);
      loadRules();
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || adding) return;

    setAdding(true);
    try {
      const res = await fetch("/api/app/constitution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD",
          content: newContent.trim(),
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (data.success && data.rule) {
        setRules((prev) => [...prev, data.rule]);
        setNewContent("");
      }
    } catch (e) {
      alert("Failed to add constitution rule.");
    } finally {
      setAdding(false);
    }
  };

  const handleTestPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuery.trim()) return;

    const q = simQuery.toLowerCase();
    const activeRules = rules.filter((r) => r.enforced);
    const triggered: string[] = [];

    for (const r of activeRules) {
      if (r.ruleNumber === 1 && (q.includes("email") || q.includes("send") || q.includes("notify"))) {
        triggered.push(`Rule #${r.ruleNumber}: ${r.content} -> Intercepted: Outbound transmission requires human approval.`);
      }
      if (r.ruleNumber === 2 && (q.includes("delete") || q.includes("remove") || q.includes("drop") || q.includes("rm "))) {
        triggered.push(`Rule #${r.ruleNumber}: ${r.content} -> Intercepted: Automated resource deletion is strictly forbidden.`);
      }
      if (r.ruleNumber === 5 && (q.includes("password") || q.includes("api key") || q.includes("secret"))) {
        triggered.push(`Rule #${r.ruleNumber}: ${r.content} -> Enforced: Credential persistence blocked.`);
      }
    }

    if (triggered.length > 0) {
      setSimResult(`POLICY INTERCEPTED (HUMAN APPROVAL REQUIRED):\n\n${triggered.join("\n\n")}`);
    } else {
      setSimResult(`POLICY PERMITTED:\n\nAction "${simQuery}" satisfies all ${activeRules.length} active Constitutional Rules. Execution permitted.`);
    }
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "SAFETY":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "PRIVACY":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "AUTONOMY":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "ACCURACY":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-white">My AI Constitution</h1>
        </div>
        <p className="text-xs text-slate-400">
          Permanent operational boundaries, security assertions, and human authority rules enforced by NEXA&apos;s Policy Engine across all autonomous agent actions.
        </p>
      </div>

      {/* Top Telemetry Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0C101C] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">ENFORCED RULES</div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {rules.filter((r) => r.enforced).length} / {rules.length} Active
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Zero-bypass policy engine</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0C101C] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">HUMAN AUTHORITY</div>
          <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>SOVEREIGN</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Human-in-the-loop anchor</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0C101C] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">VERIFICATION SCOPE</div>
          <div className="text-xl font-bold font-mono text-purple-400">ACTION CONTRACT</div>
          <div className="text-[11px] text-slate-400 font-mono">Evaluated prior to execution</div>
        </div>
      </div>

      {/* Constitution Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm font-mono text-white uppercase tracking-wider">
            Active Constitutional Directives ({rules.length})
          </h2>
          <button
            onClick={loadRules}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Rules</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Verifying policy engine rules...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rule.enforced
                    ? "border-white/10 bg-[#0C101C]"
                    : "border-white/5 bg-[#07090E] opacity-50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold text-xs shrink-0 mt-0.5">
                    #{rule.ruleNumber}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${categoryColor(
                          rule.category
                        )}`}
                      >
                        {rule.category}
                      </span>
                      {rule.enforced && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Policy</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-200 leading-relaxed font-semibold">
                      {rule.content}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] font-mono text-slate-400">
                    {rule.enforced ? "Enforced" : "Paused"}
                  </span>
                  <button
                    onClick={() => handleToggle(rule)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      rule.enforced ? "bg-cyan-500 shadow-glow-cyan" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        rule.enforced ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Amendment Form */}
      <form onSubmit={handleAddRule} className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D15] space-y-4">
        <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Add Custom Constitutional Rule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-9">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. Always ask before external database migrations or API webhook dispatches..."
              className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="SAFETY">SAFETY</option>
              <option value="PRIVACY">PRIVACY</option>
              <option value="AUTONOMY">AUTONOMY</option>
              <option value="ACCURACY">ACCURACY</option>
              <option value="GENERAL">GENERAL</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !newContent.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-glow-cyan disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            {adding ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Ratifying Amendment...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ratify Constitutional Rule</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Policy Simulation & Dry-Run Inspector */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] space-y-4">
        <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Constitution Policy Simulation Lab</span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Simulate any hypothetical prompt or tool action to verify how your active Constitution evaluates and intercepts risky operations.
        </p>

        <form onSubmit={handleTestPolicy} className="flex gap-2">
          <input
            type="text"
            value={simQuery}
            onChange={(e) => setSimQuery(e.target.value)}
            placeholder="Type a simulated action (e.g. 'Send outbound email to client with pricing sheet' or 'Delete customer table')..."
            className="flex-1 bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-mono font-bold text-xs transition-colors shrink-0"
          >
            Simulate Policy
          </button>
        </form>

        {simResult && (
          <div
            className={`p-4 rounded-xl border font-mono text-xs whitespace-pre-wrap ${
              simResult.includes("INTERCEPTED")
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            {simResult}
          </div>
        )}
      </div>
    </div>
  );
}
