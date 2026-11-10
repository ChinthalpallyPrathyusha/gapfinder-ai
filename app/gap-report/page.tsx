"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart2,
  Calendar,
  MessageSquare,
  ArrowUpDown,
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

export default function GapReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"priority" | "score" | "name" | "questions">("priority");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchGapReport();
  }, []);

  async function fetchGapReport() {
    try {
      const res = await fetch("/api/gap-report");
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch {
      toast.error("Failed to load gap report");
    } finally {
      setLoading(false);
    }
  }

  // Sorting
  const summaries = report?.topicSummaries ? [...report.topicSummaries] : [];
  summaries.sort((a: any, b: any) => {
    let diff = 0;
    if (sortBy === "priority") diff = b.priorityScore - a.priorityScore;
    else if (sortBy === "score") diff = b.percentageScore - a.percentageScore;
    else if (sortBy === "questions") diff = b.totalQuestions - a.totalQuestions;
    else if (sortBy === "name") diff = a.topicTitle.localeCompare(b.topicTitle);
    return sortAsc ? -diff : diff;
  });

  const chartData = summaries.map((t: any) => ({
    name: t.topicTitle.length > 16 ? t.topicTitle.slice(0, 16) + "..." : t.topicTitle,
    fullTitle: t.topicTitle,
    score: t.status === "no_data" ? 0 : t.percentageScore,
    status: t.status,
  }));

  function getBarColor(status: string) {
    if (status === "weak") return "#ef4444";
    if (status === "medium") return "#f59e0b";
    if (status === "strong") return "#10b981";
    return "#9ca3af";
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              The Hero Output
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Clinical Gap Diagnosis
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Transparent, data-backed topic classifications grounded in your quiz attempt history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/revision-plan"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              Prescribe Revision Plan
            </Link>
          </div>
        </div>

        {/* Readiness Hero & Criteria Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl border border-indigo-900/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Overall Readiness</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black">{report?.readinessScore ?? 0}%</span>
                <span className="text-xs text-blue-300">Exam Preparedness</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Weighted across high-yield past paper topics and diagnostic accuracy.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between text-xs text-slate-300">
              <span>{report?.topicSummaries?.length || 0} Topics Analyzed</span>
              <span>Updated automatically</span>
            </div>
          </div>

          {/* Transparent Threshold Rules */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                Diagnostic Criteria & Classification Thresholds
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                GapFinder AI uses deterministic grading combined with evidence-based thresholds. No scores or reasons are hallucinated.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
                  <span className="font-bold text-red-700 dark:text-red-400">🔴 Weak Gap</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">&lt; 50% accuracy</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
                  <span className="font-bold text-amber-700 dark:text-amber-400">🟡 Moderate Gap</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">50% – 74.9% accuracy</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">🟢 Mastered</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">≥ 75% accuracy</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/40">
                  <span className="font-bold text-gray-700 dark:text-gray-400">⚪ Needs Data</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">&lt; 2 questions taken</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Formula: <span className="font-mono">Priority = Weakness × Exam Importance × (1 + 0.05 × Past Paper Frequency)</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Topic Diagnostic Health Chart</h2>
              <p className="text-xs text-slate-500">Color-coded by diagnostic threshold status</p>
            </div>
            <BarChart2 className="w-5 h-5 text-blue-600" />
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string, item: any) => [
                      `${val}% (${item.payload.status})`,
                      "Diagnostic Mastery",
                    ]}
                    contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: 8 }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">No diagnostic data yet.</p>
          )}
        </div>

        {/* Sortable Topics Breakdown Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Clinical Topic Breakdown & Reasons</h2>
              <p className="text-xs text-slate-500">Detailed diagnostic explanations computed from real answers</p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort:</span>
              <button
                onClick={() => {
                  if (sortBy === "priority") setSortAsc(!sortAsc);
                  else { setSortBy("priority"); setSortAsc(false); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                  sortBy === "priority" ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                Priority <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (sortBy === "score") setSortAsc(!sortAsc);
                  else { setSortBy("score"); setSortAsc(false); }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                  sortBy === "score" ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                Score <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Exam Weight</th>
                  <th className="py-3 px-4">Clinical Diagnosis & Misconceptions</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaries.length > 0 ? (
                  summaries.map((t: any) => (
                    <tr key={t.topicId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {t.topicTitle}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          t.status === "weak"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : t.status === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : t.status === "strong"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {t.status === "weak" ? "🔴 Weak" : t.status === "medium" ? "🟡 Moderate" : t.status === "strong" ? "🟢 Mastered" : "⚪ Needs Data"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.status === "no_data" ? "—" : `${t.percentageScore}%`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {t.correctQuestions} / {t.totalQuestions} correct
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        <div>Importance: {t.examImportance}/10</div>
                        <div className="text-[10px] text-slate-400">{t.examFrequency} past exam Qs</div>
                      </td>
                      <td className="py-4 px-4 max-w-md text-slate-700 dark:text-slate-300 leading-relaxed">
                        <p>{t.humanReason}</p>
                        {t.commonMisconceptions && t.commonMisconceptions.length > 0 && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
                            Flagged Flaw: {t.commonMisconceptions[0]}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/assistant?q=Explain%20misconceptions%20in%20${encodeURIComponent(t.topicTitle)}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600"
                            title="Ask Assistant to explain"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href="/revision-plan"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold text-[11px]"
                          >
                            Revise
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No topics analyzed yet. Take a diagnostic test to generate your diagnosis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
