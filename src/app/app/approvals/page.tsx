"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, FileCode } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      const res = await fetch("/api/app/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals);
      }
    } catch (e) {
      console.error("Failed to load approvals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleResolve = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    setResolvingId(approvalId);
    try {
      const res = await fetch("/api/app/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action,
          comment: commentMap[approvalId] || "",
        }),
      });

      if (res.ok) {
        await loadApprovals();
      }
    } catch (e) {
      console.error("Failed to resolve approval:", e);
    } finally {
      setResolvingId(null);
    }
  };

  const pending = approvals.filter((a) => a.status === "PENDING");
  const resolved = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold font-mono text-white">Human Approval Firewall</h1>
        </div>
        <p className="text-xs text-slate-400">
          Zero-Trust execution policy requires human authorization for high-impact tools, external network
          dispatches, or data modifications.
        </p>
      </div>

      {/* Pending Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
            <span>Pending Authorizations</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs">
              {pending.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Scanning authorization queue...</span>
          </div>
        ) : pending.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center text-xs text-slate-400 bg-[#0A0D15]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>No actions currently awaiting approval. All autonomous systems operating normally.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((app) => (
              <div
                key={app.id}
                className="glass-panel p-6 rounded-2xl border border-rose-500/40 bg-[#0C101C] space-y-4 shadow-glow-rose"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                        {app.riskLevel} RISK TIER
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Requested: {new Date(app.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{app.actionName}</h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    AWAITING SIGNATURE
                  </span>
                </div>

                <div className="text-xs text-slate-300">{app.reason}</div>

                {/* Payload Preview */}
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    EXECUTION PAYLOAD:
                  </div>
                  <pre>{JSON.stringify(JSON.parse(app.dataPayload || "{}"), null, 2)}</pre>
                </div>

                {/* Decision controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Optional review comment or audit note..."
                    value={commentMap[app.id] || ""}
                    onChange={(e) =>
                      setCommentMap({ ...commentMap, [app.id]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(app.id, "APPROVE")}
                      disabled={resolvingId === app.id}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors disabled:opacity-50"
                    >
                      Authorize Action
                    </button>
                    <button
                      onClick={() => handleResolve(app.id, "REJECT")}
                      disabled={resolvingId === app.id}
                      className="px-5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono transition-colors disabled:opacity-50"
                    >
                      Reject & Abort
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Approvals Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">
          Historical Audit Records ({resolved.length})
        </h2>

        {resolved.length === 0 ? (
          <div className="text-xs text-slate-500 font-mono">No historical records logged yet.</div>
        ) : (
          <div className="space-y-3">
            {resolved.map((app) => (
              <div
                key={app.id}
                className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#0A0D15]"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {app.status}
                    </span>
                    <span className="font-bold text-white">{app.actionName}</span>
                  </div>
                  <div className="text-slate-400">{app.reason}</div>
                  {app.comment && (
                    <div className="text-slate-500 italic mt-1">Audit comment: &ldquo;{app.comment}&rdquo;</div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-500 shrink-0">
                  Resolved: {new Date(app.resolvedAt || app.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
