"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function RevisionPlanPage() {
  const [planRecord, setPlanRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Configuration inputs
  const [availableDays, setAvailableDays] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    fetchPlan();
  }, []);

  async function fetchPlan() {
    try {
      const res = await fetch("/api/revision-plan");
      if (res.ok) {
        const data = await res.json();
        setPlanRecord(data.plan);
        if (data.plan) {
          setAvailableDays(data.plan.availableDays || 5);
          setHoursPerDay(data.plan.hoursPerDay || 2);
          setExamDate(data.plan.examDate || "");
        }
      }
    } catch {
      toast.error("Failed to load revision plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/revision-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableDays: Number(availableDays),
          hoursPerDay: Number(hoursPerDay),
          examDate: examDate || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlanRecord(data.plan);
        toast.success("Revision plan recalculated & rescheduled!");
      } else {
        toast.error(data.error || "Failed to update plan");
      }
    } catch {
      toast.error("Network error updating plan");
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleToggleTask(taskId: string, currentCompleted: boolean) {
    const nextCompleted = !currentCompleted;

    // Optimistic UI update
    if (planRecord?.planData?.dailySchedules) {
      const updatedSchedules = planRecord.planData.dailySchedules.map((day: any) => ({
        ...day,
        tasks: day.tasks.map((t: any) => (t.id === taskId ? { ...t, completed: nextCompleted } : t)),
      }));
      setPlanRecord({
        ...planRecord,
        planData: {
          ...planRecord.planData,
          dailySchedules: updatedSchedules,
        },
      });
    }

    try {
      const res = await fetch("/api/revision-plan/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: nextCompleted }),
      });
      if (res.ok && nextCompleted) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
    } catch {
      toast.error("Failed to save task status");
    }
  }

  const planData = planRecord?.planData;
  const schedules = planData?.dailySchedules || [];
  const planDiffs = planData?.planDiffs || [];

  // Calculate task counts
  let totalTasks = 0;
  let doneTasks = 0;
  schedules.forEach((s: any) => {
    s.tasks.forEach((t: any) => {
      totalTasks++;
      if (t.completed) doneTasks++;
    });
  });
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Prescribed Treatment
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personalized Revision Plan
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Proportionally scheduled based on diagnosed weakness, exam weightage, and recent score gains.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/quiz"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Diagnostic Test
            </Link>
          </div>
        </div>

        {/* Dynamic Update / Diff Notification Banner */}
        {planDiffs.length > 0 && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Adaptive Plan Updated Automatically:</p>
              <div className="mt-1 space-y-0.5">
                {planDiffs.map((diff: any, dIdx: number) => (
                  <p key={dIdx} className="opacity-90">
                    • {diff.changeDescription}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Study Parameters Config Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleUpdateConfig} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Available Study Days:
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={availableDays}
                onChange={(e) => setAvailableDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Study Hours Per Day:
              </label>
              <input
                type="number"
                step="0.5"
                min={0.5}
                max={12}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Exam Date (Optional):
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {savingConfig ? "Recalculating..." : "Regenerate Plan"}
            </button>
          </form>

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Prescription Adherence: {doneTasks} of {totalTasks} tasks completed ({progressPct}%)
            </span>
            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Day-by-Day Timeline */}
        <div className="space-y-6">
          {schedules.map((schedule: any) => (
            <div
              key={schedule.dayNumber}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                    D{schedule.dayNumber}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{schedule.dateStr}</h3>
                    <p className="text-xs text-slate-500">{schedule.focusSummary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{schedule.totalMinutes} study minutes allocated</span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {schedule.tasks.map((task: any) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        task.completed
                          ? "bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/40 opacity-70"
                          : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-400 shadow-sm"
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          task.completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-bold ${
                              task.completed
                                ? "line-through text-slate-500"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {task.taskType.replace("_", " ")} • {task.durationMinutes}m
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-600 dark:text-blue-400 pt-1">
                          <Tag className="w-3 h-3" />
                          <span>Source Citation: {task.citation}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
