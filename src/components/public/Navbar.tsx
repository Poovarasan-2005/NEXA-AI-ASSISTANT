"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Sparkles, Menu, X, ArrowRight, UserCheck } from "lucide-react";

export function PublicNavbar() {
  const [authState, setAuthState] = useState<{
    authenticated: boolean;
    user?: { name: string; role: string };
  }>({ authenticated: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return { authenticated: false };
      })
      .then((data) => {
        if (data.authenticated) {
          setAuthState({ authenticated: true, user: data.user });
        }
      })
      .catch(() => setAuthState({ authenticated: false }));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 bg-[#07090e]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white font-mono">NEXA</span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                OS
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#capabilities" className="hover:text-cyan-400 transition-colors">
            Capabilities
          </Link>
          <Link href="/#architecture" className="hover:text-cyan-400 transition-colors">
            Architecture
          </Link>
          <Link href="/#multimodal" className="hover:text-cyan-400 transition-colors">
            Multimodal
          </Link>
          <Link href="/#memory" className="hover:text-cyan-400 transition-colors">
            Memory
          </Link>
          <Link href="/#security" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security</span>
          </Link>
        </nav>

        {/* Dynamic Auth State Controls */}
        <div className="hidden md:flex items-center gap-4">
          {authState.authenticated ? (
            <div className="flex items-center gap-3">
              {authState.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-xs font-mono px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all"
                >
                  Admin Console
                </Link>
              )}
              <Link
                href="/app"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 transition-all"
              >
                <span>Open NEXA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/app/settings"
                className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all"
                title="Profile & Settings"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 transition-all"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-4 pb-6 space-y-4 bg-[#07090e]">
          <Link
            href="/#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 text-base"
          >
            Capabilities
          </Link>
          <Link
            href="/#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 text-base"
          >
            Architecture
          </Link>
          <Link
            href="/#multimodal"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 text-base"
          >
            Multimodal
          </Link>
          <Link
            href="/#memory"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 text-base"
          >
            Memory
          </Link>
          <Link
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 text-base"
          >
            Security Architecture
          </Link>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {authState.authenticated ? (
              <>
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm"
                >
                  Open NEXA Command Center
                </Link>
                {authState.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-sm"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl glass-panel text-white text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
