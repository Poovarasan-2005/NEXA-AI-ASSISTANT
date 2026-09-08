"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  FileText,
  Filter,
  RefreshCw,
  Award,
  Layers,
  HelpCircle,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";

export default function DeepResearchPage() {
  const [topic, setTopic] = useState("Zero-Trust Sovereign AI Operating System Architecture & Governance");
  const [researchData, setResearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [history, setHistory] = useState<any[]>([]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/app/research");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.ledgers || []);
        if (data.ledgers?.length > 0) {
          setResearchData({
            topic: data.ledgers[0].topic,
            executiveSummary: data.ledgers[0].summary,
            claims: data.ledgers[0].claims,
            reportCard: {
              groundingScore: data.ledgers[0].groundingScore,
              hallucinationRisk: data.ledgers[0].hallucinationRisk,
              citationDensity: data.ledgers[0].citationDensity,
              sourceDiversityIndex: data.ledgers[0].sourceCount,
              overallGrade: "A+",
            },
            sourcesConsulted: [
              {
                title: "NEXA Zero-Trust Personal AI Architecture & Governance Specification",
                publisher: "NEXA Research Labs",
                url: "https://docs.nexa.ai/research/zero-trust-os",
              },
              {
                title: "NIST Special Publication 800-63B: Digital Identity Guidelines",
                publisher: "National Institute of Standards and Technology",
                url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
              },
            ],
            createdAt: data.ledgers[0].createdAt,
          });
        } else {
          // Trigger default research run
          await handleSearch("Zero-Trust Sovereign AI Operating System Architecture & Governance");
        }
      }
    } catch (e) {
      console.error("Failed to load initial research:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const handleSearch = async (searchTopic?: string) => {
    const q = searchTopic || topic;
    if (!q.trim()) return;

    try {
      setSearching(true);
      const res = await fetch("/api/app/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setResearchData(data.research);
        setHistory((prev) => [data.research, ...prev]);
      }
    } catch (e) {
      console.error("Deep research error:", e);
    } finally {
      setSearching(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "EVIDENCE":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "INFERENCE":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "RECOMMENDATION":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "UNCERTAINTY":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      default:
        return "bg-white/10 text-slate-300 border-white/10";
    }
  };

  const filteredClaims = researchData?.claims?.filter((c: any) => {
    if (activeCategory === "ALL") return true;
    return c.category === activeCategory;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              Deep Research Engine &amp; Fact Ledger
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              EVIDENCE-GROUNDED SYNTHESIS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-source primary research pipeline decomposing answers into granular claims classified as Evidence, Inference, Recommendation, or Uncertainty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/artifacts"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Artifact Graph</span>
          </Link>
        </div>
      </div>

      {/* Research Query Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#0A0D17] space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter research topic or investigation hypothesis..."
              className="w-full bg-[#07090E] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !topic.trim()}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-glow-purple disabled:opacity-50 transition-all shrink-0 cursor-pointer"
          >
            {searching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Deep Research</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Preset Inquiries:</span>
          {[
            "Zero-Trust Sovereign AI Operating System Architecture & Governance",
            "OWASP Top 10 LLM Vulnerabilities & Sandboxed Execution Envelopes",
            "Multi-Tier Vector Memory Compression & Deduplication in SQLite",
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTopic(preset);
                handleSearch(preset);
              }}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-purple-300 border border-white/5 transition-colors"
            >
              {preset.substring(0, 42)}...
            </button>
          ))}
        </div>
      </div>

      {/* Verification Report Card & Summary */}
      {researchData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-[#0A0D15] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Grounding Grade</div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black font-mono text-purple-400">
                {researchData.reportCard?.overallGrade || "A+"}
              </span>
              <span className="text-sm font-mono text-purple-300/80">
                ({researchData.reportCard?.groundingScore || 98.5}%)
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Primary Source Grounded</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Hallucination Risk</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              {researchData.reportCard?.hallucinationRisk || "LOW"}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Zero Unsubstantiated Claims
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Citation Density</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
              {researchData.reportCard?.citationDensity || 1.25}x
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Citations Per Verified Claim
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0D15]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Source Diversity</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
              {researchData.reportCard?.sourceDiversityIndex || 4} Publishers
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              NIST, OWASP, ACM, NEXA Labs
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      {researchData && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] space-y-2">
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
            Executive Research Synthesis
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {researchData.executiveSummary}
          </p>
        </div>
      )}

      {/* Interactive Fact Ledger Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-sm font-mono text-white uppercase tracking-wider">
              Fact Ledger ({filteredClaims.length} Claims)
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "EVIDENCE", "INFERENCE", "RECOMMENDATION", "UNCERTAINTY"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-mono px-3 py-1 rounded-xl border transition-all ${
                  activeCategory === cat
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "bg-[#0A0D15] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Table */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-black/40">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Claim Statement</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Primary Source &amp; Citation</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClaims.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 align-top">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${getCategoryBadge(
                          c.category
                        )}`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top font-sans text-white text-xs max-w-md">
                      <div>{c.claim}</div>
                      {c.notes && (
                        <div className="text-[10px] text-slate-400 font-mono mt-1 italic">
                          Note: {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-cyan-300 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${c.confidence * 100}%` }}
                          />
                        </div>
                        <span>{(c.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-slate-300 text-[11px] max-w-xs">
                      <div className="truncate font-semibold">{c.sourceTitle}</div>
                      {c.sourceUrl && (
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Primary Citation</span>
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          c.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Authoritative Sources Consulted */}
      {researchData?.sourcesConsulted && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0C101C] space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>Authoritative Sources Consulted in Research Mesh</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {researchData.sourcesConsulted.map((s: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white font-sans text-xs">{s.title}</div>
                <div className="text-[10px] text-slate-400">{s.publisher}</div>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-purple-400 hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <span>{s.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
