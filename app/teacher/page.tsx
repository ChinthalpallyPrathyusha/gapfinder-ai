"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Users,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  Sparkles,
  HelpCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function TeacherPage() {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  async function fetchTeacherData() {
    try {
      const res = await fetch("/api/teacher");
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
      }
    } catch {
      toast.error("Failed to load class analytics");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColorClass(score: number) {
    if (score < 50) return "bg-red-500 text-white font-bold";
    if (score < 75) return "bg-amber-400 text-amber-950 font-semibold";
    return "bg-emerald-500 text-white font-bold";
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Teacher Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Class-Level Diagnostic Analytics
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Identify syllabus-wide gaps across your class, track struggling students, and target review sessions.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Average Readiness
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                {classData?.classAverageReadiness ?? 72}%
              </span>
              <span className="text-xs text-slate-500">Across 8 Active Students</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              #1 Class Struggle Topic
            </span>
            <div className="mt-3">
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                Cellular Respiration & Energy
              </span>
              <p className="text-xs text-slate-500 mt-1">
                4 of 8 students flagged with ATP yield misconceptions
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Intervention Required
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-500">
                2 Students
              </span>
              <span className="text-xs text-slate-500">Readiness &lt; 60%</span>
            </div>
          </div>
        </div>

        {/* Topic-Wise Class Average & Struggle Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Topic Health</h2>
              <p className="text-xs text-slate-500">Class average scores and number of students needing remediation</p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {classData?.topicStats?.map((topic: any) => (
              <div
                key={topic.topicId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Wt: {topic.examImportance}/10
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    topic.averageScore >= 75
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : topic.averageScore >= 60
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}>
                    {topic.averageScore}% Avg
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {topic.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <span>Struggling:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {topic.weakStudentsCount} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak-Topic Heatmap Matrix */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Weak-Topic Heatmap Matrix</h2>
              <p className="text-xs text-slate-500">Student vs Topic Diagnostic Accuracy Matrix (🔴 &lt;50%, 🟡 50-74%, 🟢 ≥75%)</p>
            </div>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3 text-center">Readiness</th>
                  {classData?.topicStats?.map((t: any) => (
                    <th key={t.topicId} className="py-2.5 px-3 text-center max-w-[120px]">
                      <span className="line-clamp-1">{t.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classData?.heatmap?.map((row: any) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {row.overallScore}%
                    </td>
                    {row.topicScores?.map((tScore: any) => (
                      <td key={tScore.topicId} className="py-3 px-3 text-center">
                        <span
                          className={`inline-block w-12 py-1 rounded text-[11px] ${getScoreColorClass(
                            tScore.score
                          )}`}
                        >
                          {tScore.score}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Class Student Roster</h2>
            <span className="text-xs text-slate-500">8 Students Enrolled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Exam Readiness</th>
                  <th className="py-3 px-4">Quizzes Taken</th>
                  <th className="py-3 px-4">Primary Gap Detected</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classData?.students?.map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{stu.name}</td>
                    <td className="py-3 px-4 text-slate-500">{stu.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        stu.readinessScore >= 75
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : stu.readinessScore >= 60
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}>
                        {stu.readinessScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{stu.attemptsCount} attempts</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {stu.weakTopic}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-semibold ${
                        stu.readinessScore >= 75 ? "text-emerald-600" : stu.readinessScore >= 60 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {stu.readinessScore >= 75 ? "On Track" : stu.readinessScore >= 60 ? "Review Needed" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
