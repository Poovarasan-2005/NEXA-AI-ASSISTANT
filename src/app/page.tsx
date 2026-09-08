import Link from "next/link";
import {
  Brain,
  Database,
  Search,
  FileCode,
  Layers,
  ShieldCheck,
  ArrowRight,
  Lock,
  Eye,
  CheckCircle2,
  Terminal,
  Cpu,
  Fingerprint,
  Sparkles,
  Key,
  Flame,
  FileText,
  Mic,
  Monitor,
  Video,
  FileSpreadsheet,
} from "lucide-react";
import { PublicNavbar } from "@/components/public/Navbar";
import { HeroCommandCore } from "@/components/public/HeroCommandCore";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />

      <main className="flex-1 pt-24">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-8 shadow-glow-cyan animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>THE ZERO-TRUST MULTIMODAL AI OPERATING SYSTEM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6 font-mono">
              Your AI. Your Memory. <br className="hidden sm:inline" />
              <span className="gradient-text-cyan">Your Tools. Your Control.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
              NEXA is a secure multimodal AI operating system that understands your goals, plans
              complex tasks, uses connected tools, verifies its work, and remembers what matters —
              keeping you firmly in control.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link
                href="/signup"
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-semibold text-base shadow-glow-cyan hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                <span>Start with NEXA</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#architecture"
                className="flex items-center gap-2 px-8 py-4 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-cyan-500/40 text-base font-medium transition-all"
              >
                <span>Explore capabilities</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-4 rounded-xl text-slate-400 hover:text-white text-base font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>

            {/* Hero Visual: Original Command-Core Visualization */}
            <div className="mt-8">
              <HeroCommandCore />
            </div>
          </div>
        </section>

        {/* SECTION A — AI THAT DOES MORE */}
        <section id="capabilities" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#090C14]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                BEYOND CONVERSATIONAL CHATBOTS
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4">
                An AI Architecture Engineered To Do More
              </h3>
              <p className="text-slate-400 text-base">
                NEXA is not a standard chat window. It is an agentic platform equipped with verifiable
                cognition, sandbox execution, long-term memory, and human firewalls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: THINK */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">THINK</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Reason through complex multi-layered problems using recursive planning trees and
                  specialized cognitive agents.
                </p>
              </div>

              {/* Card 2: REMEMBER */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">REMEMBER</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Maintain controlled, auditable long-term memory partitioned into episodic, semantic,
                  and preference tiers with full user editability.
                </p>
              </div>

              {/* Card 3: RESEARCH */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">RESEARCH</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Autonomously search indexed knowledge, crawl authoritative web sources, evaluate
                  evidence, and provide verifiable citations.
                </p>
              </div>

              {/* Card 4: CREATE */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <FileCode className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">CREATE</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Generate structured production code, technical specifications, data pipelines,
                  and verified documentation formatted precisely.
                </p>
              </div>

              {/* Card 5: CONNECT */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">CONNECT</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Integrate with external APIs, Model Context Protocol (MCP) servers, local file
                  systems, and relational databases securely.
                </p>
              </div>

              {/* Card 6: VERIFY */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">VERIFY</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Never assume the initial output is accurate. The automated verification judge
                  scrubs secrets, validates schemas, and checks facts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW NEXA WORKS */}
        <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#07090E]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                HUMAN-CONTROLLED AUTONOMY
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4">
                How NEXA Works
              </h3>
              <p className="text-slate-400 text-base">
                Autonomous agent behavior must never be opaque or unchecked. NEXA runs on a rigid,
                auditable 7-step operational lifecycle.
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-center">
                {[
                  { title: "UNDERSTAND", desc: "Intent, constraints & context retrieval" },
                  { title: "PLAN", desc: "Decompose into structured task steps" },
                  { title: "EXECUTE", desc: "Run sandboxed tools within boundaries" },
                  { title: "VERIFY", desc: "Ground facts and scrub credentials" },
                  { title: "APPROVAL", desc: "Firewall halts high-risk actions for you" },
                  { title: "COMPLETE", desc: "Present verified synthesis to user" },
                  { title: "REMEMBER", desc: "Inscribe confirmed episodic insights" },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-cyan-400 mb-1">0{idx + 1}</div>
                      <div className="font-bold text-sm font-mono text-white mb-2">{item.title}</div>
                    </div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-center max-w-2xl mx-auto text-xs text-cyan-200">
                <span className="font-semibold text-cyan-400">Core Governance Principle:</span> AI can
                assist and plan. AI can act with permission. AI must not control the user.
              </div>
            </div>
          </div>
        </section>

        {/* MULTIMODAL AI SECTION */}
        <section id="multimodal" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#090C14]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                CROSS-MODALITY INTERACTION
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4">
                Multimodal Sensory Architecture
              </h3>
              <p className="text-slate-400 text-base">
                Interact with NEXA through any medium. Talk, upload complex documents, analyze live
                screens, execute code, and synthesize tabular data seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 text-center mb-12">
              {[
                { label: "TEXT", icon: FileText, color: "text-blue-400" },
                { label: "VOICE", icon: Mic, color: "text-cyan-400" },
                { label: "IMAGE", icon: Eye, color: "text-purple-400" },
                { label: "PDF", icon: FileText, color: "text-rose-400" },
                { label: "DOCUMENT", icon: FileSpreadsheet, color: "text-emerald-400" },
                { label: "SCREEN", icon: Monitor, color: "text-amber-400" },
                { label: "VIDEO", icon: Video, color: "text-red-400" },
                { label: "CODE", icon: Terminal, color: "text-teal-400" },
                { label: "DATA", icon: Cpu, color: "text-indigo-400" },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all"
                  >
                    <Icon className={`w-6 h-6 ${m.color}`} />
                    <span className="text-xs font-mono font-semibold text-slate-300">{m.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-3xl mx-auto text-center">
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                &ldquo;Talk to NEXA. Upload a PDF. Show a screenshot. Analyze data. Research the web.
                Work with code. Build a plan.&rdquo;
              </p>
              <span className="text-xs font-mono text-cyan-400">
                Single unified context with intelligent token budgets and citations.
              </span>
            </div>
          </div>
        </section>

        {/* MEMORY SYSTEM */}
        <section id="memory" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#07090E]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                SOVEREIGN RECALL
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4">
                Verifiable Multi-Tier Memory
              </h3>
              <p className="text-slate-400 text-base">
                Never silently store sensitive information. Every memory entry has an inspected source,
                confidence score, timestamps, and full user controls to edit, pause, or forget.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              {[
                { name: "Short-Term", desc: "Active task session memory" },
                { name: "Long-Term", desc: "Cross-session foundational context" },
                { name: "Project Memory", desc: "Bound to specific workspace scopes" },
                { name: "Preference Memory", desc: "Style, format & coding standards" },
                { name: "Task Memory", desc: "Progress state & execution milestones" },
                { name: "Semantic Memory", desc: "Vectorized factual repository" },
                { name: "Episodic Memory", desc: "Past event & outcome milestones" },
                { name: "Temporal Memory", desc: "Time-decay and scheduled workflows" },
              ].map((mem) => (
                <div
                  key={mem.name}
                  className="glass-panel p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="text-sm font-mono font-bold text-white mb-1">{mem.name}</div>
                  <div className="text-xs text-slate-400">{mem.desc}</div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs font-mono text-slate-400">
                <span>MEMORY ENTITY SCHEMA SPECIFICATION</span>
                <span className="text-emerald-400">FULL USER OVERSIGHT</span>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-cyan-300">
                <div>• memory_id</div>
                <div>• type</div>
                <div>• content</div>
                <div>• source</div>
                <div>• confidence</div>
                <div>• created_at</div>
                <div>• last_confirmed_at</div>
                <div>• user_id / project_id</div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> View Memory
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Edit Memory
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delete Memory
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pause Memory
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Forget Everything
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY & TRUST ARCHITECTURE */}
        <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#090C14]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-3">
                ENTERPRISE ZERO-TRUST ARCHITECTURE
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4">
                Engineered for Absolute Security
              </h3>
              <p className="text-slate-400 text-base">
                Proving who a user is does not automatically grant access to every tool. NEXA enforces
                strict authentication, role-based authorization, sandboxed execution, and human approval.
              </p>
            </div>

            {/* Visual Trust Pipeline */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-5xl mx-auto mb-12">
              <div className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-wider text-center">
                ZERO-TRUST EXECUTION PIPELINE
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                {[
                  "USER",
                  "IDENTITY",
                  "AUTHORIZATION",
                  "PERMISSION ENGINE",
                  "RISK ENGINE",
                  "AI AGENT",
                  "TOOL",
                  "VERIFICATION",
                  "RESULT",
                ].map((step, idx) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-cyan-300 font-semibold">
                      {step}
                    </span>
                    {idx < 8 && <span className="text-slate-600">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Fingerprint, title: "Authentication", desc: "Bcrypt hashing, rate limiting, and email verification" },
                { icon: Lock, title: "Authorization", desc: "Granular RBAC with anti-IDOR server-side filters" },
                { icon: Key, title: "MFA & Passkeys", desc: "TOTP authenticator app and backup recovery codes" },
                { icon: ShieldCheck, title: "Session Protection", desc: "HttpOnly cookies, rotation, and remote revocation" },
                { icon: Flame, title: "Prompt Injection Defense", desc: "Input sanitization and adversarial guardrails" },
                { icon: Terminal, title: "Sandbox Execution", desc: "Isolated micro-VM execution for code and scripts" },
                { icon: FileText, title: "Audit Logging", desc: "Immutable security records of all sensitive actions" },
                { icon: Eye, title: "Privacy Controls", desc: "Isolated memory boundaries and data export" },
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <div key={sec.title} className="glass-panel p-6 rounded-xl border border-white/5">
                    <Icon className="w-5 h-5 text-cyan-400 mb-3" />
                    <div className="font-bold text-sm text-white mb-1 font-mono">{sec.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{sec.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#07090E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-white tracking-wider">NEXA AI</span>
            <span className="text-xs text-slate-500">— Sovereign AI Operating System</span>
          </div>
          <div className="text-xs font-mono text-slate-500">
            &copy; {new Date().getFullYear()} NEXA AI OS. Built with Zero-Trust Security.
          </div>
        </div>
      </footer>
    </div>
  );
}
