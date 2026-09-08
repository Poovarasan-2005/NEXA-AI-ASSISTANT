import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Community / Self-Hosted",
      price: "$0",
      period: "forever open source",
      desc: "Deploy NEXA on your private infrastructure with complete zero-trust sovereignty.",
      features: [
        "Full Multi-Tier Memory Engine",
        "Autonomous Agent Planner",
        "Human Approval Firewall",
        "Local v8 Sandbox Execution",
        "TOTP MFA & Session Revocation",
        "Community Discord Support",
      ],
      cta: "Get Started Free",
      href: "/signup",
      highlighted: false,
    },
    {
      name: "Enterprise Sovereign",
      price: "$49",
      period: "per user / month",
      desc: "For security-first engineering organizations requiring audited agent infrastructure.",
      features: [
        "Everything in Community",
        "Dedicated Admin Governance Console",
        "Tamper-Resistant Security Audit Vault",
        "Custom MCP Server Integrations",
        "Role-Based Access Control (RBAC)",
        "SAML / Passkeys / WebAuthn Support",
        "99.9% Uptime SLA",
      ],
      cta: "Deploy Enterprise",
      href: "/signup",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <PublicNavbar />
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
            TRANSPARENT GOVERNANCE
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mb-4">
            Sovereign Control. Predictable Pricing.
          </h1>
          <p className="text-slate-400 text-base">
            No hidden token surcharges. Bring your own model keys or run locally with full zero-trust privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                tier.highlighted
                  ? "glass-panel border-cyan-500/50 bg-[#0C111E] shadow-glow-cyan"
                  : "glass-panel border-white/10 bg-[#090D17]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg font-mono text-white">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      POPULAR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-extrabold font-mono text-white">{tier.price}</span>
                  <span className="text-xs font-mono text-slate-400">/{tier.period}</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{tier.desc}</p>

                <div className="space-y-3 font-mono text-xs text-slate-300 border-t border-white/5 pt-6">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={tier.href}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs font-mono transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan hover:opacity-95"
                      : "glass-panel text-white hover:border-cyan-500/40"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
