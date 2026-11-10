"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  Activity,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Study Diagnosis & Progress
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your real-time exam readiness, diagnostic history, and gap healing metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
            >
              <HelpCircle className="w-4 h-4" />
              Take Diagnostic Test
            </Link>
          </div>
        </div>

        {/* Guided Onboarding Checklist */}
        {data && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Core Loop Checklist
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Continuous Mastery
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Link
                href="/materials"
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  data.onboarding?.hasMaterials
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">1. Upload</span>
                  <CheckCircle2 className={`w-4 h-4 ${data.onboarding?.hasMaterials ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <span className="text-[11px] opacity-80">Syllabus & Notes</span>
              </Link>

              <Link
                href="/topic-map"
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  data.onboarding?.hasTopicMap
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">2. Topic Map</span>
                  <CheckCircle2 className={`w-4 h-4 ${data.onboarding?.hasTopicMap ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <span className="text-[11px] opacity-80">Weights & Tree</span>
              </Link>

              <Link
                href="/quiz"
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  data.onboarding?.hasQuizAttempt
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">3. Take Quiz</span>
                  <CheckCircle2 className={`w-4 h-4 ${data.onboarding?.hasQuizAttempt ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <span className="text-[11px] opacity-80">Grounded Testing</span>
              </Link>

              <Link
                href="/gap-report"
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  data.onboarding?.hasGapReport
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">4. Gap Report</span>
                  <CheckCircle2 className={`w-4 h-4 ${data.onboarding?.hasGapReport ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <span className="text-[11px] opacity-80">Hero Diagnosis</span>
              </Link>

              <Link
                href="/revision-plan"
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  data.onboarding?.hasRevisionPlan
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">5. Revise</span>
                  <CheckCircle2 className={`w-4 h-4 ${data.onboarding?.hasRevisionPlan ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <span className="text-[11px] opacity-80">Prioritized Plan</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4 Hero KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Readiness */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Readiness</span>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {data?.readinessScore ?? 0}%
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Clinical Diagnosis
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, data?.readinessScore ?? 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Active Diagnostic Streak */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Streak</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {data?.streakDays ?? 1}
              </span>
              <span className="text-xs font-medium text-slate-500">Consecutive Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Active revision cadence maintained</p>
          </div>

          {/* Mastered Topics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastered Topics</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {data?.strongTopicsCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">Above 75% Score</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Moved to maintenance recap</p>
          </div>

          {/* Plan Completion */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan Completed</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                {data?.planCompletionPct ?? 0}%
              </span>
              <span className="text-xs text-slate-500">Daily Tasks Done</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Auto-updates as you re-test</p>
          </div>
        </div>

        {/* Charts & Priorities Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Improvement Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Readiness Progression</h3>
                <p className="text-xs text-slate-500">Score improvement across historical diagnostic attempts</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>

            {data?.timelineData && data.timelineData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, "Diagnostic Score"]}
                      contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#2563eb" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No attempts recorded yet</p>
                <Link href="/quiz" className="text-xs text-blue-600 hover:underline mt-1">Take your first diagnostic test</Link>
              </div>
            )}
          </div>

          {/* Top 3 Priorities Quick Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top 3 Revision Priorities</h3>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-4">
                High exam weightage topics with active diagnostic gaps:
              </p>

              <div className="space-y-3">
                {data?.topPriorities && data.topPriorities.length > 0 ? (
                  data.topPriorities.map((item: any, idx: number) => (
                    <div
                      key={item.topicId}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          #{idx + 1} {item.topicTitle}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === "weak" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {item.percentageScore}% Score
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.humanReason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Complete a diagnostic quiz to generate your top 3 priorities.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/gap-report"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                View Full Gap Report
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Attempts History Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Diagnostic Attempt History</h3>
              <p className="text-xs text-slate-500">Detailed records of quizzes taken and verified improvements</p>
            </div>
            <Link href="/quiz" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              New Test +
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Attempt</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.attempts && data.attempts.length > 0 ? (
                  data.attempts.map((att: any, i: number) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Diagnostic Run #{data.attempts.length - i}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {att.score} / {att.maxScore} pts
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          att.percentage >= 75
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : att.percentage >= 50
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {att.durationSeconds ? `${Math.round(att.durationSeconds / 60)} mins` : "Untimed"}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(att.completedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No attempts yet. Click "Take Diagnostic Test" to begin.
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
