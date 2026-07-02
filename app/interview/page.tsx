"use client";

import { Suspense } from "react";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, ChevronDown, Play, RotateCcw, Star, CheckCircle, MessageSquare, Lightbulb } from "lucide-react";
import { getRoles, generateQuestions, evaluateMockAnswer, saveConversation, getConversation } from "@/lib/api";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { useSession } from "next-auth/react";
import { useModulePersistence } from "@/hooks/useModulePersistence";
import { clearModuleState } from "@/lib/moduleState";

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  expected_time: string;
  hint: string;
  model_answer?: string;
}

function InterviewContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const historySessionId = useRef<string | undefined>(undefined);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("AI/ML Engineer");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  // Mock interview state
  const [mockMode, setMockMode] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mockLoading, setMockLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  useModulePersistence({
    module: "interview",
    state: { mockMode, selectedRole, experienceLevel, questions, messages: messages.map(({ id, role, content }) => ({ id, role, content })), currentQIdx, historySessionId: historySessionId.current },
    enabled: mockMode || questions.length > 0,
    onRestore: (saved) => {
      // If local storage has a broken state where a question generation was cached as a mock interview
      if (saved.mockMode && saved.messages?.some((m: any) => m.id === "gen-req")) {
        clearModuleState("interview");
        setMockMode(false);
        setMessages([]);
        setQuestions([]);
        return;
      }

      if (saved.selectedRole) setSelectedRole(saved.selectedRole);
      if (saved.experienceLevel) setExperienceLevel(saved.experienceLevel);
      if (saved.questions?.length) setQuestions(saved.questions);
      if (saved.mockMode) setMockMode(saved.mockMode);
      if (saved.currentQIdx !== undefined) setCurrentQIdx(saved.currentQIdx);
      if (saved.messages?.length) {
        setMessages(saved.messages.map((m: any) => ({ ...m, role: m.role as "user" | "assistant", timestamp: new Date() })));
      }
      if (saved.historySessionId) historySessionId.current = saved.historySessionId;
    },
    onMongoRestore: (data) => {
      historySessionId.current = data.id;
      
      // Handle restoring question generation
      if (data.title && data.title.startsWith("Interview Questions:")) {
        const assistantMsg = data.messages?.find((m: any) => m.role === "assistant");
        if (assistantMsg) {
          try {
            const parsedQuestions = JSON.parse(assistantMsg.content);
            setQuestions(parsedQuestions);
            setMockMode(false);
            return;
          } catch (e) {
            // Fallback if not JSON
          }
        }
      }

      if (data.messages?.length) {
        setMessages(data.messages.map((m: any) => ({
          id: m.id || `${m.role}-${Math.random()}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(),
        })));
        setMockMode(true);
      }
    },
  });

  useEffect(() => {
    const resumeId = searchParams.get("resume");
    if (!resumeId) return;
    getConversation(resumeId).then((res) => {
      historySessionId.current = res.data.id;

      // Handle restoring question generation
      if (res.data.title && res.data.title.startsWith("Interview Questions:")) {
        const assistantMsg = res.data.messages?.find((m: any) => m.role === "assistant");
        if (assistantMsg) {
          try {
            const parsedQuestions = JSON.parse(assistantMsg.content);
            setQuestions(parsedQuestions);
            setMockMode(false);
            return;
          } catch (e) {
            // Fallback if not JSON
          }
        }
      }

      setMockMode(true);
      setMessages(res.data.messages.map((m: { id?: string; role: string; content: string }) => ({
        id: m.id || `${m.role}-${Math.random()}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(),
      })));
    }).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    getRoles()
      .then((r) => setRoles(r.data.roles))
      .catch(() => {});
  }, []);

  const generateQs = async () => {
    setIsLoading(true);
    setError("");
    setQuestions([]);
    setExpandedAnswers({});
    setMockMode(false);
    try {
      const res = await generateQuestions({
        role: selectedRole,
        experience_level: experienceLevel,
        num_questions: 10,
      });
      setQuestions(res.data.questions);

      if (session?.user?.email) {
        try {
          const saveRes = await saveConversation({
            user_id: session.user.email,
            module: "interview",
            title: `Interview Questions: ${selectedRole}`,
            messages: [
              { role: "user", content: `Generate ${res.data.total} questions for ${selectedRole} (${experienceLevel})`, id: "gen-req" },
              { role: "assistant", content: JSON.stringify(res.data.questions), id: "gen-res" },
            ],
            session_id: historySessionId.current,
          });
          if (saveRes.data?.id) historySessionId.current = saveRes.data.id;
        } catch (e) {
          console.warn("History save failed:", e);
        }
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to generate questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const startMock = () => {
    if (!questions.length) return;
    setMockMode(true);
    setCurrentQIdx(0);
    setConversationHistory([]);
    historySessionId.current = undefined;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome to your mock interview for **${selectedRole}**! 🎯\n\nI'll ask you 10 questions and evaluate each answer. Let's begin!\n\n**Question 1/${questions.length}:**\n\n${questions[0].question}\n\n*Category: ${questions[0].category} | Difficulty: ${questions[0].difficulty}*`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleMockAnswer = async (userAnswer: string) => {
    const currentQ = questions[currentQIdx];
    if (!currentQ) return;

    const userMessage = { id: `user-${currentQIdx}`, role: "user" as const, content: userAnswer, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    setMockLoading(true);
    try {
      const res = await evaluateMockAnswer({
        role: selectedRole,
        question: currentQ.question,
        user_answer: userAnswer,
        conversation_history: conversationHistory,
      });

      const { evaluation, score, follow_up_question, tips, model_answer_hint } = res.data;
      const nextIdx = currentQIdx + 1;
      const isLast = nextIdx >= questions.length;

      let responseContent = `**Evaluation** (Score: ${score}/100)\n\n${evaluation}\n\n`;

      if (tips?.length) {
        responseContent += `**💡 Tips:**\n${tips.map((t: string) => `• ${t}`).join("\n")}\n\n`;
      }

      if (model_answer_hint) {
        responseContent += `**📝 Strong Answer Includes:**\n${model_answer_hint}\n\n`;
      }

      if (!isLast) {
        responseContent += `---\n\n**Question ${nextIdx + 1}/${questions.length}:**\n\n${questions[nextIdx].question}\n\n*Category: ${questions[nextIdx].category} | Difficulty: ${questions[nextIdx].difficulty}*`;
        setCurrentQIdx(nextIdx);
      } else {
        responseContent += "---\n\n🎉 **Mock interview complete!** Great job! Feel free to restart with a new set of questions.";
      }

      const assistantMsg = { id: `ai-${currentQIdx}`, role: "assistant" as const, content: responseContent, timestamp: new Date() };
      
      const allMsgs = [...messages, userMessage, assistantMsg];

      setConversationHistory((prev) => [...prev, { question: currentQ.question, answer: userAnswer }]);
      setMessages(() => allMsgs);

      if (session?.user?.email) {
        try {
          const saveRes = await saveConversation({
            user_id: session.user.email,
            module: "interview",
            title: `Mock Interview: ${selectedRole}`,
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
        { id: `err-${currentQIdx}`, role: "assistant", content: "Failed to evaluate answer. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setMockLoading(false);
    }
  };

  const difficultyColor = (d: string) =>
    d === "Easy" ? "text-green-400 bg-green-500/10 border-green-500/20" :
    d === "Medium" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
    "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="min-h-screen p-5 md:p-8 pt-4">
      {/* Header */}
      <div className="mb-7 animate-fade-in flex items-center gap-3 pl-16 md:pl-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)" }}>
          <Mic size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Interview Assistant</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>AI-powered mock interviews with real-time feedback</p>
        </div>
      </div>

      {!mockMode && (
        <div className="glass-card p-5 mb-7 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Role select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 block" style={{ color: "var(--faint)" }}>Job Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2.5 pr-8 outline-none appearance-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--fg)" }}
                >
                  {roles.map((r) => <option key={r} style={{ background: "#0b0d18" }}>{r}</option>)}
                  {!roles.length && <option>AI/ML Engineer</option>}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-3.5 pointer-events-none" style={{ color: "var(--faint)" }} />
              </div>
            </div>

            {/* Experience level */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 block" style={{ color: "var(--faint)" }}>Experience Level</label>
              <div className="flex gap-2">
                {["junior", "mid", "senior"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExperienceLevel(lvl)}
                    className="flex-1 text-xs px-3 py-2.5 rounded-xl border capitalize font-medium transition-all"
                    style={experienceLevel === lvl ? {
                      background: "rgba(52,211,153,0.15)",
                      borderColor: "rgba(52,211,153,0.4)",
                      color: "#6ee7b7",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "var(--muted)",
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex items-end">
              <button
                onClick={generateQs}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)", boxShadow: "0 4px 20px -6px rgba(52,211,153,0.4)" }}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Play size={14} /> Generate Questions</>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
        </div>
      )}

      {/* Questions list or Mock interface */}
      {mockMode ? (
        <div className="glass-card h-[600px] flex flex-col animate-scale-in overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399" }} />
              <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>Mock Interview — {selectedRole}</span>
            </div>
            <button onClick={() => { setMockMode(false); clearModuleState("interview"); }}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: "var(--faint)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--muted)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleMockAnswer}
              isLoading={mockLoading}
              placeholder="Type your response or ask for a hint..."
              accentColor="from-emerald-500 to-cyan-500"
              accentHex="#34d399"
              setMessages={setMessages}
            />
          </div>
        </div>
      ) : questions.length > 0 ? (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{questions.length} Questions Generated for {selectedRole}</h2>
            <button
              onClick={startMock}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <MessageSquare size={14} /> Start Mock Interview
            </button>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 w-full">
                    <p className="text-sm text-white mb-2 leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">{q.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-gray-600">⏱ {q.expected_time}</span>
                    </div>
                    
                    <button 
                      onClick={() => setExpandedAnswers(prev => ({...prev, [q.id]: !prev[q.id]}))}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      {expandedAnswers[q.id] ? "Hide Answer" : "Show Answer"}
                    </button>
                    
                    {expandedAnswers[q.id] && q.model_answer && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-white/5 animate-fade-in text-sm text-gray-300 whitespace-pre-wrap">
                        <strong className="text-white block mb-1 text-xs uppercase tracking-wider">Model Answer:</strong>
                        {q.model_answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center animate-fade-in">
          <Mic size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Select a role and generate interview questions to get started</p>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[var(--muted)]">Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
