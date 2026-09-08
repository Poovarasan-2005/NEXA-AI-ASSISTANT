import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { Sparkles, Shield, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
            OUR PHILOSOPHY
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mb-6">
            The Sovereign AI Operating System
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            NEXA was created on a single uncompromising thesis: Artificial Intelligence should amplify human
            agency, not subvert it. True intelligence requires memory, tools, and reasoning — but genuine
            trust requires boundaries, verification, and human oversight.
          </p>
        </div>

        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-6 bg-[#0A0E18]">
          <h2 className="text-xl font-bold font-mono text-white">Why We Built NEXA</h2>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
            <p>
              Most existing AI products treat users as passive consumers of probabilistic chatbots.
              They silo your memory in proprietary clouds, hide tool execution behind opaque black boxes,
              and hallucinate answers without factual grounding or citations.
            </p>
            <p>
              NEXA inverts this paradigm. We built an AI Operating System where:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 font-mono text-xs">
              <li><strong className="text-cyan-400">Your Memory is Sovereign:</strong> View, edit, pause, and delete every stored memory node at will.</li>
              <li><strong className="text-cyan-400">Your Tools are Guarded:</strong> High-risk operations require explicit human cryptographic authorization.</li>
              <li><strong className="text-cyan-400">Your Work is Auditable:</strong> Every agent step is verified, signed, and inscribed into tamper-evident logs.</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan"
          >
            <span>Join the NEXA Movement</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
