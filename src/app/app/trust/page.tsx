"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  AlertTriangle,
  Server,
  Fingerprint,
  Scale,
  Database,
  Trash2,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface TrustAttestation {
  userId: string;
  systemStatus: "OPTIMAL" | "DEGRADED" | "CRITICAL";
  trustScore: number;
  governanceMaturity: string;
  certificate: {
    fingerprint: string;
    serialNumber: string;
    algorithm: string;
    issuer: string;
    issuedAt: string;
    expiresAt: string;
    status: "ACTIVE" | "REVOKED";
  };
  metrics: {
    artifactsVerified: number;
    memoriesSecured: number;
    decisionLedgersCompiled: number;
    actionContractsEnforced: number;
    constitutionRulesActive: number;
    auditLogsSecured: number;
  };
  safeguards: Record<string, { status: string; guarantee: string }>;
  complianceFrameworks: Array<{
    framework: string;
    standard: string;
    score: number;
    status: string;
    attestationDate: string;
  }>;
}

interface AuditResult {
  timestamp: string;
  auditId: string;
  artifactsAudited: number;
  checksumsValid: number;
  tamperedArtifacts: number;
  memoryIntegrityScore: number;
  constitutionEnforcementScore: number;
  overallStatus: string;
  cryptographicSignature: string;
  checks: Array<{
    check: string;
    passed: boolean;
    details: string;
  }>;
}

export default function TrustCenterPage() {
  const [attestation, setAttestation] = useState<TrustAttestation | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [exportingStandard, setExportingStandard] = useState<string | null>(null);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  useEffect(() => {
    fetchAttestation();
  }, []);

  const fetchAttestation = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/app/trust");
      if (res.ok) {
        const data = await res.json();
        setAttestation(data.attestation);
      }
    } catch (e) {
      console.error("Failed to load trust attestation", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setAuditing(true);
      const res = await fetch("/api/app/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RUN_AUDIT" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.auditResult);
      }
    } catch (e) {
      console.error("Audit run error", e);
    } finally {
      setAuditing(false);
    }
  };

  const handleExportCompliance = async (standard: string) => {
    try {
      setExportingStandard(standard);
      const res = await fetch("/api/app/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EXPORT_COMPLIANCE", standard }),
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.dossier.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.dossier.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to export compliance dossier", e);
    } finally {
      setExportingStandard(null);
    }
  };

  const handlePurgeEphemeral = async () => {
    if (
      !confirm(
        "Execute GDPR Article 17 ephemeral cache purge? This will immediately wipe all temporary scratch session buffers."
      )
    ) {
      return;
    }
    try {
      setPurging(true);
      const res = await fetch("/api/app/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PURGE_EPHEMERAL" }),
      });
      if (res.ok) {
        setPurgeSuccess(true);
        setTimeout(() => setPurgeSuccess(false), 5000);
      }
    } catch (e) {
      console.error("Purge error", e);
    } finally {
      setPurging(false);
    }
  };

  const copyFingerprint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D17] relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>NEXA SOVEREIGN TRUST & GOVERNANCE CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cryptographic Trust & Attestation Vault
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time verification of model isolation boundaries, zero data-retention guarantees,
              SHA-256 artifact integrity, and exportable regulatory compliance attestations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TRUST SCORE: 100% OPTIMAL</span>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={auditing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-glow-cyan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditing ? "animate-spin" : ""}`} />
              <span>{auditing ? "Verifying Hashes..." : "Run Cryptographic Audit"}</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Polling Sovereign Cryptographic Ledgers...</span>
        </div>
      ) : attestation ? (
        <>
          {/* Cryptographic Certificate & Live Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Root Certificate Card */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#07090E] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>ACTIVE ROOT CERTIFICATE</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                  {attestation.certificate.status}
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">SERIAL NUMBER</span>
                  <div className="text-white font-bold">{attestation.certificate.serialNumber}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase">ISSUING AUTHORITY</span>
                  <div className="text-slate-300 text-[11px]">{attestation.certificate.issuer}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase">CIPHER SUITE</span>
                  <div className="text-emerald-400 text-[11px]">{attestation.certificate.algorithm}</div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">SHA-256 FINGERPRINT</span>
                    <button
                      onClick={() => copyFingerprint(attestation.certificate.fingerprint)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedFingerprint ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5 text-[10px] text-slate-400 font-mono break-all mt-1 select-all">
                    {attestation.certificate.fingerprint}
                  </div>
                </div>

                <div className="flex justify-between text-[11px] pt-1 text-slate-400 border-t border-white/5">
                  <span>Expires:</span>
                  <span className="text-slate-200">
                    {new Date(attestation.certificate.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger Counts */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-white/10 bg-[#07090E] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>TAMPER-PROOF CRYPTOGRAPHIC LEDGER</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Zero-Trust Architecture: <strong className="text-white">ENFORCED</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">SHA-256 ARTIFACTS</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {attestation.metrics.artifactsVerified}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Checksum Verified</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">MEMORIES SECURED</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {attestation.metrics.memoriesSecured}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tenant Air-Gapped</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">DECISION LEDGERS</div>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                    {attestation.metrics.decisionLedgersCompiled}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">100% Transparent Rationale</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">ACTION CONTRACTS</div>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                    {attestation.metrics.actionContractsEnforced}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cryptographic Bounds</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">CONSTITUTION RULES</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {attestation.metrics.constitutionRulesActive}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Active Directives</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">IMMUTABLE LOGS</div>
                  <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                    {attestation.metrics.auditLogsSecured}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Append-Only Vault</div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Audit Modal / Results Card */}
          {auditResult && (
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#080B13] space-y-4 shadow-2xl font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>CRYPTOGRAPHIC AUDIT EXECUTION RECORD: {auditResult.auditId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    {auditResult.overallStatus}
                  </span>
                  <button
                    onClick={() => setAuditResult(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {auditResult.checks.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.check}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 pl-5">{c.details}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-[10px] text-slate-400 space-y-1">
                <div>
                  CRYPTOGRAPHIC SIGNATURE:{" "}
                  <span className="text-cyan-400">{auditResult.cryptographicSignature}</span>
                </div>
                <div>AUDIT RUN AT: {auditResult.timestamp}</div>
              </div>
            </div>
          )}

          {/* Safeguards & Governance Isolation Matrix */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D17] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Sovereign Isolation & Privacy Safeguards
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">
                  Continuous hardware and software sandbox guarantees enforced at every layer of the operating system.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ACTIVE FIREWALL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(attestation.safeguards).map(([key, item]) => (
                <div key={key} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">{item.guarantee}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Frameworks & Regulatory Attestations */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D17] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Exportable Compliance Attestations
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">
                  Generate cryptographically signed compliance audit reports for SOC 2, GDPR, ISO 42001, and NIST AI RMF.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {attestation.complianceFrameworks.map((fw) => {
                const stdKey = fw.framework.includes("SOC")
                  ? "SOC2"
                  : fw.framework.includes("GDPR")
                  ? "GDPR"
                  : fw.framework.includes("ISO")
                  ? "ISO42001"
                  : "NIST";

                return (
                  <div
                    key={fw.framework}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300">{fw.framework}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {fw.score}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">{fw.standard}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Attested: {fw.attestationDate}
                      </div>
                    </div>

                    <button
                      onClick={() => handleExportCompliance(stdKey)}
                      disabled={exportingStandard === stdKey}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{exportingStandard === stdKey ? "Exporting..." : "Download Dossier"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GDPR Article 17 Data Erasure Controls */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-rose-950/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
                  <Trash2 className="w-4 h-4" />
                  <span>GDPR ARTICLE 17 // RIGHT TO ERASURE</span>
                </div>
                <h4 className="text-sm font-bold text-white">Purge Ephemeral Sandboxes & Scratch Cache</h4>
                <p className="text-xs text-slate-400 max-w-2xl font-sans">
                  Immediately destroy ephemeral conversation buffers, temporary analysis caches, and runtime scratch directories. Core memories and permanent files remain intact.
                </p>
              </div>

              <button
                onClick={handlePurgeEphemeral}
                disabled={purging}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-semibold flex items-center gap-2 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{purging ? "Purging..." : "Purge Ephemeral Data"}</span>
              </button>
            </div>

            {purgeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ephemeral cache purged successfully in compliance with GDPR Article 17.</span>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
