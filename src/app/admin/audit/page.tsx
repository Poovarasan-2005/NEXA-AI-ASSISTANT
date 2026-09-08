"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, Search, ShieldCheck, Eye, X } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorRole.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold font-mono text-white">Security Audit Log Vault</h1>
          </div>
          <p className="text-xs text-slate-400">
            Immutable, append-only security logs recording authentication, privilege changes, and tool executions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter action, IP, role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Verifying audit cryptographic proofs...</span>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-black/40">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor Role</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((log) => {
                  const isDenied = log.status === "DENIED" || log.status === "FAILED";
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                      <td className="py-3 px-4 text-purple-300">{log.actorRole}</td>
                      <td className="py-3 px-4 text-slate-300">{log.resource}</td>
                      <td className="py-3 px-4 text-slate-400">{log.ipAddress}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            isDenied
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 rounded-lg glass-panel hover:bg-white/10 text-slate-400 hover:text-white"
                          title="Inspect JSON details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Details Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-purple-500/40 bg-[#0C101C] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm font-mono text-white">
                Audit Record: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>Log ID: <span className="text-cyan-300">{selectedLog.id}</span></div>
              <div>Actor ID: <span className="text-slate-300">{selectedLog.actorUserId || "SYSTEM/ANONYMOUS"}</span></div>
              <div>Target User ID: <span className="text-slate-300">{selectedLog.targetUserId || "N/A"}</span></div>
              <div>Resource Target: <span className="text-slate-300">{selectedLog.resource} ({selectedLog.resourceId || "N/A"})</span></div>

              <div className="pt-2">
                <div className="text-[10px] text-slate-500 uppercase mb-1">SERIALIZED PAYLOAD:</div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-300 overflow-x-auto">
                  {selectedLog.details
                    ? JSON.stringify(JSON.parse(selectedLog.details), null, 2)
                    : "No payload metadata attached."}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white font-semibold text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
