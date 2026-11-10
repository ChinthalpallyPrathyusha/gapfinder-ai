"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Eye,
  Sparkles,
  Layers,
  FileText,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic");

  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);

  // Active Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [viewingPassage, setViewingPassage] = useState<{ citation: string; content: string } | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    let interval: any;
    if (quiz && !isSubmitted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quiz, isSubmitted]);

  async function fetchTopics() {
    try {
      const res = await fetch("/api/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        if (initialTopic) {
          setSelectedTopics([initialTopic]);
        } else if (data.topics && data.topics.length > 0) {
          setSelectedTopics(data.topics.map((t: any) => t.id));
        }
      }
    } catch {
      toast.error("Failed to load topics");
    }
  }

  async function handleStartQuiz() {
    setGenerating(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicIds: selectedTopics,
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate quiz");
        return;
      }

      setQuiz(data.quiz);
      setCurrentIdx(0);
      setStudentAnswers({});
      setTimerSeconds(0);
      setIsSubmitted(false);
      setEvaluationResult(null);
      toast.success("Diagnostic quiz generated strictly from your uploaded chunks!");
    } catch {
      toast.error("Network error generating quiz");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitQuiz() {
    const questions = quiz.questions;
    const answersPayload = questions.map((q: any) => ({
      questionId: q.id,
      studentAnswer: studentAnswers[q.id] || "No answer provided",
    }));

    try {
      const res = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: answersPayload,
          durationSeconds: timerSeconds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to evaluate answers");
        return;
      }

      setIsSubmitted(true);
      setEvaluationResult(data);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success("Quiz evaluated! Hero Gap Report and Revision Plan updated.");
    } catch {
      toast.error("Error evaluating test");
    }
  }

  function formatTime(secs: number) {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {!quiz ? (
          /* Quiz Setup Configuration */
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Grounded Assessment
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Configure Diagnostic Quiz
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Questions are synthesized strictly from retrieved passages in your uploaded syllabus and notes.
              </p>
            </div>

            {/* Topic Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                  Select Topics for Diagnosis:
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTopics(
                      selectedTopics.length === topics.length ? [] : topics.map((t) => t.id)
                    )
                  }
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedTopics.length === topics.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {topics.map((t) => {
                    const isSelected = selectedTopics.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (isSelected) setSelectedTopics(selectedTopics.filter((id) => id !== t.id));
                          else setSelectedTopics([...selectedTopics, t.id]);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 font-semibold text-blue-900 dark:text-blue-100"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span className="line-clamp-1">{t.title}</span>
                        <span className="text-[10px] font-mono opacity-70">Wt: {t.examImportance}/10</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No topics available. Load sample or upload materials first.</p>
              )}
            </div>

            {/* Question Count & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-2">
                  Number of Questions:
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                        questionCount === num
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-2">
                  Difficulty Level:
                </label>
                <div className="flex items-center gap-2">
                  {(["easy", "medium", "hard"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border ${
                        difficulty === lvl
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={generating || selectedTopics.length === 0}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Retrieving Chunks & Synthesizing Questions..." : "Generate Diagnostic Test"}
            </button>
          </div>
        ) : (
          /* Active Test & Evaluation Screen */
          <div className="space-y-6">
            {/* Test Header with Timer & Progress */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{quiz.title}</h2>
                <span className="text-xs text-slate-500">
                  Question {currentIdx + 1} of {quiz.questions.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {formatTime(timerSeconds)}
                </div>
                {isSubmitted && (
                  <button
                    onClick={() => setQuiz(null)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Test
                  </button>
                )}
              </div>
            </div>

            {/* Question Card */}
            {!isSubmitted ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                {/* Source Citation & Passage Popover Trigger */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    Grounded in: {quiz.questions[currentIdx].sourceCitation}
                  </span>
                  <button
                    onClick={() =>
                      setViewingPassage({
                        citation: quiz.questions[currentIdx].sourceCitation,
                        content: quiz.questions[currentIdx].sourceContentSnippet || "Passage context extracted from material.",
                      })
                    }
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Source Passage
                  </button>
                </div>

                {/* Prompt */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {quiz.questions[currentIdx].prompt}
                </h3>

                {/* Question Options or Short Answer Input */}
                {quiz.questions[currentIdx].questionType === "mcq" ? (
                  <div className="space-y-3">
                    {quiz.questions[currentIdx].options.map((opt: string, oIdx: number) => {
                      const isSelected = studentAnswers[quiz.questions[currentIdx].id] === opt;
                      return (
                        <div
                          key={oIdx}
                          onClick={() =>
                            setStudentAnswers({
                              ...studentAnswers,
                              [quiz.questions[currentIdx].id]: opt,
                            })
                          }
                          className={`p-4 rounded-xl border cursor-pointer text-sm font-medium transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Your Answer (Evaluated against source text ground truth):
                    </label>
                    <textarea
                      rows={4}
                      value={studentAnswers[quiz.questions[currentIdx].id] || ""}
                      onChange={(e) =>
                        setStudentAnswers({
                          ...studentAnswers,
                          [quiz.questions[currentIdx].id]: e.target.value,
                        })
                      }
                      placeholder="Write your explanation or answer here..."
                      className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {currentIdx < quiz.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx(currentIdx + 1)}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                    >
                      Submit for Clinical Evaluation
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Post-Submission Diagnosis & Evaluation View */
              <div className="space-y-6">
                {/* Result Hero Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Evaluation Complete
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Diagnostic Score: {evaluationResult?.attempt?.score} / {evaluationResult?.attempt?.maxScore} (
                      {evaluationResult?.attempt?.percentage}%)
                    </h3>
                    <p className="text-xs text-blue-200 mt-1">
                      Attempt recorded in your learning journey. Gap Report and Revision Plan have been updated.
                    </p>
                  </div>
                  <Link
                    href="/gap-report"
                    className="px-5 py-3 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
                  >
                    View Updated Gap Report
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Per-Question Explanations & Misconceptions */}
                <div className="space-y-4">
                  {quiz.questions.map((q: any, idx: number) => {
                    const evalItem = evaluationResult?.evaluation?.[idx];
                    const isCorrect = evalItem?.isCorrect;
                    return (
                      <div
                        key={q.id}
                        className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm ${
                          isCorrect ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate-500">Question {idx + 1}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                              isCorrect
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isCorrect ? "Correct (1.0 pt)" : "Gap Detected (0.0 pt)"}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{q.prompt}</h4>

                        <div className="text-xs space-y-1 mb-3">
                          <p className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Your Answer: </span>
                            {evalItem?.studentAnswer || studentAnswers[q.id] || "No answer"}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Ground Truth: </span>
                            {q.correctAnswer}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                          <p className="text-slate-800 dark:text-slate-200 font-medium">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">Explanation: </span>
                            {evalItem?.explanation || q.explanation}
                          </p>

                          {evalItem?.misconception && (
                            <p className="text-amber-700 dark:text-amber-400 font-medium">
                              <span className="font-bold">Detected Misconception: </span>
                              {evalItem.misconception}
                            </p>
                          )}

                          <p className="text-[10px] font-mono text-slate-400 pt-1">
                            Verified Source: {q.sourceCitation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source Passage Modal / Popover */}
        {viewingPassage && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Grounding Passage Verification</span>
                </div>
                <button
                  onClick={() => setViewingPassage(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Citation:
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {viewingPassage.citation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                {viewingPassage.content}
              </div>

              <button
                onClick={() => setViewingPassage(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close Passage
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="text-center py-12 text-slate-400">Loading diagnostic test...</div>
        </AppShell>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
