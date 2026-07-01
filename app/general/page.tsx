"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Image as ImageIcon, Code, Zap } from "lucide-react";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { sendGeneralChat, saveConversation } from "@/lib/api";

const SUGGESTIONS = [
  { icon: ImageIcon, text: "Generate an image of a futuristic cyberpunk city" },
  { icon: Code, text: "Write a Python script to scrape a website" },
  { icon: Sparkles, text: "Write a cover letter for a Software Engineer role" },
  { icon: Zap, text: "Help me prepare for a system design interview" },
];

export default function GeneralChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const historySessionId = useRef<string | undefined>(undefined);

  const handleSendMessage = async (content: string, file?: File) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content || (file ? `[Attached File: ${file.name}]` : ""),
      file: file,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content || (m.file ? `Please analyze the attached file: ${m.file.name}` : ""),
      }));

      const res = await sendGeneralChat(apiMessages, file);
      
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.data.answer,
        timestamp: new Date(),
      };
      
      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(() => updatedMessages);

      // Auto-save history if user is signed in
      if (session?.user?.email) {
        try {
          const saveRes = await saveConversation({
            user_id: session.user.email,
            module: "general",
            messages: updatedMessages.map(m => ({
              role: m.role,
              content: m.content,
              id: m.id,
            })),
            session_id: historySessionId.current,
          });
          // Store session ID so future messages update same session
          if (saveRes.data?.id) {
            historySessionId.current = saveRes.data.id;
          }
        } catch (e) {
          // History save failure is non-blocking
          console.warn("History save failed:", e);
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "❌ Sorry, I encountered an error. Please check your Groq API key or try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 pl-16 md:pl-6 flex items-center justify-between sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,8,16,0.8)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-semibold flex items-center gap-2" style={{ color: "var(--fg)" }}>
              General AI Chat
              <span className="badge badge-glow">Multimodal</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask anything, attach an image/PDF, or say 'generate an image of...'"
          accentColor="from-indigo-500 to-violet-500"
          accentHex="#818cf8"
          allowFileUpload={true}
          setMessages={setMessages}
          emptyStateComponent={
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-8 pb-24 w-full">
              <div className="max-w-3xl mx-auto w-full animate-fade-in flex flex-col justify-center min-h-full pt-10">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-pulse-glow">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-vivid">
                    How can I help you today?
                  </h1>
                  <p className="text-base md:text-lg max-w-xl mx-auto px-4" style={{ color: "var(--muted)" }}>
                    Ask me anything, prompt me to <span className="text-gradient-brand font-medium">"generate an image"</span>, or click the <span style={{ color: "var(--fg)" }}>📎</span> to upload a PDF or Image for analysis!
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto w-full mb-12">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s.text)}
                      className="module-card p-4 flex items-center gap-3 text-left group"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <s.icon size={15} style={{ color: "#818cf8" }} />
                      </div>
                      <p className="text-sm leading-snug" style={{ color: "var(--muted)" }}>{s.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
