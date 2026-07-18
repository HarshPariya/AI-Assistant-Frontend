"use client";

import { useState } from "react";
import { BookOpen, Upload, FileText, Loader2, ChevronRight, Sparkles, GitCompare, BookMarked, Key, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { uploadResearchPDFs, performResearchAction, saveConversation } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface DocInfo {
  doc_id: number;
  filename: string;
  page_count: number;
  word_count: number;
  chunk_count: number;
}

const ACTIONS = [
  { id: "summarize_all", label: "Summarize All", icon: Sparkles, color: "from-pink-500 to-rose-500", desc: "Get a summary of each document + overall synthesis" },
  { id: "compare", label: "Compare Documents", icon: GitCompare, color: "from-blue-500 to-cyan-500", desc: "Compare methodology, findings, and conclusions" },
  { id: "study_notes", label: "Study Notes", icon: BookMarked, color: "from-emerald-500 to-teal-500", desc: "Key concepts, definitions, main arguments" },
  { id: "key_takeaways", label: "Key Takeaways", icon: Key, color: "from-amber-500 to-orange-500", desc: "Top 10-15 most important points" },
  { id: "ask", label: "Ask a Question", icon: MessageSquare, color: "from-violet-500 to-purple-500", desc: "Ask anything about the documents" },
];

export default function ResearchPage() {
  const { data: session } = useSession();
  const historySessionId = useRef<string | undefined>(undefined);
  const historyMessages = useRef<Array<{ role: string; content: string; id?: string }>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [result, setResult] = useState<string>("");
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadError("");
    historySessionId.current = undefined;
    historyMessages.current = [];
    try {
      const res = await uploadResearchPDFs(files);
      setSessionId(res.data.session_id);
      setDocuments(res.data.documents);
    } catch (e: any) {
      setUploadError(e.response?.data?.detail || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const runAction = async (actionId: string) => {
    if (!sessionId) return;
    setActiveAction(actionId);
    setResult("");
    setActionError("");
    setIsActing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${API_URL}/research/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          action: actionId,
          query: actionId === "ask" ? customQuery : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      setIsActing(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = "";

      while (reader && !done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          assistantContent += chunkValue;
          
          if (assistantContent.includes("__METADATA__::")) {
            const parts = assistantContent.split("__METADATA__::");
            assistantContent = parts[0];
          }
          setResult(assistantContent);
        }
      }
      
      if (session?.user?.email) {
        try {
          const actionLabel = ACTIONS.find(a => a.id === actionId)?.label || actionId;
          const userContent = actionId === "ask" ? `Asked: ${customQuery}` : `Action: ${actionLabel}`;
          const newMessages = [
            ...historyMessages.current,
            { role: "user", content: userContent, id: `user-${Date.now()}` },
            { role: "assistant", content: assistantContent, id: `ai-${Date.now()}` },
          ];
          historyMessages.current = newMessages;
          const saveRes = await saveConversation({
            user_id: session.user.email,
            module: "research",
            title: `Research on ${documents.length} Docs`,
            messages: newMessages,
            session_id: historySessionId.current,
          });
          if (saveRes.data?.id) historySessionId.current = saveRes.data.id;
        } catch (e) {
          console.warn("History save failed:", e);
        }
      }
    } catch (e: any) {
      setActionError(e.message || "Action failed.");
    } finally {
      setIsActing(false);
    }
  };

  const reset = () => {
    setSessionId(null);
    historySessionId.current = undefined;
    historyMessages.current = [];
    setDocuments([]);
    setResult("");
    setActiveAction(null);
  };

  return (
    <div className="min-h-[100dvh] p-5 md:p-8 pt-4">
      {/* Header */}
      <div className="mb-7 animate-fade-in flex items-center justify-between pl-16 md:pl-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e879f9, #f472b6)" }}>
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Research Assistant</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Multi-PDF analysis, summarization & comparison</p>
          </div>
        </div>
        {sessionId && (
          <button onClick={reset}
            className="text-xs transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
          >
            Upload New PDFs
          </button>
        )}
      </div>

      {!sessionId ? (
        <div className="glass-card p-8 animate-scale-in max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #e879f9, #f472b6)" }}>
              <Upload size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--fg)" }}>Upload Research PDFs</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Upload up to 3 PDFs — papers, reports, textbooks</p>
          </div>
          <FileUpload
            onFileSelect={() => {}}
            onMultipleFilesSelect={handleUpload}
            isLoading={isUploading}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
            multiple
            label="Upload Research Documents or Images"
            description="Upload up to 3 files — PDFs, photos of notes, or screenshots"
            accentHex="#e879f9"
            maxSizeMB={20}
          />
          {uploadError && (
            <div className="mt-4 p-3 rounded-xl text-sm text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {uploadError}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: Documents + Actions */}
          <div className="space-y-4">
            {/* Documents */}
            <div className="glass-card p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--faint)" }}>Uploaded Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.doc_id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(232,121,249,0.08)", border: "1px solid rgba(232,121,249,0.15)" }}>
                    <FileText size={13} className="flex-shrink-0" style={{ color: "#e879f9" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--fg)" }}>{doc.filename}</p>
                      <p className="text-[10px]" style={{ color: "var(--faint)" }}>{doc.page_count} pages • {doc.word_count.toLocaleString()} words</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Actions</h3>
              <div className="space-y-2">
                {ACTIONS.map(({ id, label, icon: Icon, color, desc }) => (
                  <button
                    key={id}
                    onClick={() => id !== "ask" && runAction(id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      activeAction === id
                        ? "bg-white/10 border-white/20"
                        : "border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{label}</p>
                      <p className="text-xs text-gray-500 truncate">{desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-600 flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Custom query for ask */}
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && customQuery && runAction("ask")}
                  placeholder="Ask a question about the documents..."
                  className="w-full bg-gray-800/80 border border-white/10 text-[16px] md:text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-violet-500/50 transition-colors placeholder-gray-500"
                />
                <button
                  onClick={() => customQuery && runAction("ask")}
                  disabled={!customQuery || isActing}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-40 hover:shadow-lg transition-all"
                >
                  Ask Question
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 glass-card p-6 min-h-[500px]">
            {isActing ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Loader2 size={36} className="text-pink-400 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Analyzing documents...</p>
              </div>
            ) : actionError ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Oops! Something went wrong</h3>
                <p className="text-sm text-red-300 max-w-md mb-6 p-4 bg-red-500/5 rounded-xl border border-red-500/10">{actionError}</p>
                {actionError.includes("expired") || actionError.includes("sleep") ? (
                  <button onClick={reset} className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2">
                    <RefreshCw size={16} /> Start New Session
                  </button>
                ) : (
                  <button onClick={() => activeAction && runAction(activeAction)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all">
                    Try Again
                  </button>
                )}
              </div>
            ) : result ? (
              <div className="animate-fade-in flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white capitalize block">
                      {ACTIONS.find((a) => a.id === activeAction)?.label || "Analysis Result"}
                    </span>
                    <span className="text-[10px] text-gray-400">Generated by Llama-3 70B</span>
                  </div>
                </div>
                <div className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                  <BookOpen size={32} className="text-gray-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Ready to analyze</h3>
                <p className="text-gray-500 text-sm max-w-xs">Select an action on the left to extract insights from your documents</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
