"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, Clock, AlertTriangle, ShieldCheck, RefreshCw, ChevronDown, Wrench } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/app/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">Active Task Manager</h1>
          <p className="text-xs text-slate-400">
            Inspect autonomous agent execution trees, subtasks, and verification states.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "COMPLETED", "WAITING_FOR_APPROVAL", "EXECUTING"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                filter === st
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "glass-panel text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Retrieving task records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold font-mono text-white">No tasks found</h3>
          <p className="text-xs text-slate-400">
            Dispatch instructions in the Command Center to initiate autonomous planning.
          </p>
          <Link
            href="/app"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs"
          >
            Go to Command Center
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => {
            const riskColor =
              task.riskLevel === "CRITICAL"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : task.riskLevel === "HIGH"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

            return (
              <div
                key={task.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 bg-[#0B0F19]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskColor}`}>
                        {task.riskLevel} RISK
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        AGENT: {task.agentType}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{task.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-xl ${
                        task.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : task.status === "WAITING_FOR_APPROVAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Subtask Steps */}
                {task.steps && task.steps.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      SUBTASK EXECUTION TREE:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.steps.map((st: any) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-xs"
                        >
                          <span className="font-mono text-cyan-400 font-semibold mt-0.5">
                            0{st.stepNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white truncate">{st.title}</div>
                            <div className="text-[11px] text-slate-400">{st.description}</div>
                            {st.toolName && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-amber-400">
                                <Wrench className="w-3 h-3" />
                                <span>Tool: {st.toolName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result Summary */}
                {task.resultSummary && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      EXECUTION SUMMARY:
                    </div>
                    <p>{task.resultSummary}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
