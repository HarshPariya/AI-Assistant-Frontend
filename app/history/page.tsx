"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { History, MessageSquare, Trash2, Calendar, Loader2, ChevronRight } from "lucide-react";
import { getUserHistory, deleteConversation } from "@/lib/api";
import Link from "next/link";
import { MODULE_ROUTES } from "@/lib/moduleState";

interface ConversationSummary {
  id: string;
  module: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      loadHistory();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getUserHistory(session!.user!.email!);
      setSummaries(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this conversation?")) return;

    try {
      setDeletingId(id);
      await deleteConversation(id, session!.user!.email!);
      setSummaries((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getModuleRoute = (module: string, id: string) => {
    const base = MODULE_ROUTES[module] || "/general";
    return `${base}?resume=${id}`;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full relative">
      <div
        className="px-4 md:px-6 py-4 pl-16 md:pl-6 flex items-center justify-between sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,8,16,0.8)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
            <History size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight">Chat History</h1>
            <p className="text-xs text-cyan-400/60">Tap a conversation to resume</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {status === "loading" || loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-cyan-400/50">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-sm">Loading history...</p>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <History size={32} className="text-white/20" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
              <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
                Sign in with Google to view and save your conversation history across all modules.
              </p>
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <MessageSquare size={32} className="text-white/20" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No history yet</h2>
              <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
                Your conversations are saved automatically when you are signed in.
              </p>
              <Link
                href="/general"
                className="inline-block px-6 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all font-medium text-sm"
              >
                Start a Chat
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {summaries.map((summary) => (
                <Link
                  key={summary.id}
                  href={getModuleRoute(summary.module, summary.id)}
                  className="group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: "rgba(10,12,24,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {summary.module}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Calendar size={12} />
                        {formatDate(summary.updated_at)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <MessageSquare size={12} />
                        {summary.message_count} msgs
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base text-white font-medium truncate pr-4">{summary.title}</h3>
                  </div>

                  <button
                    onClick={(e) => handleDelete(summary.id, e)}
                    disabled={deletingId === summary.id}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                  >
                    {deletingId === summary.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>

                  <ChevronRight size={16} className="text-white/30 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
