"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, Bot, User, Sparkles, Paperclip,
  X, File as FileIcon, Pencil, Maximize2, Download
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ page: number; score: number }>;
  timestamp: Date;
  file?: File;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, file?: File) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  accentColor?: string;
  accentHex?: string;
  allowFileUpload?: boolean;
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  emptyStateComponent?: React.ReactNode;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  placeholder = "Ask anything...",
  emptyStateTitle = "Start a conversation",
  emptyStateSubtitle = "Ask me anything",
  accentColor = "from-indigo-500 to-cyan-500",
  accentHex = "#6366f1",
  allowFileUpload = false,
  setMessages,
  emptyStateComponent,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingFile, setViewingFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && !selectedFile) || isLoading) return;
    setInput("");
    const fileToSend = selectedFile || undefined;
    setSelectedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSendMessage(trimmed, fileToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditMessage = (index: number) => {
    const msg = messages[index];
    if (msg.role === "user") {
      setInput(msg.content);
      if (msg.file) setSelectedFile(msg.file);
      if (setMessages) setMessages((prev) => prev.slice(0, index));
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
        {messages.length === 0 ? (
          emptyStateComponent ? emptyStateComponent : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 animate-fade-in">
              {emptyStateTitle && (
                <>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accentColor} flex items-center justify-center mb-4 animate-pulse-glow`}>
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>{emptyStateTitle}</h3>
                  <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>{emptyStateSubtitle}</p>
                </>
              )}
            </div>
          )
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-white/08"
                  : `bg-gradient-to-br ${accentColor}`
              }`}
              style={msg.role === "user" ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" } : {}}>
                {msg.role === "user"
                  ? <User size={14} style={{ color: "var(--muted)" }} />
                  : <Bot size={14} className="text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] flex flex-col gap-1 group ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className="px-4 py-3 text-sm leading-relaxed relative transition-all"
                  style={msg.role === "user" ? {
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--fg)",
                    borderRadius: "12px 12px 2px 12px",
                  } : {
                    background: "rgba(10,12,24,0.5)",
                    border: `1px solid ${accentHex}30`,
                    boxShadow: `inset 0 0 20px ${accentHex}05`,
                    color: "var(--fg)",
                    borderRadius: "12px 12px 12px 2px",
                  }}
                >
                  {/* Header row (role label + edit button) */}
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
                      {msg.role === "user" ? "You" : "AI"}
                    </span>
                    {msg.role === "user" && (
                      <button
                        type="button"
                        onClick={() => handleEditMessage(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ color: "var(--faint)" }}
                        title="Edit message"
                        onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>

                  {/* File preview */}
                  {msg.role === "user" && msg.file && (
                    <div className="mb-2">
                      {msg.file.type.startsWith("image/") ? (
                        <div
                          className="relative cursor-pointer group/img inline-block"
                          onClick={() => setViewingFile(msg.file!)}
                        >
                          <img
                            src={URL.createObjectURL(msg.file)}
                            alt="Attached"
                            className="max-w-full max-h-48 rounded-xl object-contain group-hover/img:opacity-80 transition-opacity"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl"
                            style={{ background: "rgba(0,0,0,0.4)" }}>
                            <Maximize2 size={22} className="text-white drop-shadow" />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setViewingFile(msg.file!)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        >
                          <FileIcon size={13} style={{ color: accentHex }} />
                          <span className="text-xs truncate max-w-[140px]" style={{ color: "var(--muted)" }}>{msg.file.name}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none break-words">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {msg.sources.map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${accentHex}22`, color: accentHex, border: `1px solid ${accentHex}44` }}>
                        Page {s.page}
                      </span>
                    ))}
                  </div>
                )}

                {/* Edit button (visible) for user messages */}
                {msg.role === "user" && (
                  <button
                    onClick={() => handleEditMessage(index)}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all mt-1"
                    style={{ color: "var(--faint)", background: "rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => {
                      (e.currentTarget.style.color = "#818cf8");
                      (e.currentTarget.style.background = "rgba(99,102,241,0.1)");
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget.style.color = "var(--faint)");
                      (e.currentTarget.style.background = "rgba(255,255,255,0.03)");
                    }}
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                )}

                <span className="text-[10px] px-1" style={{ color: "var(--faint)" }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex gap-3 animate-slide-up">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${accentColor} flex items-center justify-center animate-pulse-glow`}
              style={{ boxShadow: `0 0 10px ${accentHex}66` }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3.5"
              style={{ 
                background: "rgba(10,12,24,0.5)", 
                border: `1px solid ${accentHex}30`,
                borderRadius: "12px 12px 12px 2px"
              }}>
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: accentHex, animationDelay: `${delay}ms`, boxShadow: `0 0 5px ${accentHex}` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-5 py-4 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* File preview pill above input */}
        {selectedFile && (
          <div className="absolute -top-14 left-4 animate-slide-up flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
            style={{ background: "rgba(15,17,30,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {selectedFile.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview"
                className="h-8 w-8 object-cover rounded-lg" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: `${accentHex}22` }}>
                <FileIcon size={14} style={{ color: accentHex }} />
              </div>
            )}
            <div className="flex flex-col pr-1">
              <span className="text-xs font-medium truncate max-w-[110px]" style={{ color: "var(--fg)" }}>{selectedFile.name}</span>
              <span className="text-[10px]" style={{ color: "var(--faint)" }}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]"
              style={{ background: "#ef4444" }}
            >
              <X size={9} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-xl px-4 py-3 transition-all group focus-within:shadow-[0_0_15px_rgba(34,211,238,0.08)]"
          style={{ 
            background: "rgba(10,12,24,0.8)", 
            border: `1px solid rgba(255,255,255,0.05)`, 
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" 
          }}
          onFocus={(e) => (e.currentTarget.style.border = `1px solid ${accentHex}40`)}
          onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.05)")}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent text-sm resize-none outline-none max-h-40 leading-relaxed py-1"
            style={{ color: "var(--fg)" }}
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
            <div className="flex items-center gap-1">
              {allowFileUpload && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange}
                    className="hidden" accept="image/*,application/pdf" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                    style={{ color: "var(--muted)" }}
                    title="Attach file"
                    onMouseEnter={e => {
                      (e.currentTarget.style.color = accentHex);
                      (e.currentTarget.style.background = `${accentHex}15`);
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget.style.color = "var(--muted)");
                      (e.currentTarget.style.background = "transparent");
                    }}
                  >
                    <Paperclip size={15} />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200"
              style={{
                background: (!input.trim() && !selectedFile) || isLoading
                  ? "rgba(255,255,255,0.05)"
                  : `linear-gradient(135deg, ${accentHex}, ${accentHex}99)`,
                opacity: (!input.trim() && !selectedFile) || isLoading ? 0.5 : 1,
                cursor: (!input.trim() && !selectedFile) || isLoading ? "not-allowed" : "pointer",
                boxShadow: (!input.trim() && !selectedFile) || isLoading ? "none" : `0 0 10px ${accentHex}66`
              }}
            >
              {isLoading
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Send size={14} className="text-white" />}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center mt-2" style={{ color: "var(--faint)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* Lightbox */}
      {viewingFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }}
          onClick={() => setViewingFile(null)}>
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}>
            {/* Actions */}
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a href={URL.createObjectURL(viewingFile)} download={viewingFile.name}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                title="Download">
                <Download size={16} />
              </a>
              <button onClick={() => setViewingFile(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                title="Close">
                <X size={16} />
              </button>
            </div>

            {viewingFile.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(viewingFile)} alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            ) : (
              <div className="w-full h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
                style={{ background: "white" }}>
                <div className="flex items-center justify-between px-4 py-2 text-sm"
                  style={{ background: "#f1f5f9", color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
                  <span className="font-medium truncate">{viewingFile.name}</span>
                  <a href={URL.createObjectURL(viewingFile)} target="_blank" rel="noreferrer"
                    className="text-indigo-600 hover:underline text-xs ml-4 flex-shrink-0">Open in new tab</a>
                </div>
                <iframe src={URL.createObjectURL(viewingFile)} className="w-full flex-1" title="PDF Preview" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
