"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Folder,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  File,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Printer,
  ArrowRight,
  Layers,
  Share2,
} from "lucide-react";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dataset Generator State
  const [datasetType, setDatasetType] = useState("telemetry");
  const [datasetRows, setDatasetRows] = useState("25");

  // PDF Generator State
  const [pdfTitle, setPdfTitle] = useState("NEXA AI Executive Operational Audit");
  const [pdfContent, setPdfContent] = useState(
    "This verified executive report certifies that all autonomous agent actions operate within strict v8-isolate sandboxes and enforce human-in-the-loop authorization for high-risk operations. Zero tamper events detected in the audit vault."
  );

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/app/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
      }
    } catch (e) {
      console.error("Failed to load files:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch("/api/app/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `File "${selected.name}" ingested and indexed into RAG memory!` });
        await loadFiles();
      } else {
        setMessage({ type: "error", text: data.error || "File upload failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error uploading file." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file from your sovereign workspace?")) return;
    try {
      await fetch(`/api/app/files?id=${id}`, { method: "DELETE" });
      await loadFiles();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Folder className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white">Files, Datasets & Export Hub</h1>
        </div>
        <p className="text-xs text-slate-400">
          Upload PDF documents and CSV datasets, generate parameterized tabular telemetry, synthesize neural images, and compile executive PDF reports.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="glass-panel p-8 sm:p-10 rounded-3xl border border-dashed border-white/20 hover:border-cyan-500/50 bg-[#0A0D17] text-center cursor-pointer transition-all space-y-3 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.csv,.json,.txt,.png,.jpg,.jpeg"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto group-hover:scale-105 transition-transform">
          {uploading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="font-bold text-sm text-white font-mono">
            {uploading ? "Ingesting & Chunking Document..." : "Click or Drag to Ingest Documents & Datasets"}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF, CSV Datasets, JSON schemas, Text files (Max 25MB). Automatically vectorized for RAG recall.
          </p>
        </div>
      </div>

      {/* Interactive Export & Generation Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Tabular Dataset Generator & CSV Downloader */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
              <h3 className="font-bold text-sm font-mono text-white">Dataset Generator (CSV)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Configure and instantly download RFC-4180 compliant datasets for analysis or machine learning pipelines.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Dataset Schema
              </label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none cursor-pointer"
              >
                <option value="telemetry">System Subsystem Telemetry</option>
                <option value="audit">Security Audit & Tamper Proofs</option>
                <option value="memory">Episodic & Semantic Vectors</option>
                <option value="benchmarks">Model Safety & Alignment Benchmarks</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Record Count
              </label>
              <div className="flex gap-1.5">
                {["10", "25", "50", "100", "250"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDatasetRows(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      datasetRows === r
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-[#07090E] border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <a
            href={`/api/app/files/export-csv?type=${datasetType}&rows=${datasetRows}&filename=nexa_${datasetType}_${datasetRows}_records.csv`}
            download
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-emerald cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV ({datasetRows} rows)</span>
          </a>
        </div>

        {/* Module 2: Executive PDF Report Generator */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-sm font-mono text-white">Executive PDF Exporter</h3>
            </div>
            <p className="text-xs text-slate-400">
              Compile publication-grade PDF documents with verified cryptographic headers and zero-trust audit stamps.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Document Title
              </label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Summary / Findings
              </label>
              <textarea
                value={pdfContent}
                onChange={(e) => setPdfContent(e.target.value)}
                rows={2}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl p-2 text-[11px] text-slate-300 focus:outline-none focus:border-rose-500/50 resize-none font-sans"
              />
            </div>
          </div>

          <a
            href={`/api/app/files/export-pdf?title=${encodeURIComponent(pdfTitle)}&content=${encodeURIComponent(pdfContent)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate & Print PDF</span>
          </a>
        </div>

        {/* Module 3: Neural Image Studio Hub */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <ImageIcon className="w-5 h-5" />
              <h3 className="font-bold text-sm font-mono text-white">AI Neural Image Studio</h3>
            </div>
            <p className="text-xs text-slate-400">
              Generate cybernetic architectural visualizations, system blueprints, and neural network schematics.
            </p>

            <div className="rounded-2xl overflow-hidden border border-white/10 relative h-32 bg-black">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                alt="Neural preview"
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-3">
                <span className="text-[10px] font-mono text-cyan-300">
                  NEXA Neural Diffusion Core v2.4 Active
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/app/images"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <span>Open Image Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Executive Document Suite: Word (.docx), PowerPoint (.pptx), Excel (.xlsx) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D15] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Executive Document Studio (DOCX, PPTX, XLSX)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate native Microsoft Office files with cryptographic zero-trust validation and automatic artifact lineage tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app/diagrams"
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Diagram Studio</span>
            </Link>
            <Link
              href="/app/artifacts"
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Lineage Graph</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Card 1: DOCX */}
          <div className="p-4 rounded-2xl bg-[#0C111E] border border-blue-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-blue-300">Word Document (.docx)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">EXECUTIVE BRIEF</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Strategic audit memo with callout boxes, formatted data tables, action items, and cryptographic sign-off.
              </p>
            </div>
            <a
              href="/api/app/files/export-docx"
              download
              className="w-full py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .DOCX</span>
            </a>
          </div>

          {/* Card 2: PPTX */}
          <div className="p-4 rounded-2xl bg-[#0C111E] border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-300">PowerPoint Deck (.pptx)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">6 SLIDES</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dark Modern 16:9 executive presentation with system pillars, architecture layout, benchmarks, and roadmap.
              </p>
            </div>
            <a
              href="/api/app/files/export-pptx"
              download
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .PPTX</span>
            </a>
          </div>

          {/* Card 3: XLSX */}
          <div className="p-4 rounded-2xl bg-[#0C111E] border border-emerald-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-300">Excel Workbook (.xlsx)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">3 TABS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Multi-sheet workbook featuring Executive KPIs, Raw Telemetry Logs, and AI Constitution Policy Matrix.
              </p>
            </div>
            <a
              href="/api/app/files/export-xlsx?rows=50"
              download
              className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .XLSX</span>
            </a>
          </div>
        </div>
      </div>

      {/* Uploaded Files Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm font-mono text-slate-300 uppercase tracking-wider">
            Ingested Workspace Documents & Datasets ({files.length})
          </h2>
          <button
            onClick={loadFiles}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Files</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Scanning indexed workspace files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center text-xs text-slate-400 bg-[#0A0D15]">
            <File className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <span>No documents uploaded yet. Use the upload area above to add PDFs or datasets.</span>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D15]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-black/40">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">RAG Chunks</th>
                    <th className="py-3 px-4">Indexed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {files.map((f) => (
                    <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white flex items-center gap-2">
                        {f.fileType.includes("pdf") ? (
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : f.fileType.includes("csv") ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : f.fileType.includes("image") ? (
                          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <File className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate max-w-xs">{f.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 text-cyan-300 text-[11px]">{f.fileType}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {(f.fileSize / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400">
                        {f.chunksCount || 1} chunks
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                        {f.filePath && (
                          <a
                            href={f.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="View / Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
