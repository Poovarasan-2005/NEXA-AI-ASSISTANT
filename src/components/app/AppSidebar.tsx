"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Database,
  ShieldAlert,
  Wrench,
  Clock,
  Shield,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  Folder,
  Image as ImageIcon,
  Scale,
  Layers,
  Share2,
  BarChart3,
  Compass,
  FolderKanban,
  GitFork,
  Search,
} from "lucide-react";

interface AppSidebarProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    autonomyLevel: string;
    pauseMemory: boolean;
  };
  isAdmin: boolean;
  pendingApprovalsCount: number;
}

export function AppSidebar({ user, isAdmin, pendingApprovalsCount }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      router.push("/login");
    }
  };

  const navItems = [
    { label: "Command Center", href: "/app", icon: LayoutDashboard },
    { label: "Chat Workspace", href: "/app/chat", icon: MessageSquare },
    { label: "Projects", href: "/app/projects", icon: FolderKanban },
    { label: "Workflows", href: "/app/workflows", icon: GitFork },
    { label: "Active Tasks", href: "/app/tasks", icon: CheckSquare },
    { label: "Memory Center", href: "/app/memory", icon: Database },
    { label: "AI Constitution", href: "/app/constitution", icon: Scale },
    { label: "Files & Datasets", href: "/app/files", icon: Folder },
    { label: "Image Studio", href: "/app/images", icon: ImageIcon },
    { label: "Diagram Studio", href: "/app/diagrams", icon: Layers },
    { label: "AI Data Studio", href: "/app/data", icon: BarChart3 },
    { label: "Deep Research", href: "/app/research", icon: Compass },
    { label: "Artifact Graph", href: "/app/artifacts", icon: Share2 },
    {
      label: "Approvals",
      href: "/app/approvals",
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    { label: "Trust Center", href: "/app/trust", icon: ShieldCheck },
    { label: "Tool Registry", href: "/app/tools", icon: Wrench },
    { label: "Activity Timeline", href: "/app/activity", icon: Clock },
  ];

  const settingItems = [
    { label: "Security & MFA", href: "/app/settings/security", icon: Shield },
    { label: "Preferences & Autonomy", href: "/app/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-[#0A0D15] border-r border-white/10 w-64">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/app" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-glow-cyan">
              <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-mono text-white tracking-tight">NEXA</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  OS
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Link if authorized */}
        {isAdmin && (
          <div className="px-2">
            <Link
              href="/admin"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono hover:bg-purple-500/25 transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Admin Console</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                GOVERN
              </span>
            </Link>
          </div>
        )}

        {/* Command-K Search Button */}
        <div className="px-2">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all text-xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              <span>Search / Actions</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-slate-400 border border-slate-700/80">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2">
            OPERATING SYSTEM
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Settings Navigation */}
        <nav className="space-y-1 pt-4 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2">
            SECURITY & PREFERENCES
          </div>
          {settingItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Account Profile Box & Sign out */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
            {user.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-mono transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0D15] border-b border-white/10">
        <Link href="/app" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-mono font-bold text-white">NEXA OS</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col h-screen shrink-0 sticky top-0">{sidebarContent}</aside>
    </>
  );
}
