import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { ShieldCheck, Users, FileText, ArrowLeft, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getServerSession();

  // 1. Authentication check
  if (!sessionData) {
    redirect("/login?redirect=/admin");
  }

  // 2. Server-side Authorization Check (Admin Role Guard)
  if (!isAdmin(sessionData.user)) {
    // Ordinary user attempted to access /admin -> Safely redirect or block
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Admin Bar */}
      <header className="h-16 glass-panel border-b border-purple-500/30 bg-[#090714] px-4 sm:px-8 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-base">NEXA ADMIN</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                GOVERNANCE CORE
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User App</span>
          </Link>
          <div className="text-xs font-mono text-purple-300 hidden sm:block">
            Admin: {sessionData.user.email}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-56 p-4 border-r border-white/10 bg-[#0A0D15] shrink-0 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 mb-2">
            ADMINISTRATION
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-purple-500/15 hover:text-purple-300 transition-colors"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Metrics Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-purple-500/15 hover:text-purple-300 transition-colors"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>User Directory</span>
          </Link>
          <Link
            href="/admin/audit"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-purple-500/15 hover:text-purple-300 transition-colors"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>System Audit Logs</span>
          </Link>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
