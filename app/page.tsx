"use client";

import Link from "next/link";
import { Brain, Sparkles, ArrowRight, Zap, Activity } from "lucide-react";
import { navItems } from "@/components/Sidebar";

const moduleItems = navItems.filter(item => item.href !== "/");

const stats = [
  { label: "AI Models", value: "6+" },
  { label: "Powered by", value: "Groq" },
  { label: "Speed", value: "~150ms" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-4 px-5 md:px-8 py-4 pl-16 md:pl-8"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: "rgba(10,12,24,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", boxShadow: "0 0 10px rgba(34,211,238,0.5)" }}>
          <Brain size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-[11px] font-bold tracking-[0.15em] uppercase text-cyan-400">System Nexus</h1>
          <p className="text-[10px]" style={{ color: "off-white" }}>Core Control Hub</p>
        </div>
        <div className="ml-auto flex items-center gap-2 badge badge-glow border-cyan-500/30">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400" />
          <span className="text-[9px] font-bold tracking-widest text-cyan-400">ONLINE</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="px-5 md:px-8 pt-14 pb-10 text-center animate-fade-in relative">
        <div className="inline-flex items-center gap-2 badge mb-6 border-indigo-500/30 bg-indigo-500/10">
          <Zap size={11} className="text-indigo-400" />
          <span className="text-indigo-400 text-[10px] tracking-[0.2em]">GROQ-POWERED ENGINE</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-[1.08] drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
          <span style={{ color: "var(--fg)" }}>YOUR </span>
          <span className="text-gradient-vivid uppercase">AI WORKSPACE</span>
        </h1>
        <p className="text-sm md:text-base max-w-xl mx-auto px-4 leading-relaxed uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Initialize any of the six specialized AI modules.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-gradient-brand">{s.value}</div>
              <div className="text-[0.65rem] uppercase tracking-wider mt-0.5" style={{ color: "var(--faint)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="mx-5 md:mx-8 mb-8" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

      {/* ── Modules Grid ───────────────────────────────── */}
      <section className="px-5 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={14} style={{ color: "var(--brand-2)" }} />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Available Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleItems.map(({ href, icon: Icon, label, description, accent, accentBg }, i) => (
            <Link
              key={href}
              href={href}
              className="module-card group p-5 flex flex-col gap-4 border border-white/5 bg-[#0a0c18]/80 hover:bg-[#0f1224] hover:border-cyan-500/30 transition-all duration-300"
              style={{ animationDelay: `${i * 0.07}s`, borderRadius: "12px", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}
            >
              {/* Hover glow overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                style={{ background: `radial-gradient(400px circle at 50% 0%, ${accent}15, transparent 70%)` }} />

              <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${accent}40`, boxShadow: `0 0 15px ${accent}20` }}>
                  <Icon size={18} style={{ color: accent }} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[11px] mb-1 transition-colors uppercase tracking-[0.1em] group-hover:text-white"
                    style={{ color: "var(--fg)", textShadow: `0 0 10px ${accent}60` }}>
                    {label}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider leading-relaxed" style={{ color: "var(--muted)" }}>
                    {description}
                  </p>
                </div>

                <ArrowRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                  style={{ color: accent }} />
              </div>

              {/* Bottom accent line */}
              <div className="relative z-10 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full mt-2"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent)`, boxShadow: `0 0 8px ${accent}` }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <section className="px-5 md:px-8 pb-16 text-center">
        <div className="glass-card p-8 max-w-xl mx-auto border border-cyan-500/20 bg-[#0a0c18]/80 shadow-[inset_0_0_30px_rgba(34,211,238,0.1)]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.5)", boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}>
            <Sparkles size={24} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-2 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Initialize General AI</h3>
          <p className="text-[11px] mb-5 uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Ask anything, generate images, analyze PDFs and photos.
          </p>
          <Link href="/general" className="btn-primary" style={{ borderRadius: "8px", boxShadow: "0 0 15px rgba(99,102,241,0.5)" }}>
            LAUNCH GENERAL CHAT
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
