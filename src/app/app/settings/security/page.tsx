"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // MFA Setup State
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[] | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const loadSecurityData = async () => {
    try {
      const [meRes, sessRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/auth/sessions"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData.sessions);
      }
    } catch (e) {
      console.error("Failed to load security data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleStartMfaSetup = async () => {
    setMfaError(null);
    try {
      const res = await fetch("/api/auth/mfa");
      const data = await res.json();
      if (res.ok) {
        setMfaQrCode(data.qrCodeDataUrl);
        setMfaSecret(data.secret);
      } else {
        setMfaError(data.error || "Failed to initialize MFA setup.");
      }
    } catch (e) {
      setMfaError("Network error.");
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    try {
      const res = await fetch("/api/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaToken }),
      });

      const data = await res.json();
      if (res.ok) {
        setMfaBackupCodes(data.backupCodes);
        setMfaQrCode(null);
        setMfaToken("");
        loadSecurityData();
      } else {
        setMfaError(data.error || "Invalid verification code.");
      }
    } catch (e) {
      setMfaError("Verification network error.");
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError(null);
    try {
      const res = await fetch("/api/auth/mfa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setDisablePassword("");
        loadSecurityData();
      } else {
        setDisableError(data.error || "Failed to disable MFA.");
      }
    } catch (e) {
      setDisableError("Network error.");
    }
  };

  const handleRevokeSession = async (sessionId?: string, action?: string) => {
    try {
      await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action }),
      });
      loadSecurityData();
    } catch (e) {
      console.error("Revocation error:", e);
    }
  };

  const copyBackupCodes = () => {
    if (mfaBackupCodes) {
      navigator.clipboard.writeText(mfaBackupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-bold font-mono text-white">Security & Identity Safeguards</h1>
        </div>
        <p className="text-xs text-slate-400">
          Manage multi-factor authentication, active device sessions, and zero-trust credentials.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Verifying security profile...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multi-Factor Authentication Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 bg-[#0A0D15]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm font-mono text-white">
                    Multi-Factor Authentication (TOTP)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      user?.mfaEnabled
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-white/10"
                    }`}
                  >
                    {user?.mfaEnabled ? "PROTECTED" : "DISABLED"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Protect account sign-ins with an authenticator app (Google Authenticator, 1Password, Authy).
                </p>
              </div>

              {!user?.mfaEnabled && !mfaQrCode && (
                <button
                  onClick={handleStartMfaSetup}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs shrink-0"
                >
                  Enable MFA
                </button>
              )}
            </div>

            {/* MFA Setup Step */}
            {mfaQrCode && (
              <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-4">
                <div className="text-xs text-slate-300">
                  Scan this QR code with your authenticator app, then enter the generated 6-digit code below:
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-xl">
                    <img src={mfaQrCode} alt="TOTP QR Code" className="w-36 h-36" />
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="text-slate-400">
                      Or manually enter secret key:
                      <div className="text-cyan-300 text-sm font-bold tracking-wider mt-1">{mfaSecret}</div>
                    </div>
                  </div>
                </div>

                {mfaError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{mfaError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyMfa} className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    className="w-36 px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs"
                  >
                    Confirm & Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => setMfaQrCode(null)}
                    className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Backup Codes Modal/Banner */}
            {mfaBackupCodes && (
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MFA ACTIVATED — SAVE BACKUP RECOVERY CODES</span>
                  </div>
                  <button
                    onClick={copyBackupCodes}
                    className="px-3 py-1 rounded-lg glass-panel text-xs font-mono text-emerald-300 flex items-center gap-1.5"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodes ? "Copied" : "Copy All"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  Store these recovery codes in a secure password manager. If you lose your phone, each
                  code can be used once to access your account:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-cyan-300 p-3 bg-black/60 rounded-xl">
                  {mfaBackupCodes.map((code, idx) => (
                    <div key={idx} className="p-1">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disable MFA form (with Step-Up Re-Authentication) */}
            {user?.mfaEnabled && !mfaBackupCodes && (
              <form onSubmit={handleDisableMfa} className="pt-3 border-t border-white/5 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  STEP-UP AUTHENTICATION: DISABLE MFA
                </div>
                {disableError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {disableError}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    required
                    placeholder="Enter current password to verify identity"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="flex-1 sm:w-80 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-mono"
                  >
                    Disable MFA
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Active Device Sessions List */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 bg-[#0A0D15]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm font-mono text-white">Active Device Sessions</h3>
                <p className="text-xs text-slate-400">
                  Inspect logged-in devices. Remotely revoke compromised sessions at any time.
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={() => handleRevokeSession(undefined, "revoke_others")}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono"
                >
                  Sign out all other devices
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((s) => {
                const isMobile = s.deviceInfo.includes("iOS") || s.deviceInfo.includes("Android");
                const Icon = isMobile ? Smartphone : Laptop;

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{s.deviceInfo}</span>
                          {s.isCurrent && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              CURRENT DEVICE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          IP: {s.ipAddress} • Last active: {new Date(s.lastActiveAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-mono self-start sm:self-auto transition-colors"
                      >
                        Sign out this device
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
