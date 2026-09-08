"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResultItem {
  id: string;
  category: "PAGES" | "ACTIONS" | "PROJECTS" | "ARTIFACTS" | "RESEARCH" | "DATA" | "WORKFLOWS" | "MEMORIES";
  title: string;
  subtitle?: string;
  url: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults("");
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Fetch results when query changes
  async function fetchResults(searchQuery: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/app/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error("Command palette fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    fetchResults(val);
  }

  function handleSelect(item: SearchResultItem) {
    setIsOpen(false);
    router.push(item.url);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  }

  const categoryColors: Record<string, string> = {
    ACTIONS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    PAGES: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    PROJECTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    ARTIFACTS: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    RESEARCH: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    DATA: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    WORKFLOWS: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    MEMORIES: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0d121f] border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
          <svg className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, project, artifact, or search query..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
          )}
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching records found across sovereign workspace.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const catColor = categoryColors[item.category] || "bg-slate-800 text-slate-300 border-slate-700";

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-white"
                      : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase flex-shrink-0 ${catColor}`}
                    >
                      {item.category}
                    </span>
                    <div className="truncate">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-mono text-cyan-400 flex-shrink-0 ml-2">
                      Press ↵
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400/70">NEXA Sovereign Command Palette</span>
        </div>
      </div>
    </div>
  );
}
