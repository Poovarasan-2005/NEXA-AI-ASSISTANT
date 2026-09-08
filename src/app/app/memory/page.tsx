"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Search,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

export default function MemoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pauseMemory, setPauseMemory] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalMemory, setEditModalMemory] = useState<any | null>(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);

  // Form states
  const [formType, setFormType] = useState("PREFERENCE");
  const [formContent, setFormContent] = useState("");
  const [formSource, setFormSource] = useState("User Direct Statement");

  const categories = [
    "ALL",
    "PREFERENCE",
    "LONG_TERM",
    "FACT",
    "TASK",
    "PROJECT",
    "SEMANTIC",
    "EPISODIC",
    "TEMPORAL",
  ];

  const loadMemories = async () => {
    try {
      const [memRes, settRes] = await Promise.all([
        fetch(`/api/app/memory?type=${activeCategory}&q=${searchQuery}`),
        fetch("/api/app/settings"),
      ]);

      if (memRes.ok) {
        const memData = await memRes.json();
        setMemories(memData.memories);
      }
      if (settRes.ok) {
        const settData = await settRes.json();
        setPauseMemory(settData.user?.pauseMemory || false);
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [activeCategory, searchQuery]);

  const togglePauseMemory = async () => {
    const nextState = !pauseMemory;
    setPauseMemory(nextState);
    await fetch("/api/app/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pauseMemory: nextState }),
    });
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    try {
      const res = await fetch("/api/app/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          content: formContent.trim(),
          source: formSource.trim(),
        }),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setFormContent("");
        loadMemories();
      }
    } catch (e) {
      console.error("Failed to add memory:", e);
    }
  };

  const handleUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalMemory) return;

    try {
      const res = await fetch("/api/app/memory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryId: editModalMemory.id,
          content: editModalMemory.content,
          type: editModalMemory.type,
        }),
      });

      if (res.ok) {
        setEditModalMemory(null);
        loadMemories();
      }
    } catch (e) {
      console.error("Failed to update memory:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this memory record?")) return;
    try {
      await fetch(`/api/app/memory?id=${id}`, { method: "DELETE" });
      loadMemories();
    } catch (e) {
      console.error("Failed to delete memory:", e);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/app/memory?action=clear_all", { method: "DELETE" });
      setClearAllConfirmOpen(false);
      loadMemories();
    } catch (e) {
      console.error("Failed to purge memory:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold font-mono text-white">Memory Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Audit, edit, confirm, or purge long-term and episodic memory records with sovereign oversight.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePauseMemory}
            className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
              pauseMemory
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "glass-panel text-slate-300 hover:text-white"
            }`}
          >
            {pauseMemory ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{pauseMemory ? "Resume Memory Ingestion" : "Pause Memory"}</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-glow-cyan hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>

          <button
            onClick={() => setClearAllConfirmOpen(true)}
            className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors"
          >
            Clear All Memory
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory records by keyword, source, or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-[11px] font-mono whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "glass-panel text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory List Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Retrieving memory vectors...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <Database className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold font-mono text-white">No memory records found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? "No memory items matched your search query."
              : "Memory records will accumulate autonomously as you execute tasks or save entries manually."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0D15] flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {mem.type}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span>Confidence: {Math.round(mem.confidence * 100)}%</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">{mem.content}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="truncate max-w-[200px]" title={mem.source}>
                  Source: <span className="text-slate-300">{mem.source}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModalMemory(mem)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 bg-[#0C101C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base font-mono text-white">Inscribe New Memory</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">MEMORY TYPE</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="PREFERENCE">PREFERENCE (Formatting, style, conventions)</option>
                  <option value="LONG_TERM">LONG_TERM (Foundational identity & architecture)</option>
                  <option value="FACT">FACT (Verified technical knowledge)</option>
                  <option value="TASK">TASK (Operational checklist milestones)</option>
                  <option value="SEMANTIC">SEMANTIC (Domain conceptual models)</option>
                  <option value="EPISODIC">EPISODIC (Past event outcomes)</option>
                  <option value="TEMPORAL">TEMPORAL (Time-sensitive directives)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">CONTENT</label>
                <textarea
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Inscribe the memory payload clearly..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">SOURCE</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editModalMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 bg-[#0C101C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base font-mono text-white">Edit Memory Record</h3>
              <button
                onClick={() => setEditModalMemory(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">CONTENT</label>
                <textarea
                  rows={4}
                  required
                  value={editModalMemory.content}
                  onChange={(e) =>
                    setEditModalMemory({ ...editModalMemory, content: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalMemory(null)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs"
                >
                  Update Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Memory Confirmation Modal */}
      {clearAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-500/40 bg-[#0C101C] space-y-4 shadow-glow-rose">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-white font-mono">
                  Purge All Memory Records?
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  This action permanently erases all long-term, episodic, and preference memory
                  associated with your account. This action cannot be reversed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setClearAllConfirmOpen(false)}
                className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
