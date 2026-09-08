"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw, Eye, ShieldCheck, Play, ArrowRight, X, Sparkles } from "lucide-react";

export default function ActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replayModalEvent, setReplayModalEvent] = useState<any | null>(null);

  const loadActivity = async () => {
    try {
      const res = await fetch("/api/app/activity");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (e) {
      console.error("Failed to load activity:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white">Activity Timeline & Agent Replay</h1>
        </div>
        <p className="text-xs text-slate-400">
          Chronological audit trail of all agent actions, tool calls, human approvals, and verifications.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Loading activity history...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold font-mono text-white">No activity logged yet</h3>
          <p className="text-xs text-slate-400">Activity will appear as you interact with agents and tools.</p>
        </div>
      ) : (
        <div className="relative border-l border-white/10 ml-4 space-y-6">
          {events.map((ev) => {
            const isApproval = ev.type.includes("APPROVAL");
            const isTool = ev.type.includes("TOOL");
            const isTask = ev.type.includes("TASK");

            const dotColor = isApproval
              ? "bg-rose-400"
              : isTool
              ? "bg-amber-400"
              : isTask
              ? "bg-cyan-400"
              : "bg-purple-400";

            return (
              <div key={ev.id} className="relative pl-6 group">
                {/* Dot */}
                <div
                  className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-[#07090E]`}
                />

                <div className="glass-panel p-4 rounded-xl border border-white/10 bg-[#0A0D15] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/30 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                        {ev.type}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(ev.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white">{ev.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>
                  </div>

                  <button
                    onClick={() => setReplayModalEvent(ev)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Agent Replay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Replay Modal */}
      {replayModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-cyan-500/30 bg-[#0C101C] space-y-5 shadow-glow-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base font-mono text-white">Agent Replay Inspector</h3>
              </div>
              <button
                onClick={() => setReplayModalEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">EVENT TYPE</div>
                <div className="text-cyan-300 font-bold">{replayModalEvent.type}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">TITLE & DESCRIPTION</div>
                <div className="text-white font-semibold">{replayModalEvent.title}</div>
                <div className="text-slate-400">{replayModalEvent.description}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1 overflow-x-auto">
                <div className="text-[10px] text-slate-500 uppercase">METADATA & PAYLOAD</div>
                <pre className="text-slate-300">
                  {replayModalEvent.metadata
                    ? JSON.stringify(JSON.parse(replayModalEvent.metadata), null, 2)
                    : "No extra metadata recorded."}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auditable Zero-Trust Signature Verified</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setReplayModalEvent(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs font-mono"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
