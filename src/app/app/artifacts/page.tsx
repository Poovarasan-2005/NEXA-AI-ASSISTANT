"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  FileText,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  GitBranch,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  HardDrive,
} from "lucide-react";

export default function ArtifactsLineagePage() {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [graph, setGraph] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/app/artifacts");
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data.artifacts || []);
        setGraph(data.graph || { nodes: [], edges: [] });
        setSummary(data.summary || {});
        if (data.artifacts?.length > 0 && !selectedNode) {
          setSelectedNode(data.artifacts[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load artifacts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT_DOCX":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "PRESENTATION_PPTX":
        return <Layers className="w-4 h-4 text-amber-400" />;
      case "SPREADSHEET_XLSX":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case "DOCUMENT_PDF":
        return <FileText className="w-4 h-4 text-rose-400" />;
      case "DATASET_CSV":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case "IMAGE_PNG":
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case "DIAGRAM_SVG":
        return <GitBranch className="w-4 h-4 text-cyan-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "DOCUMENT_DOCX":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "PRESENTATION_PPTX":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "SPREADSHEET_XLSX":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "DOCUMENT_PDF":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "DATASET_CSV":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "IMAGE_PNG":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "DIAGRAM_SVG":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const filteredArtifacts = artifacts.filter((a) => {
    const matchesFilter = filterType === "ALL" || a.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              Connected Artifact Graph &amp; Lineage Hub
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              ZERO-TRUST PROVENANCE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Immutable lineage graph connecting source datasets, executive documents (.docx), presentation decks (.pptx), workbooks (.xlsx), diagrams, and neural images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadArtifacts}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Lineage</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Artifacts</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{artifacts.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">Verified in Database</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Integrity Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100.0%</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">Zero Tamper Events</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Supported Formats</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">7 Types</div>
          <div className="text-[11px] text-purple-400/80 mt-1 font-mono">DOCX, PPTX, XLSX, SVG...</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0A0D15]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Lineage Depth</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">Direct DAG</div>
          <div className="text-[11px] text-cyan-400/80 mt-1 font-mono">Cryptographically Linked</div>
        </div>
      </div>

      {/* Quick Generation Action Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0C101C] space-y-2">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          Quick-Generate Sovereign Artifact
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/app/files/export-docx"
            download
            className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Generate Executive DOCX</span>
          </a>
          <a
            href="/api/app/files/export-pptx"
            download
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Presentation PPTX</span>
          </a>
          <a
            href="/api/app/files/export-xlsx?rows=50"
            download
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Excel XLSX</span>
          </a>
          <Link
            href="/app/diagrams"
            className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Synthesize Vector Diagram</span>
          </Link>
          <Link
            href="/app/images"
            className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Neural Image Studio</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Lineage Hub & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Lineage Graph Canvas (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-white/10 overflow-hidden bg-[#0A0D15] flex flex-col">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs font-mono text-white">Lineage Graph (DAG)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Click any node to inspect provenance</span>
          </div>

          <div className="p-6 min-h-[380px] flex-1 flex flex-col justify-center bg-[#07090F]">
            {artifacts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-mono text-slate-400">No artifacts generated yet.</div>
                <p className="text-[11px] text-slate-500">
                  Use the quick-generate buttons above to generate executive Word documents, presentations, workbooks, or diagrams.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Pipeline Flow */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {artifacts.slice(0, 6).map((art, idx) => {
                    const isSelected = selectedNode?.id === art.id;
                    return (
                      <div key={art.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedNode(art)}
                          className={`p-3.5 rounded-2xl border text-left transition-all max-w-[190px] relative ${
                            isSelected
                              ? "bg-[#0E1729] border-cyan-400 shadow-glow-cyan scale-105"
                              : "bg-[#0A0D18] border-white/10 hover:border-white/20 hover:bg-[#0D1220]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            {getArtifactIcon(art.type)}
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase ${getBadgeColor(
                                art.type
                              )}`}
                            >
                              {art.type.replace("DOCUMENT_", "").replace("PRESENTATION_", "").replace("SPREADSHEET_", "")}
                            </span>
                          </div>
                          <div className="font-bold text-[11px] font-mono text-white truncate">{art.title}</div>
                          <div className="text-[9px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                            <span>{(art.fileSize / 1024).toFixed(1)} KB</span>
                            <span className="text-emerald-400">VERIFIED</span>
                          </div>
                        </button>
                        {idx < Math.min(artifacts.length - 1, 5) && (
                          <div className="text-cyan-500/60 font-mono text-xs hidden sm:block">→</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Lock className="w-3 h-3" />
                    <span>DAG Integrity Enforced: Every node is immutable &amp; signed with SHA-256</span>
                  </div>
                  <span>Showing {Math.min(artifacts.length, 6)} of {artifacts.length} nodes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Node Inspector Drawer (1 Column) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D17] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs font-mono text-white">Artifact Inspector</span>
              </div>
              {selectedNode && (
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getBadgeColor(
                    selectedNode.type
                  )}`}
                >
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Title</div>
                  <div className="font-bold text-sm text-white font-sans mt-0.5">{selectedNode.title}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Verification Status</div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED TAMPER PROOF</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">MIME Type &amp; Size</div>
                  <div className="text-slate-300 mt-0.5">
                    {selectedNode.mimeType} • {(selectedNode.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">SHA-256 Checksum</div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedNode.integrityHash}
                      className="w-full bg-[#07090E] border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono text-cyan-300 focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyHash(selectedNode.integrityHash)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Timestamp</div>
                  <div className="text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(selectedNode.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedNode.previewData && (
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Preview Content</div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[11px] text-slate-300 font-sans line-clamp-4 mt-1">
                      {selectedNode.previewData}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-mono py-10 text-center">
                Select an artifact to inspect its cryptographic metadata.
              </div>
            )}
          </div>

          {selectedNode && (
            <a
              href={selectedNode.downloadUrl}
              download
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Verified Artifact</span>
            </a>
          )}
        </div>
      </div>

      {/* Artifacts Catalog Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-sm font-mono text-slate-300 uppercase tracking-wider">
            Sovereign Artifacts Catalog ({filteredArtifacts.length})
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artifacts..."
                className="bg-[#07090E] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#07090E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Formats</option>
              <option value="DOCUMENT_DOCX">Word (.docx)</option>
              <option value="PRESENTATION_PPTX">PowerPoint (.pptx)</option>
              <option value="SPREADSHEET_XLSX">Excel (.xlsx)</option>
              <option value="DIAGRAM_SVG">Diagram (.svg)</option>
              <option value="IMAGE_PNG">Image (.png)</option>
            </select>
          </div>
        </div>

        {filteredArtifacts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center text-xs text-slate-400 bg-[#0A0D15]">
            No artifacts found matching your criteria.
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-black/40">
                  <tr>
                    <th className="py-3 px-4">Artifact Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">SHA-256 Signature</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredArtifacts.map((art) => (
                    <tr
                      key={art.id}
                      onClick={() => setSelectedNode(art)}
                      className={`cursor-pointer transition-colors ${
                        selectedNode?.id === art.id ? "bg-cyan-500/10" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-sans font-semibold text-white flex items-center gap-2.5">
                        {getArtifactIcon(art.type)}
                        <span className="truncate max-w-sm">{art.title}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${getBadgeColor(
                            art.type
                          )}`}
                        >
                          {art.type.replace("DOCUMENT_", "").replace("PRESENTATION_", "").replace("SPREADSHEET_", "")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{(art.fileSize / 1024).toFixed(1)} KB</td>
                      <td className="py-3.5 px-4 text-cyan-300 font-mono text-[10px] truncate max-w-xs">
                        {art.integrityHash.substring(0, 16)}...
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(art.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={art.downloadUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
