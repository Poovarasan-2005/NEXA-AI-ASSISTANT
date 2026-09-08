"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Shield, Database, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState("ASK_BEFORE_ACTING");
  const [pauseMemory, setPauseMemory] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/app/settings");
      if (res.ok) {
        const data = await res.json();
        setName(data.user.name);
        setAutonomyLevel(data.user.autonomyLevel || "ASK_BEFORE_ACTING");
        setPauseMemory(data.user.pauseMemory || false);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/app/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, autonomyLevel, pauseMemory }),
      });

      if (res.ok) {
        setSuccessMsg("Settings updated successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white">System Preferences & Autonomy</h1>
        </div>
        <p className="text-xs text-slate-400">
          Configure agent autonomy boundaries, continuous memory ingestion, and workspace profiles.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Retrieving settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Profile Name */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 bg-[#0A0D15]">
            <h3 className="font-bold text-sm font-mono text-white">User Identity</h3>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">DISPLAY NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Autonomy Level Policy */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 bg-[#0A0D15]">
            <div>
              <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Agent Autonomy Governance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Controls when the Human Approval Firewall halts agent execution for explicit confirmation.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "ASK_BEFORE_ACTING",
                  title: "Ask before acting (Recommended)",
                  desc: "Firewall intercepts any action rated MEDIUM, HIGH, or CRITICAL. Highest safety posture.",
                },
                {
                  id: "ALLOW_LOW_RISK",
                  title: "Allow low-risk operations",
                  desc: "Autonomous retrieval and read-only searches proceed automatically; intercepts code execution and external APIs.",
                },
                {
                  id: "ADVANCED_AUTOMATION",
                  title: "Advanced automation mode",
                  desc: "Agents chain subtasks autonomously; human confirmation required only for irreversible CRITICAL deletions.",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    autonomyLevel === opt.id
                      ? "bg-cyan-500/10 border-cyan-500/40"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="autonomy"
                    value={opt.id}
                    checked={autonomyLevel === opt.id}
                    onChange={(e) => setAutonomyLevel(e.target.value)}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div>
                    <div className="font-semibold text-xs text-white font-mono">{opt.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Memory Controls */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 bg-[#0A0D15]">
            <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Continuous Memory Policy</span>
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pauseMemory}
                onChange={(e) => setPauseMemory(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-300">
                Pause Memory Ingestion (stops recording new episodic and factual memories from active chats)
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-glow-cyan hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
