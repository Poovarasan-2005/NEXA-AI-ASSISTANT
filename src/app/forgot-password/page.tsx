"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to process request.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setResetUrl(data.resetUrl);
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email and we&apos;ll issue a secure single-use recovery token.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl border border-white/10 shadow-2xl bg-[#0B0F19]/90">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono text-white mb-2">Check your email</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If an account exists with this email address, a password reset link has been
                  dispatched with single-use cryptographic verification.
                </p>
              </div>

              {resetUrl && (
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-left space-y-3">
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    RESET LINK GENERATED (DEV ENVIRONMENT)
                  </div>
                  <Link
                    href={resetUrl}
                    className="block w-full text-center py-2.5 rounded-lg bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 transition-colors"
                  >
                    Click to Open Password Reset Screen
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="block text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span>Dispatching Link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Remember your password?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
