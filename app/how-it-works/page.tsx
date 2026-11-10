"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ShieldCheck,
  BrainCircuit,
  Binary,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
  Workflow,
  Cpu,
  RefreshCw,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <AppShell>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            AI Architecture & Grounding Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Strict Separation: Retrieval vs. Generation
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike conversational chatbots that fabricate plausible answers from probabilistic memory, GapFinder AI uses a decoupled retrieval-grounded pipeline with deterministic evaluation.
          </p>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold">End-to-End Grounded Data Flow</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Vercel AI SDK + Groq + Drizzle</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Pure Code Retrieval */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-blue-500/40 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">
                1. Retrieval Layer (Pure Code)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero LLM creativity. Deterministic tokenization, stopword removal, Okapi BM25 scoring, and Reciprocal Rank Fusion (RRF).
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
                <li>• Structure-aware chunking (Ch/Sec/p)</li>
                <li>• Top-k ranked chunk candidates</li>
                <li>• Exact chunkId citation mapping</li>
              </ul>
            </div>

            {/* Box 2: Verification Gate */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-teal-500/40 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">
                2. Grounding Boundary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passages are strictly formatted into prompts with constraint directives: "Use only context below; if insufficient, state so."
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
                <li>• Zod schema validation contracts</li>
                <li>• Verified source chunkId verification</li>
                <li>• Outside memory access rejected</li>
              </ul>
            </div>

            {/* Box 3: LLM Generation */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-purple-500/40 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                3. Constrained Generation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Groq Llama-3.3-70b/8b generates structured JSON matching Zod schemas for question writing, short-answer comparison, and tutoring.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
                <li>• Questions linked to sourceChunkId</li>
                <li>• Misconceptions isolated</li>
                <li>• Inline citations [1][2] attached</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Deterministic Diagnosis Engine */}
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-indigo-200">
                Deterministic Gap & Plan Algorithm:
              </span>
              <span className="text-slate-300">
                Scores, thresholds (50% / 75%), readiness weights, and plan timelines are computed in pure TypeScript.
              </span>
            </div>
            <span className="font-mono text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded">
              Zero invented numbers
            </span>
          </div>
        </div>

        {/* Detailed Architecture Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-blue-600" />
              Hybrid Retrieval & Okapi BM25
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every document uploaded is parsed with heading detection regexes (<span className="font-mono">Chapter \d+</span>, <span className="font-mono">Section \d+</span>, markdown <span className="font-mono">#</span>). Chunks preserve human-readable citations (<span className="font-mono">"Notes.pdf, Chapter 3, Section 2, p.14"</span>). Our BM25 index implements the Robertson-Spärck Jones IDF formula with document length normalization parameters k1=1.5 and b=0.75.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600" />
              Evaluation & Misconception Diagnostics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When a student submits a quiz, multiple-choice options are graded deterministically against the verified correct option. Short answers are evaluated by the LLM comparing the student's explanation against the source passage text to isolate specific conceptual misconceptions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Serverless Postgres & Persistence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All documents, topic maps, quizzes, diagnostic attempts, gap reports, revision plans, and chat transcripts are stored in serverless Postgres via Drizzle ORM. With zero local file or SQLite reliance, GapFinder operates smoothly in production on Vercel's ephemeral serverless architecture.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              Adaptive Plan Recalculation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The revision schedule is computed proportionally: <span className="font-mono">Priority = Weakness × Exam Importance × (1 - Recent Improvement)</span>. When a student re-tests, the plan re-allocates study minutes day-by-day and alerts them to priority shifts ("Photosynthesis moved down from Priority 1 to Priority 3!").
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
          >
            Go to Your Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
