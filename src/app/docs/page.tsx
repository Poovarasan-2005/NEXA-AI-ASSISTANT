import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { BookOpen, Terminal, Shield, ArrowRight } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
            DOCUMENTATION & SPECIFICATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white mb-2">
            NEXA Architecture Documentation
          </h1>
          <p className="text-sm text-slate-400">
            Technical guides, zero-trust API specifications, and tool sandbox deployment instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Quickstart Guide",
              desc: "Deploy NEXA, create your initial identity, and execute your first sandboxed task.",
              href: "/login",
            },
            {
              title: "Human Firewall Spec",
              desc: "Understand risk classification heuristics, approval tokens, and step-up auth policies.",
              href: "/security",
            },
            {
              title: "Memory Engine API",
              desc: "Integrating episodic vector storage, retention limits, and tenant partition boundaries.",
              href: "/features",
            },
          ].map((doc) => (
            <Link
              key={doc.title}
              href={doc.href}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <BookOpen className="w-5 h-5 text-cyan-400 mb-3" />
                <h3 className="font-bold text-sm font-mono text-white mb-2">{doc.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{doc.desc}</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 mt-4 flex items-center gap-1">
                <span>Read doc</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Code Example */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 bg-[#0A0D15]">
          <div className="text-xs font-mono text-slate-400 uppercase">
            EXAMPLE: AGENT EXECUTION WITH HUMAN APPROVAL INTERCEPT
          </div>
          <pre className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-cyan-300 overflow-x-auto">
{`const result = await runOrchestration({
  userId: "usr_2026_alex",
  prompt: "Send weekly compliance report to security-ops@internal",
  preferredModel: "nexa-core-reasoner",
});

// Result status: WAITING_FOR_APPROVAL (Risk Level: HIGH)
// Action halted until human approval token verified.`}
          </pre>
        </div>
      </main>
    </div>
  );
}
