"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token) {
      setError("No verification token found in URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email verification failed.");
        setLoading(false);
        return;
      }

      setVerified(true);
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

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
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl border border-white/10 shadow-2xl bg-[#0B0F19]/90 text-center">
          {loading ? (
            <div className="py-8 space-y-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm font-mono text-slate-300">Validating cryptographic token...</p>
            </div>
          ) : verified ? (
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono text-white mb-2">Account Verified</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your identity has been authenticated. Your account is now fully active.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 transition-all"
              >
                <span>Sign in to NEXA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs text-left leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-slate-400">
                If your link has expired, you can log in or request a new verification email.
              </p>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-panel text-white font-semibold text-sm hover:border-cyan-500/40 transition-all"
              >
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090E]" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

