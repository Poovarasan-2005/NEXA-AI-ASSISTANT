import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { Brain, Database, Shield, Wrench, Search, Code, Cpu, ArrowRight } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "Agentic Planner Core",
      desc: "Deconstructs complex objectives into Directed Acyclic Graphs (DAGs) with automated checkpointing and rollback capabilities.",
    },
    {
      icon: Database,
      title: "Partitioned Sovereign Memory",
      desc: "Continuous memory isolated across semantic, episodic, preference, and project scopes with user editing and complete purge rights.",
    },
    {
      icon: Shield,
      title: "Human Approval Firewall",
      desc: "Dynamic risk analysis engine halts execution of high-risk tools and external dispatches until verified by the user.",
    },
    {
      icon: Wrench,
      title: "Sandboxed Tool Registry",
      desc: "Connects web crawlers, Model Context Protocol (MCP) servers, local file systems, and databases within isolated micro-sandboxes.",
    },
    {
      icon: Search,
      title: "Deep Web Research Agent",
      desc: "Recursive search, citation scoring, source deduplication, and evidence synthesis with confidence rankings.",
    },
    {
      icon: Code,
      title: "Isolated Code Execution",
      desc: "Run Python and JavaScript computations in strict v8 isolate containers without exposure to host resources.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
            CORE CAPABILITIES
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mb-4">
            Built for Autonomous Execution with Human Authority
          </h1>
          <p className="text-slate-400 text-base">
            Every feature in NEXA is engineered around zero-trust boundaries, verified factual grounding,
            and auditable agent operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-mono text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto bg-gradient-to-b from-white/[0.04] to-transparent">
          <h2 className="text-2xl font-bold font-mono text-white mb-3">Ready to deploy your AI OS?</h2>
          <p className="text-slate-400 text-sm mb-6">
            Get started in seconds with sovereign memory and zero-trust security.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan"
          >
            <span>Launch NEXA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
