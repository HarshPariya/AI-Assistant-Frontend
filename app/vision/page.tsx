"use client";

import { useState } from "react";
import { Camera, Upload, Image as ImageIcon, Tag, Eye, Loader2, X } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { analyzeImage, askAboutImage, saveConversation } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface VisionAnalysis {
  session_id: string;
  caption: string;
  objects: string[];
  description: string;
  mood: string;
  colors: string[];
}

export default function VisionPage() {
  const { data: session } = useSession();
  const historySessionId = useRef<string | undefined>(undefined);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleImageUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsAnalyzing(true);
    setUploadError("");
    setAnalysis(null);
    historySessionId.current = undefined;
    setMessages([]);

    try {
      const res = await analyzeImage(file);
      const data: VisionAnalysis = res.data;
      setAnalysis(data);
      setMessages([
        {
          id: "caption",
          role: "assistant",
          content: `🖼️ **Image Analyzed!**\n\n**Caption:** ${data.caption}\n\n**Description:** ${data.description}\n\n**Mood:** ${data.mood}\n\nFeel free to ask me anything about this image!`,
          timestamp: new Date(),
        },
      ]);
    } catch (e: any) {
      setUploadError(e.response?.data?.detail || "Failed to analyze image.");
      setPreviewUrl("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAsk = async (question: string) => {
    if (!analysis) return;

    const userMessage = { id: `user-${Date.now()}`, role: "user" as const, content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    setIsChatLoading(true);
    try {
      const res = await askAboutImage(analysis.session_id, question);
      const assistantMessage = { id: `ai-${Date.now()}`, role: "assistant" as const, content: res.data.answer, timestamp: new Date() };
      const allMsgs = [...messages, userMessage, assistantMessage];
      setMessages(() => allMsgs);

      if (session?.user?.email) {
        try {
          const saveRes = await saveConversation({
            user_id: session.user.email,
            module: "vision",
            title: `Image Analysis`,
            messages: allMsgs.map(m => ({ role: m.role, content: m.content, id: m.id })),
            session_id: historySessionId.current,
          });
          if (saveRes.data?.id) historySessionId.current = saveRes.data.id;
        } catch (e) {
          console.warn("History save failed:", e);
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "❌ Failed to answer. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setPreviewUrl("");
    historySessionId.current = undefined;
    setMessages([]);
    setUploadError("");
  };

  return (
    <div className="min-h-screen p-5 md:p-8 pt-4">
      {/* Header */}
      <div className="mb-7 animate-fade-in flex items-center justify-between pl-16 md:pl-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)" }}>
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Image Q&A</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>AI-powered image captioning and visual question answering</p>
          </div>
        </div>
        {analysis && (
          <button onClick={reset} className="text-xs transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
          >
            Upload New Image
          </button>
        )}
      </div>

      {!analysis && !isAnalyzing ? (
        <div className="max-w-md mx-auto animate-scale-in">
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)" }}>
                <ImageIcon size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--fg)" }}>Upload an Image</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Get AI-powered captions, object detection, and answer your questions</p>
            </div>
            <FileUpload
              onFileSelect={handleImageUpload}
              isLoading={isAnalyzing}
              accept=".jpg,.jpeg,.png,.webp,.gif"
              label="Drop your image here"
              description="or click to browse"
              maxSizeMB={10}
              accentHex="#a78bfa"
            />
            {uploadError && (
              <div className="mt-4 p-3 rounded-xl text-sm text-center"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 animate-pulse">
            <Loader2 size={28} className="text-white animate-spin" />
          </div>
          <p className="text-white font-medium mb-1">Analyzing your image...</p>
          <p className="text-gray-400 text-sm">Groq Vision AI is processing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in lg:h-[calc(100vh-160px)]">
          {/* Left: Image + Metadata */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-1">
            {/* Image Preview */}
            <div className="glass-card p-3 overflow-hidden">
              <img
                src={previewUrl}
                alt="Analyzed image"
                className="w-full rounded-xl object-contain max-h-64"
              />
            </div>

            {/* Caption */}
            {analysis && (
              <>
                <div className="glass-card p-4">
                  <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Eye size={12} /> Caption
                  </h3>
                  <p className="text-sm text-white leading-relaxed">{analysis.caption}</p>
                </div>

                {/* Objects */}
                <div className="glass-card p-4">
                  <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag size={12} /> Detected Objects
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.objects.map((obj, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="glass-card p-4">
                  <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.colors.map((color, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-700/80 text-gray-300">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="glass-card p-4">
                  <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Mood & Atmosphere</h3>
                  <p className="text-sm text-white">{analysis.mood}</p>
                </div>
              </>
            )}
          </div>

          {/* Right: Chat interface */}
          <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col h-[500px] lg:h-auto">
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Camera size={14} className="text-indigo-400" /> Ask About This Image
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
          <ChatInterface
                messages={messages}
                onSendMessage={handleAsk}
                isLoading={isChatLoading}
                placeholder="Ask me anything about this image..."
                accentColor="from-violet-500 to-purple-500"
                accentHex="#a78bfa"
                allowFileUpload={true}
                setMessages={setMessages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
