import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { ShieldCheck, Lock, Key, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-2 block">
            ZERO-TRUST PARADIGM
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mb-4">
            Security & Cryptographic Trust Architecture
          </h1>
          <p className="text-slate-400 text-base">
            Proving authentication does not automatically grant authorization. NEXA enforces NIST SP 800-63B
            session controls, OWASP LLM guardrails, and server-side RBAC.
          </p>
        </div>

        {/* Security Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-cyan-400" />
              <h3 className="font-bold text-lg font-mono text-white">Server-Side Authorization & Anti-IDOR</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every request is validated server-side for cryptographic ownership and user role permissions.
              Modifying an ID in the request or manipulating frontend state will never expose another user&apos;s
              conversations or memory vectors.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-lg font-mono text-white">Cryptographic Session Protection</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sessions are stored in an append-only database table with IP, User-Agent, and rotation tracking.
              Remote revocation and session rotation invalidate compromised credentials across all active devices immediately.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-lg font-mono text-white">The Human Approval Firewall</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI agents must never blindly execute irreversible actions. Destructive operations (code execution,
              network dispatches, database writes) halt at the approval gate until explicitly confirmed by the human operator.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-lg font-mono text-white">Immutable Audit Logging</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              All logins, privilege escalations, account suspensions, tool executions, and approval decisions
              are inscribed into tamper-resistant audit logs accessible to system administrators and compliance auditors.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center max-w-2xl mx-auto">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan"
          >
            <span>Create Secure Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
