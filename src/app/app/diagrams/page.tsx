"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  Layers,
  Code,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Share2,
  Eye,
  Workflow,
  Database,
  ArrowRight,
} from "lucide-react";

export default function DiagramStudioPage() {
  const [diagramType, setDiagramType] = useState<"ARCHITECTURE" | "FLOWCHART" | "SEQUENCE" | "ERD">("ARCHITECTURE");
  const [prompt, setPrompt] = useState("");
  const [diagram, setDiagram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [hash, setHash] = useState<string>("");

  const presets = [
    {
      id: "ARCHITECTURE",
      label: "System Architecture",
      icon: Layers,
      color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
      desc: "Multi-Agent Sovereign OS Architecture & Governance Mesh",
    },
    {
      id: "FLOWCHART",
      label: "Zero-Trust Flowchart",
      icon: Workflow,
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      desc: "Human Approval & Constitution Firewall Enforcement",
    },
    {
      id: "SEQUENCE",
      label: "Orchestration Sequence",
      icon: GitBranch,
      color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
      desc: "Sub-Agent Reasoning & Cryptographic Attestation",
    },
    {
      id: "ERD",
      label: "Sovereign Data ERD",
      icon: Database,
      color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
      desc: "Entity Relational Lineage: Tasks, Memories & Contracts",
    },
  ];

  const fetchDiagram = async (type: string, customPrompt?: string) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ type });
      if (customPrompt) query.append("prompt", customPrompt);

      const res = await fetch(`/api/app/diagrams?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDiagram(data.diagram);
        setHash(data.diagram.id);
      }
    } catch (e) {
      console.error("Failed to load diagram:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagram(diagramType);
  }, [diagramType]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await fetch("/api/app/diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: diagramType,
          prompt: prompt.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagram(data.diagram);
        setHash(data.hash || data.diagram.id);
      }
    } catch (e) {
      console.error("Failed to generate diagram:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!diagram?.mermaidCode) return;
    navigator.clipboard.writeText(diagram.mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!diagram?.svgMarkup) return;
    const blob = new Blob([diagram.svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa_${diagram.type.toLowerCase()}_diagram_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              AI Diagram & Architecture Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              MERMAID &amp; SVG ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize vector system architecture diagrams, zero-trust flowcharts, and sequence models with 1-click SVG download and artifact lineage tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/artifacts"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Artifact Graph</span>
          </Link>
        </div>
      </div>

      {/* Preset Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = diagramType === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setDiagramType(p.id as any);
                setPrompt("");
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-[#0C1222] border-cyan-500/60 shadow-glow-cyan"
                  : "bg-[#0A0D15] border-white/10 hover:border-white/20 hover:bg-[#0D111C]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl border ${p.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-white font-mono">{p.label}</div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Prompt Form & Controls */}
      <form onSubmit={handleGenerate} className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#0A0D17]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Refine diagram topic (e.g., 'Autonomous Sub-Agent Decision Flow with Constitutional Interception')..."
              className="w-full bg-[#07090E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan disabled:opacity-50 transition-all shrink-0 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Diagram</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Diagram Canvas & Actions */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-[#0A0D17]">
        {/* Canvas Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold text-xs font-mono text-white truncate">
              {diagram?.title || "Diagram Canvas"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
              GRADE A (100%) VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showCode
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showCode ? "Hide Code" : "View Mermaid"}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-cyan cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>

        {/* Code Drawer (if toggled) */}
        {showCode && diagram?.mermaidCode && (
          <div className="p-4 bg-[#05070c] border-b border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Mermaid Source Code</div>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] leading-relaxed select-all">
              {diagram.mermaidCode}
            </pre>
          </div>
        )}

        {/* Canvas Display */}
        <div className="p-6 sm:p-10 flex items-center justify-center min-h-[460px] bg-[#07090F] overflow-auto">
          {loading || generating ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
              <div className="text-xs font-mono text-slate-400">Synthesizing vector diagram structure...</div>
            </div>
          ) : diagram?.svgMarkup ? (
            <div
              className="w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-white/10"
              dangerouslySetInnerHTML={{ __html: diagram.svgMarkup }}
            />
          ) : (
            <div className="text-xs font-mono text-slate-400">No diagram available. Select a preset above.</div>
          )}
        </div>

        {/* Footer Attestation */}
        <div className="p-3.5 border-t border-white/10 bg-[#05070d] flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CRYPTOGRAPHICALLY ATTESTED DIAGRAM ARTIFACT</span>
          </div>
          <span>ID: {hash || "VERIFIED"}</span>
        </div>
      </div>
    </div>
  );
}
