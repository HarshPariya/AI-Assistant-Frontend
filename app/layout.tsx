import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Career & Research Assistant",
  description: "Multi-Modal GenAI Platform — Resume Reviewer, Interview Assistant, PDF Chatbot, Research, and Image Q&A powered by Groq AI",
  keywords: "AI, career, resume, interview, RAG, GenAI, Groq, research",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: "var(--bg)", color: "var(--fg)" }}>
        {/* Tech grid overlay */}
        <div aria-hidden="true" className="fixed inset-0 dot-grid pointer-events-none z-0" />

        {/* Vignette fade */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0"
          style={{ background: "radial-gradient(circle at center, transparent 0%, var(--bg) 110%)" }} />

        {/* Neon outer frame glow (Cyberpunk / SquidAI inspired) */}
        <div className="fixed inset-0 pointer-events-none z-50"
          style={{ boxShadow: "inset 0 0 100px rgba(34,211,238,0.05), inset 0 0 20px rgba(99,102,241,0.05)", border: "1px solid rgba(34,211,238,0.05)" }} />

        {/* App Shell */}
        <AuthProvider>
          <div className="relative z-10 flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
