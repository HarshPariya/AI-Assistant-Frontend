"use client";

import { Suspense } from "react";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Upload, Trash2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { uploadChatPDF, askChatQuestion, saveConversation, getConversation } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useModulePersistence } from "@/hooks/useModulePersistence";
import { clearModuleState } from "@/lib/moduleState";

function ChatbotContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const historySessionId = useRef<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [chunkCount, setChunkCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useModulePersistence({
    module: "chatbot",
    state: { sessionId, fileName, chunkCount, messages: messages.map(({ id, role, content, sources }) => ({ id, role, content, sources })), historySessionId: historySessionId.current },
    enabled: !!sessionId,
    onRestore: (saved) => {
      if (saved.sessionId) setSessionId(saved.sessionId);
      if (saved.fileName) setFileName(saved.fileName);
      if (saved.chunkCount) setChunkCount(saved.chunkCount);
      if (saved.messages?.length) {
        setMessages(saved.messages.map((m) => ({ ...m, role: m.role as "user" | "assistant", timestamp: new Date() })));
      }
      if (saved.historySessionId) historySessionId.current = saved.historySessionId;
    },
    onMongoRestore: (data) => {
      historySessionId.current = data.id;
      setMessages(data.messages.map((m) => ({
        id: m.id || `${m.role}-${Math.random()}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(),
      })));
    },
  });

  useEffect(() => {
    const resumeId = searchParams.get("resume");
    if (!resumeId) return;
    getConversation(resumeId).then((res) => {
      historySessionId.current = res.data.id;
      setMessages(res.data.messages.map((m: { id?: string; role: string; content: string }) => ({
        id: m.id || `${m.role}-${Math.random()}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(),
      })));
    }).catch(() => {});
  }, [searchParams]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError("");
    historySessionId.current = undefined;
    try {
      const res = await uploadChatPDF(file);
      setSessionId(res.data.session_id);
      setFileName(res.data.filename);
      setChunkCount(res.data.chunk_count);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `✅ **"${res.data.filename}"** uploaded successfully!\n\nI've indexed **${res.data.chunk_count} text chunks** and I'm ready to answer questions. What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    } catch (e: any) {
      setUploadError(e.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAsk = async (message: string) => {
    if (!sessionId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const res = await askChatQuestion(sessionId, message);

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.data.answer,
        sources: res.data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];

        if (session?.user?.email) {
          saveConversation({
            user_id: session.user.email,
            module: "chatbot",
            title: `PDF Chat: ${fileName}`,
            messages: updated.map((m) => ({ role: m.role, content: m.content, id: m.id })),
            session_id: historySessionId.current,
          })
            .then((saveRes) => {
              if (saveRes.data?.id) historySessionId.current = saveRes.data.id;
            })
            .catch((e) => console.warn("History save failed:", e));
        }

        return updated;
      });
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `❌ ${e.response?.data?.detail || "Failed to get answer. Please try again."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const reset = () => {
    setSessionId(null);
    historySessionId.current = undefined;
    setFileName("");
    setMessages([]);
    setUploadError("");
    clearModuleState("chatbot");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 md:px-6 py-4 pl-16 md:pl-6 flex items-center justify-between sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,8,16,0.8)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fb923c, #f59e0b)" }}>
            <MessageSquare size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>PDF Chatbot</h1>
            <p className="text-[10px]" style={{ color: "var(--faint)" }}>RAG-powered document chat with source citations</p>
          </div>
        </div>
        {sessionId && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#fb923c" }} />
              <span className="text-xs font-medium truncate max-w-32" style={{ color: "#fdba74" }}>{fileName}</span>
              <span className="text-xs" style={{ color: "var(--faint)" }}>({chunkCount} chunks)</span>
            </div>
            <button onClick={reset}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--faint)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}
              title="Upload new document">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                style={{ background: "linear-gradient(135deg, #fb923c, #f59e0b)" }}>
                <Upload size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--fg)" }}>Upload a PDF to Chat With</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Our RAG system will index your document and let you ask questions with source citations</p>
            </div>
            <FileUpload
              onFileSelect={handleUpload}
              isLoading={isUploading}
              accept=".pdf"
              label="Drop your PDF here"
              description="or click to browse"
              accentHex="#fb923c"
            />
            {uploadError && (
              <div className="mt-4 p-3 rounded-xl text-sm text-center"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleAsk}
            isLoading={isChatLoading}
            placeholder="Ask anything about the document..."
            accentColor="from-orange-500 to-amber-500"
            accentHex="#fb923c"
            setMessages={setMessages}
          />
        </div>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[var(--muted)]">Loading...</div>}>
      <ChatbotContent />
    </Suspense>
  );
}
