"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  Activity,
  CheckSquare,
  Wrench,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  Server,
  Lock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error("Failed to load metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">System Governance & Telemetry</h1>
          <p className="text-xs text-slate-400">
            Real-time multi-tenant health, security anomalies, and autonomous task volume metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">STATUS: OPTIMAL</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Polling system telemetry...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C0E1A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">TOTAL USERS</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{metrics?.totalUsers || 0}</div>
              <div className="text-[11px] text-emerald-400 font-mono">
                {metrics?.activeUsers || 0} Active Accounts
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C0E1A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">ACTIVE SESSIONS</span>
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{metrics?.activeSessions || 0}</div>
              <div className="text-[11px] text-cyan-400 font-mono">HttpOnly Verified</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C0E1A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">AI TASKS TOTAL</span>
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{metrics?.totalTasks || 0}</div>
              <div className="text-[11px] text-slate-400 font-mono">Orchestrated runs</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C0E1A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">SECURITY AUDIT LOGS</span>
                <Lock className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{metrics?.totalAuditLogs || 0}</div>
              <div className="text-[11px] text-rose-400 font-mono">
                {metrics?.failedLogins || 0} Auth Failures
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D15]">
              <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Security Engine Posture</span>
              </h3>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Pending Human Approvals:</span>
                  <span className="text-amber-400 font-bold">{metrics?.pendingApprovals || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Suspended Accounts:</span>
                  <span className="text-rose-400 font-bold">{metrics?.suspendedUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Registered AI Tools:</span>
                  <span className="text-cyan-400 font-bold">{metrics?.totalTools || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span>System Engine Uptime:</span>
                  <span className="text-emerald-400">{metrics?.uptimeSeconds || 0}s</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D15]">
              <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Zero-Trust Policy Enforcement</span>
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                NEXA strictly enforces server-side role boundaries and anti-IDOR filters. Regular users
                requesting administrative endpoints receive immediate HTTP 403 Forbidden terminations
                and an inscribed security audit event.
              </p>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-300 text-xs font-mono">
                Admin Session Timeout: 12 Hours • MFA Required for Sensitive Actions
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
