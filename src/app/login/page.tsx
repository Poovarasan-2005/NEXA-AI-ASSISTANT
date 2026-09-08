"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Shield, ArrowRight, Lock, Mail, KeyRound, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      // Successful login -> Navigate to application or admin
      router.push(data.redirectUrl || redirectPath);
    } catch (err) {
      setError("Network or server connection error. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-glow-cyan">
            <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-white">NEXA</span>
        </Link>
        <h2 className="text-3xl font-extrabold font-mono text-white tracking-tight">
          Welcome back to NEXA
        </h2>
        <p className="mt-2 text-sm text-slate-400">Your AI workspace is waiting.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl border border-white/10 shadow-2xl bg-[#0B0F19]/90">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!mfaRequired ? (
              <>
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-xs text-slate-400">Remember this device</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Multi-Factor Authentication Required
                  </div>
                  Please enter the 6-digit verification code from your authenticator app (or backup recovery code).
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                    Authenticator Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="000000"
                      maxLength={12}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base tracking-widest font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mfaRequired ? "Verify & Sign In" : "Sign in"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-[11px] font-mono text-slate-400 mb-3 uppercase tracking-wider text-center">
              PRE-CONFIGURED DEMO IDENTITIES
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@nexa.ai");
                  setPassword("AdminPassword123!");
                  setMfaRequired(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-purple-400 font-mono">Admin Role</div>
                <div className="text-[10px] text-slate-400 truncate">admin@nexa.ai</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("user@nexa.ai");
                  setPassword("UserPassword123!");
                  setMfaRequired(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-cyan-400 font-mono">User Role</div>
                <div className="text-[10px] text-slate-400 truncate">user@nexa.ai</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090E]" />}>
      <LoginForm />
    </Suspense>
  );
}

