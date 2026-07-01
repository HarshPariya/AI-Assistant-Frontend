"use client";

import { useState } from "react";
import { FileText, TrendingUp, Target, AlertTriangle, CheckCircle2, Lightbulb, Briefcase, Upload } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { analyzeResume } from "@/lib/api";

interface ResumeAnalysis {
  ats_score: number;
  ats_breakdown: {
    formatting: number;
    keywords: number;
    experience: number;
    skills: number;
    education: number;
  };
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  improvements: string[];
  job_roles: Array<{ role: string; match_score: number; reason: string }>;
  overall_feedback: string;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-white">{score}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await analyzeResume(file);
      setAnalysis(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to analyze resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-5 md:p-8 pt-4">
      {/* Header */}
      <div className="mb-7 animate-fade-in pl-16 md:pl-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #38bdf8, #22d3ee)" }}>
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Resume Reviewer</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>AI-powered ATS analysis & career insights</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="glass-card p-6 mb-7 animate-scale-in">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--muted)" }}>
          <Upload size={13} /> Upload Your Resume
        </h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          accept=".pdf"
          label="Drop your PDF resume here"
          description="or click to browse — we'll analyze it with AI"
          accentHex="#38bdf8"
        />
        {error && (
          <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATS Score */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>ATS Score</p>
              <ScoreRing score={analysis.ats_score} size={120} />
              <p className={`mt-3 text-sm font-semibold ${
                analysis.ats_score >= 80 ? "text-green-400" :
                analysis.ats_score >= 60 ? "text-yellow-400" : "text-red-400"
              }`}>
                {analysis.ats_score >= 80 ? "Excellent" : analysis.ats_score >= 60 ? "Good" : "Needs Work"}
              </p>
            </div>

            {/* ATS Breakdown */}
            <div className="glass-card p-6 col-span-1 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <TrendingUp size={13} /> Score Breakdown
              </p>
              <div className="space-y-3">
                <BreakdownBar label="Formatting" value={analysis.ats_breakdown.formatting} max={20} />
                <BreakdownBar label="Keywords" value={analysis.ats_breakdown.keywords} max={25} />
                <BreakdownBar label="Experience" value={analysis.ats_breakdown.experience} max={25} />
                <BreakdownBar label="Skills" value={analysis.ats_breakdown.skills} max={20} />
                <BreakdownBar label="Education" value={analysis.ats_breakdown.education} max={10} />
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={13} /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={13} /> Weaknesses
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                    <span className="text-red-400 mt-0.5">✗</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-3 flex items-center gap-2">
              <Target size={13} /> Missing Skills to Add
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_skills.map((skill, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#fde68a" }}>
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#38bdf8" }}>
              <Lightbulb size={13} /> Improvement Suggestions
            </h3>
            <ol className="space-y-2">
              {analysis.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--muted)" }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>{i + 1}</span>
                  {imp}
                </li>
              ))}
            </ol>
          </div>

          {/* Job Role Matches */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#a78bfa" }}>
              <Briefcase size={13} /> Best Job Role Matches
            </h3>
            <div className="space-y-3">
              {analysis.job_roles.map((jr, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{jr.role}</span>
                      <span className="text-xs" style={{ color: "#a78bfa" }}>{jr.match_score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${jr.match_score}%`, background: "linear-gradient(90deg, #6366f1, #a78bfa)" }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--faint)" }}>{jr.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="glass-card p-6" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--fg)" }}>Overall AI Feedback</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--muted)" }}>{analysis.overall_feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
