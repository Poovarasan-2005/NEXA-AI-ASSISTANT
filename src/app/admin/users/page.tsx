"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Lock,
  Unlock,
  UserX,
  UserCheck,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Action Dialog State
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "ACTIVATE" | "CHANGE_ROLE" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleExecuteAction = async () => {
    if (!targetUser || !actionType) return;
    setProcessing(true);
    setFeedback(null);

    const payload: any = {
      targetUserId: targetUser.id,
      reason: actionReason,
    };

    if (actionType === "SUSPEND") {
      payload.accountState = "SUSPENDED";
    } else if (actionType === "ACTIVATE") {
      payload.accountState = "ACTIVE";
    } else if (actionType === "CHANGE_ROLE") {
      payload.roleName = newRole;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message);
        setTargetUser(null);
        setActionType(null);
        setActionReason("");
        await loadUsers();
      } else {
        alert(data.error || "Action failed.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold font-mono text-white">User Governance Directory</h1>
          </div>
          <p className="text-xs text-slate-400">
            Enforce account states, revoke compromised identities, and configure role authorizations.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Scanning user accounts...</span>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] bg-black/40">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active Sessions</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filtered.map((u) => {
                  const isSuspended = u.accountState === "SUSPENDED";
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            isSuspended
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {u.accountState}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {u.activeSessions} active
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setTargetUser(u);
                              setActionType("CHANGE_ROLE");
                              setNewRole(u.role);
                            }}
                            className="px-2.5 py-1 rounded-lg glass-panel hover:bg-white/10 text-slate-300 text-[11px]"
                          >
                            Role
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => {
                                setTargetUser(u);
                                setActionType("ACTIVATE");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px]"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setTargetUser(u);
                                setActionType("SUSPEND");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {targetUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-purple-500/30 bg-[#0C101C] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base font-mono text-white">
                {actionType === "SUSPEND"
                  ? `Suspend Account: ${targetUser.email}`
                  : actionType === "ACTIVATE"
                  ? `Reactivate Account: ${targetUser.email}`
                  : `Change Role: ${targetUser.email}`}
              </h3>
              <button
                onClick={() => setTargetUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionType === "SUSPEND" && (
              <p className="text-xs text-rose-300 leading-relaxed">
                Suspending this account will immediately revoke all active sessions, block future logins,
                and log a permanent administrative security event.
              </p>
            )}

            {actionType === "CHANGE_ROLE" && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SELECT NEW ROLE</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="USER">USER (Standard Capabilities)</option>
                  <option value="ADMIN">ADMIN (Full System Governance)</option>
                  <option value="AUDITOR">AUDITOR (Read-Only Security Auditing)</option>
                  <option value="DEVELOPER">DEVELOPER (Sandboxes & Tools)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                AUDIT LOG JUSTIFICATION
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Specify the security rationale for this governance action..."
                className="w-full p-3 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={processing || !actionReason.trim()}
                className={`px-5 py-2 rounded-xl font-semibold text-xs font-mono disabled:opacity-50 ${
                  actionType === "SUSPEND"
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {processing ? "Executing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
