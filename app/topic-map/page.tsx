"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  Map,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  BarChart3,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";

export default function TopicMapPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reparsing, setReparsing] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const res = await fetch("/api/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        // Expand first 2 by default
        if (data.topics && data.topics.length > 0) {
          setExpandedTopics(new Set(data.topics.slice(0, 3).map((t: any) => t.id)));
        }
      }
    } catch {
      toast.error("Failed to load topic map");
    } finally {
      setLoading(false);
    }
  }

  function toggleTopic(id: string) {
    const next = new Set(expandedTopics);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTopics(next);
  }

  async function handleReparse() {
    setReparsing(true);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reparse" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Reparsed ${data.count} topics from your syllabus!`);
        fetchTopics();
      } else {
        toast.error(data.error || "Failed to reparse syllabus");
      }
    } catch {
      toast.error("Network error while reparsing syllabus");
    } finally {
      setReparsing(false);
    }
  }

  // Chart data: Exam Frequency and Importance
  const chartData = topics.map((t) => ({
    name: t.title.length > 18 ? t.title.slice(0, 18) + "..." : t.title,
    fullTitle: t.title,
    importance: t.examImportance || 5,
    frequency: t.examFrequency || 1,
    chunks: t.chunksCount || 1,
  }));

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Curriculum Topic Map
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Deconstructed syllabus hierarchy mapped with exam frequencies, weightages, and source chunks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReparse}
              disabled={reparsing}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {reparsing ? "Reparsing..." : "Re-parse Syllabus"}
            </button>
            <Link
              href="/quiz"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Diagnostic Test on Topics
            </Link>
          </div>
        </div>

        {/* Exam Frequency & Weightage Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Exam Frequency & Importance Weightage</h2>
              <p className="text-xs text-slate-500">Historical past paper appearances (frequency) vs syllabus weightage (1-10)</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      val,
                      name === "importance" ? "Exam Weightage (1-10)" : "Past Paper Occurrences",
                    ]}
                    contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: 8 }}
                  />
                  <Bar dataKey="importance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="importance" />
                  <Bar dataKey="frequency" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">
              Upload a syllabus or click "Load Sample" to generate the topic map chart.
            </p>
          )}
        </div>

        {/* Expandable Topic Tree (Table of Contents Style) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Hierarchy & Concept Nodes</h2>
            <span className="text-xs text-slate-500">{topics.length} core topics identified</span>
          </div>

          {topics.length > 0 ? (
            <div className="space-y-3">
              {topics.map((topic, index) => {
                const isExpanded = expandedTopics.has(topic.id);
                return (
                  <div
                    key={topic.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20"
                  >
                    <div
                      onClick={() => toggleTopic(topic.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{topic.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                            Weight: {topic.examImportance}/10
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                            {topic.examFrequency} Exam Qs
                          </span>
                        </div>

                        <Link
                          href={`/assistant?q=Explain%20${encodeURIComponent(topic.title)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Explain</span>
                        </Link>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 space-y-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Grounding Citation: </span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">{topic.sampleCitation}</span>
                        </div>

                        {topic.description && (
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
                            {topic.description}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            {topic.chunksCount} matching content passages indexed
                          </span>

                          <Link
                            href={`/quiz?topic=${topic.id}`}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            Diagnose this topic only
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No topic map available yet. Upload a syllabus or notes first.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
