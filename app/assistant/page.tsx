"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  MessageSquare,
  Send,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  coveredInContext?: boolean;
  retrievedChunks?: Array<{
    id: string;
    citation: string;
    chapter: string;
    section: string;
    content: string;
    score?: number;
  }>;
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your GapFinder grounded tutor. I answer questions strictly from your uploaded syllabus, textbook chapters, and past exam papers. Every explanation includes inline citations [1][2] so you can verify the source.",
      coveredInContext: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryParam) {
      setInput(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggleContext(msgId: string) {
    const next = new Set(expandedContexts);
    if (next.has(msgId)) next.delete(msgId);
    else next.add(msgId);
    setExpandedContexts(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to retrieve explanation");
        return;
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        coveredInContext: data.coveredInContext,
        retrievedChunks: data.retrievedChunks || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      toast.error("Network error during query");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Explain-This-Topic Assistant</h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                100% Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Answers strictly from your uploaded material with inline citations. Outside queries are politely rejected.
            </p>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isContextExpanded = expandedContexts.has(msg.id);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none text-slate-800 dark:text-slate-200 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations list for assistant replies */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Sources:</span>
                      {msg.citations.map((cite, cIdx) => (
                        <div key={cIdx} className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                          {cite}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grounding Transparency: Expandable Retrieved Context for judges */}
                {!isUser && msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                  <div className="mt-1.5 max-w-[85%] w-full">
                    <button
                      onClick={() => toggleContext(msg.id)}
                      className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {isContextExpanded
                        ? "Hide retrieved grounding context"
                        : `View ${msg.retrievedChunks.length} retrieved passage(s) used for grounding`}
                      {isContextExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isContextExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block">
                          Grounding Evidence (Passages Passed to Model):
                        </span>
                        {msg.retrievedChunks.map((chunk, chIdx) => (
                          <div
                            key={chunk.id}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60"
                          >
                            <span className="font-mono text-blue-600 dark:text-blue-400 text-[10px] block font-bold mb-1">
                              [{chIdx + 1}] {chunk.citation}
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal line-clamp-4">
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 w-fit">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching semantic chunks & formulating grounded answer...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleSubmit} className="shrink-0 flex items-center gap-2 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your syllabus or notes..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="text-center py-12 text-slate-400">Loading assistant...</div>
        </AppShell>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
