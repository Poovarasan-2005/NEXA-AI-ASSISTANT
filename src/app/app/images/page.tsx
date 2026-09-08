"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Eye,
  Maximize2,
  Share2,
} from "lucide-react";

interface GeneratedImage {
  id: string;
  filename: string;
  url: string;
  downloadUrl: string;
  prompt: string;
  style: string;
  resolution: string;
  aspectRatio?: string;
  createdAt: string;
}

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk");
  const [selectedResolution, setSelectedResolution] = useState("1024x1024");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [generating, setGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<GeneratedImage | null>(null);

  const styleOptions = [
    { id: "cyberpunk", label: "Cyberpunk Neon", desc: "Vibrant neon, dark cybernetic aesthetic" },
    { id: "isometric", label: "3D Isometric", desc: "Clean isometric render, technical precision" },
    { id: "architectural", label: "Architectural", desc: "High-contrast architectural and structural visual" },
    { id: "hologram", label: "Quantum Hologram", desc: "Translucent holographic data matrices" },
    { id: "minimal", label: "Dark Minimalist", desc: "Abstract, sleek geometry with deep gradients" },
  ];

  const presetPrompts = [
    "Futuristic zero-trust security operations center with quantum cryptographic feeds",
    "Neural diffusion processor core illuminating dark glass server chassis",
    "Holographic planetary memory index with vector search constellations",
    "Autonomous agent swarm architecture visualization in isometric 3D",
  ];

  const loadGallery = async () => {
    try {
      const res = await fetch("/api/app/images");
      if (res.ok) {
        const data = await res.json();
        setGallery(data.images || []);
        if (data.images && data.images.length > 0 && !activeImage) {
          setActiveImage(data.images[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/app/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          resolution: selectedResolution,
          aspectRatio: selectedAspectRatio,
        }),
      });

      const data = await res.json();
      if (data.success && data.image) {
        setActiveImage(data.image);
        setGallery((prev) => [data.image, ...prev]);
      } else {
        alert(data.error || "Generation failed.");
      }
    } catch (e) {
      alert("Network error generating image.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUrl = (img: GeneratedImage) => {
    navigator.clipboard.writeText(img.url);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white">AI Neural Image Studio</h1>
        </div>
        <p className="text-xs text-slate-400">
          Synthesize high-resolution visual assets, system architecture diagrams, and cybersecurity schematics with full cryptographic lineage.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Studio Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0A0D15] space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-bold">
                Generation Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe your visual concept in detail (e.g., Cyberpunk zero-trust server room with blue neon light conduits)..."
                className="w-full bg-[#07090E] rounded-xl border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
              />

              {/* Preset prompt pills */}
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  QUICK PROMPTS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presetPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(p)}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-400 border border-white/5 transition-all text-left truncate max-w-full"
                    >
                      {p.slice(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Style Presets</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedStyle === opt.id
                        ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-glow-cyan"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Resolution
                </label>
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
                >
                  <option value="1024x1024">1024x1024 (HD Square)</option>
                  <option value="1280x720">1280x720 (Wide Display)</option>
                  <option value="720x1280">720x1280 (Portrait)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Aspect Ratio
                </label>
                <div className="flex gap-1.5">
                  {["1:1", "16:9", "9:16"].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setSelectedAspectRatio(ratio)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        selectedAspectRatio === ratio
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                          : "bg-[#07090E] border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs font-mono tracking-wider uppercase shadow-glow-cyan hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Synthesizing Neural Diffusion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Synthesize Image Artifact</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Active Preview Canvas */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0C101C] flex flex-col h-full min-h-[440px] justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CANVAS PREVIEW & METADATA
                </span>
              </div>
              {activeImage && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {activeImage.resolution}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 uppercase">
                    {activeImage.style}
                  </span>
                </div>
              )}
            </div>

            {/* Canvas Body */}
            {generating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse shadow-glow-cyan">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white font-mono">
                    Diffusing Neural Tensors...
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Computing latent vectors, applying {selectedStyle} aesthetic filters, and verifying zero hallucination leakage.
                  </p>
                </div>
              </div>
            ) : activeImage ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 group max-h-[380px] bg-black">
                  <img
                    src={activeImage.url}
                    alt={activeImage.prompt}
                    className="w-full h-full max-h-[380px] object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPreviewModal(activeImage)}
                      className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-mono text-xs backdrop-blur-md flex items-center gap-1.5 transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>
                    <a
                      href={activeImage.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-glow-cyan flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Metadata & Actions bar */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="text-xs font-mono text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold mr-1.5">Prompt:</span>
                    &ldquo;{activeImage.prompt}&rdquo;
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                    <div>Created: {new Date(activeImage.createdAt).toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyUrl(activeImage)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === activeImage.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={activeImage.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors font-bold"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Image</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
                <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                <span>Enter a prompt on the left to synthesize your first neural image artifact.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm font-mono text-white uppercase tracking-wider">
              Synthesized Visual Artifacts Gallery ({gallery.length})
            </h2>
          </div>
          <button
            onClick={loadGallery}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Gallery</span>
          </button>
        </div>

        {loadingGallery ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Scanning visual artifact store...</span>
          </div>
        ) : gallery.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center text-xs text-slate-400 bg-[#0A0D15] font-mono">
            No image artifacts synthesized yet. Use the prompt studio above to create neural artwork.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`group glass-panel rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                  activeImage?.id === img.id
                    ? "border-cyan-500 shadow-glow-cyan bg-cyan-500/5"
                    : "border-white/10 hover:border-white/30 bg-[#0A0D15]"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-black">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300 border border-white/10">
                    {img.resolution}
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-300 truncate font-semibold">
                    {img.prompt}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="uppercase text-cyan-400">{img.style}</span>
                    <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/20 bg-[#0A0D17] max-w-4xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase">
                High-Resolution Asset Inspector
              </span>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-white/5"
              >
                Close (ESC)
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[65vh] flex items-center justify-center bg-black">
              <img
                src={previewModal.url}
                alt={previewModal.prompt}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-mono">
              <div className="text-slate-300 max-w-lg truncate">
                Prompt: &ldquo;{previewModal.prompt}&rdquo;
              </div>
              <a
                href={previewModal.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-glow-cyan"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
