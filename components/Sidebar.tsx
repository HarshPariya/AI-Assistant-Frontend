"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText, Mic, MessageSquare, BookOpen, Camera, Brain,
  Sparkles, Menu, X, ChevronLeft, ChevronRight, Zap, History
} from "lucide-react";
import { useState, useEffect } from "react";
import UserMenu from "@/components/UserMenu";

export const navItems = [
  {
    href: "/",
    icon: Brain,
    label: "App Hub",
    description: "Dashboard overview",
    accent: "rgba(99,102,241,0.8)",
    accentBg: "rgba(99,102,241,0.12)",
  },
  {
    href: "/general",
    icon: Sparkles,
    label: "General AI Chat",
    description: "Multimodal ChatGPT",
    accent: "rgba(129,140,248,0.9)",
    accentBg: "rgba(129,140,248,0.12)",
    color: "from-indigo-500 to-violet-500",
  },
  {
    href: "/resume",
    icon: FileText,
    label: "Resume Reviewer",
    description: "ATS scoring & feedback",
    accent: "rgba(56,189,248,0.9)",
    accentBg: "rgba(56,189,248,0.12)",
    color: "from-sky-500 to-cyan-500",
  },
  {
    href: "/interview",
    icon: Mic,
    label: "Interview Assistant",
    description: "Mock interviews & prep",
    accent: "rgba(52,211,153,0.9)",
    accentBg: "rgba(52,211,153,0.12)",
    color: "from-emerald-500 to-teal-500",
  },
  {
    href: "/chatbot",
    icon: MessageSquare,
    label: "PDF Chatbot",
    description: "Chat with any PDF",
    accent: "rgba(251,146,60,0.9)",
    accentBg: "rgba(251,146,60,0.12)",
    color: "from-orange-500 to-amber-500",
  },
  {
    href: "/research",
    icon: BookOpen,
    label: "Research Assistant",
    description: "Multi-PDF analysis",
    accent: "rgba(232,121,249,0.9)",
    accentBg: "rgba(232,121,249,0.12)",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    href: "/vision",
    icon: Camera,
    label: "Image Q&A",
    description: "Vision AI & captioning",
    accent: "rgba(167,139,250,0.9)",
    accentBg: "rgba(167,139,250,0.12)",
    color: "from-violet-500 to-purple-500",
  },
  {
    href: "/history",
    icon: History,
    label: "Chat History",
    description: "Your saved conversations",
    accent: "rgba(34,211,238,0.9)",
    accentBg: "rgba(34,211,238,0.12)",
    color: "from-cyan-500 to-teal-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        aria-label="Open menu"
      >
        <Menu size={18} style={{ color: "var(--fg)" }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative flex flex-col h-screen transition-all duration-300 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-[68px]" : "w-[240px]"}`}
        style={{
          background: "rgba(6,8,16,0.85)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: "var(--muted)" }}
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-5 transition-all duration-200"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Animated logo mark */}
          <div className="relative flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}>
            <div className="absolute inset-0 rounded-xl animate-spin-slow"
              style={{ background: "conic-gradient(from 0deg, transparent 60%, rgba(255,255,255,0.3) 100%)" }} />
            <Zap size={15} className="relative z-10 text-white" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold leading-tight" style={{ color: "var(--fg)" }}>AI Platform</p>
              <p className="text-[10px] leading-tight" style={{ color: "var(--muted)" }}>Career & Research</p>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {!collapsed && (
            <div className="mb-4 px-1">
              <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400/80 uppercase">System Modules</p>
            </div>
          )}
          {navItems.map(({ href, icon: Icon, label, description, accent, color }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-300`}
                style={isActive ? {
                  background: "rgba(34,211,238,0.03)",
                  border: `1px solid rgba(34,211,238,0.15)`,
                  boxShadow: `inset 0 0 10px rgba(34,211,238,0.05)`,
                } : {
                  border: "1px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <Icon size={14} style={{ color: isActive ? accent : "var(--muted)" }} />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold leading-tight truncate transition-colors uppercase tracking-wider"
                        style={{ color: isActive ? "var(--fg)" : "var(--muted)", textShadow: isActive ? `0 0 8px ${accent}60` : "none" }}>
                        {label}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Glowing Dot Indicator */}
                {!collapsed && (
                  <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'animate-pulse' : 'opacity-20'}`}
                    style={{ 
                      background: isActive ? accent : 'var(--muted)',
                      boxShadow: isActive ? `0 0 8px ${accent}, 0 0 4px ${accent}` : 'none'
                    }} 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer – status + user menu */}
        {!collapsed && (
          <div className="px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
              <p className="text-[0.65rem]" style={{ color: "var(--faint)" }}>
                Powered by Groq + LangChain
              </p>
            </div>
          </div>
        )}
        <UserMenu collapsed={collapsed} />

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center z-10 transition-colors duration-200"
          style={{
            background: "var(--bg-2, #0b0d18)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "var(--muted)",
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
