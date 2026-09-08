"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Database,
  Share2,
  ExternalLink,
  Trash2,
  X,
  AlertCircle,
  GitFork,
  ArrowRight,
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  counts: {
    tasks: number;
    memories: number;
    files: number;
    artifacts: number;
    workflows: number;
  };
}

interface ProjectDetails extends ProjectItem {
  tasks: Array<{ id: string; title: string; status: string; progress: number; riskLevel: string; createdAt: string }>;
  memories: Array<{ id: string; content: string; type: string; confidence: number; source: string; createdAt: string }>;
  files: Array<{ id: string; filename: string; fileType: string; fileSize: number; scanStatus: string; createdAt: string }>;
  artifacts: Array<{ id: string; title: string; type: string; downloadUrl: string; verifiedStatus: string; integrityHash: string; createdAt: string }>;
  workflows: Array<{ id: string; name: string; status: string; triggerType: string; runsCount: number; lastRunStatus?: string; lastRunAt?: string }>;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"overview" | "artifacts" | "tasks" | "memories" | "workflows">("overview");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/app/projects");
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openProjectDetails(projectId: string) {
    try {
      const res = await fetch(`/api/app/projects/${projectId}`);
      const data = await res.json();
      if (data.project) {
        setSelectedProject(data.project);
        setInspectorOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/app/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.project) {
        setCreateModalOpen(false);
        setNewName("");
        setNewDescription("");
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Are you sure you want to delete this project workspace?")) return;

    try {
      const res = await fetch(`/api/app/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setInspectorOpen(false);
        setSelectedProject(null);
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalArtifactsCount = projects.reduce((sum, p) => sum + p.counts.artifacts, 0);
  const totalTasksCount = projects.reduce((sum, p) => sum + p.counts.tasks, 0);
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SOVEREIGN DOMAIN // ISOLATION BOUNDARIES
            </span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mt-2">
            Project Workspaces
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Contextual initiative workspaces with scoped tasks, memories, files, and verified cryptographic artifacts.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Workspace</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800/80">
          <div className="text-xs font-mono text-slate-400">Total Workspaces</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{projects.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800/80">
          <div className="text-xs font-mono text-emerald-400">Active Initiatives</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800/80">
          <div className="text-xs font-mono text-purple-400">Connected Artifacts</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{totalArtifactsCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800/80">
          <div className="text-xs font-mono text-cyan-400">Project Tasks</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{totalTasksCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 max-w-md">
        <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter workspaces by title or description..."
          className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">
          Loading sovereign project workspaces...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0b0f19] border border-slate-800/80">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No project workspaces yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Create an isolated project container to organize collaborative tasks, memories, documents, and workflows.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => openProjectDetails(p.id)}
              className="group p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-950/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : p.status === "COMPLETED"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <h3 className="text-base font-semibold font-mono text-white mt-3 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                  {p.description || "No project description specified."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 rounded bg-slate-900/60">
                    <div className="text-[10px] text-slate-500 font-mono">Tasks</div>
                    <div className="text-xs font-semibold text-slate-200">{p.counts.tasks}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60">
                    <div className="text-[10px] text-slate-500 font-mono">Artifacts</div>
                    <div className="text-xs font-semibold text-purple-300">{p.counts.artifacts}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60">
                    <div className="text-[10px] text-slate-500 font-mono">Memory</div>
                    <div className="text-xs font-semibold text-cyan-300">{p.counts.memories}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60">
                    <div className="text-[10px] text-slate-500 font-mono">Workflows</div>
                    <div className="text-xs font-semibold text-rose-300">{p.counts.workflows}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-slate-500">
                  <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Inspector Drawer / Modal */}
      {inspectorOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#0b0f19] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-mono text-white">{selectedProject.name}</h2>
                  <span className="text-xs text-slate-400">Workspace ID: {selectedProject.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteProject(selectedProject.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-[#090d16] px-6">
              {[
                { key: "overview", label: "Overview", icon: Layers },
                { key: "artifacts", label: `Artifacts (${selectedProject.artifacts.length})`, icon: Share2 },
                { key: "tasks", label: `Tasks (${selectedProject.tasks.length})`, icon: CheckCircle2 },
                { key: "memories", label: `Memories (${selectedProject.memories.length})`, icon: Database },
                { key: "workflows", label: `Workflows (${selectedProject.workflows.length})`, icon: GitFork },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = inspectorTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setInspectorTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-mono border-b-2 transition-colors cursor-pointer ${
                      isActive
                        ? "border-cyan-400 text-cyan-300 font-semibold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {inspectorTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Description</h4>
                    <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                      {selectedProject.description || "No description specified for this workspace."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-500">Status</div>
                      <div className="text-sm font-semibold text-emerald-400 mt-0.5">{selectedProject.status}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-500">Created</div>
                      <div className="text-sm font-semibold text-slate-200 mt-0.5">
                        {new Date(selectedProject.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-500">Total Artifacts</div>
                      <div className="text-sm font-semibold text-purple-300 mt-0.5">{selectedProject.artifacts.length}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-500">Workflows</div>
                      <div className="text-sm font-semibold text-rose-300 mt-0.5">{selectedProject.workflows.length}</div>
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === "artifacts" && (
                <div className="space-y-3">
                  {selectedProject.artifacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-mono">
                      No artifacts recorded in this workspace. Run a research, document, or diagram task with this project ID.
                    </div>
                  ) : (
                    selectedProject.artifacts.map((a) => (
                      <div key={a.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{a.title}</div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            {a.type} | Hash: {a.integrityHash.slice(0, 16)}...
                          </div>
                        </div>
                        <a
                          href={a.downloadUrl}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-500/20"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {inspectorTab === "tasks" && (
                <div className="space-y-3">
                  {selectedProject.tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-mono">
                      No tasks executed for this project yet.
                    </div>
                  ) : (
                    selectedProject.tasks.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{t.title}</div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            Status: {t.status} | Risk: {t.riskLevel} | Progress: {t.progress}%
                          </div>
                        </div>
                        <span className="text-xs font-mono text-cyan-400">{t.progress}%</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {inspectorTab === "memories" && (
                <div className="space-y-3">
                  {selectedProject.memories.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-mono">
                      No memories scoped to this project yet.
                    </div>
                  ) : (
                    selectedProject.memories.map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="text-sm text-slate-200">{m.content}</div>
                        <div className="text-xs font-mono text-cyan-400 mt-1">
                          Category: {m.type} | Confidence: {(m.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {inspectorTab === "workflows" && (
                <div className="space-y-3">
                  {selectedProject.workflows.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-mono">
                      No workflows bound to this project yet.
                    </div>
                  ) : (
                    selectedProject.workflows.map((w) => (
                      <div key={w.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{w.name}</div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            Trigger: {w.triggerType} | Runs: {w.runsCount} | Last Status: {w.lastRunStatus || "NEVER_RUN"}
                          </div>
                        </div>
                        <a
                          href={`/app/workflows?id=${w.id}`}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono hover:bg-rose-500/20"
                        >
                          Canvas
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b0f19] border border-cyan-500/30 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-mono text-white">Create Project Workspace</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Workspace Title *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Q3 Zero-Trust Security Audit"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Strategic Objectives / Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the initiative goals, boundary policies, and expected deliverables..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Initialize Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
