"use client";

import Link from "next/link";
import {
  Stethoscope,
  Upload,
  Map,
  HelpCircle,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const steps = [
    {
      num: "01",
      title: "Material Upload",
      desc: "Upload your syllabus, notes, or past papers (PDF/text). Structure-aware chunking indexes chapters, sections, and pages.",
      icon: Upload,
      color: "from-blue-500 to-indigo-600",
    },
    {
      num: "02",
      title: "Topic Map",
      desc: "Deconstructs the curriculum into a hierarchical tree with past-paper exam frequency and weightage ratings.",
      icon: Map,
      color: "from-indigo-500 to-purple-600",
    },
    {
      num: "03",
      title: "Diagnostic Quiz",
      desc: "Generates questions strictly verified from your uploaded text — never from hallucinated model memory.",
      icon: HelpCircle,
      color: "from-purple-500 to-pink-600",
    },
    {
      num: "04",
      title: "Answer Evaluation",
      desc: "Grades answers against source ground truth, identifying specific misconceptions and citing exact pages.",
      icon: ShieldCheck,
      color: "from-pink-500 to-rose-600",
    },
    {
      num: "05",
      title: "Hero Gap Report",
      desc: "Transparently classifies every topic as Weak (<50%), Medium (50-74%), or Strong (≥75%) with real diagnostic reasons.",
      icon: FileText,
      color: "from-rose-500 to-amber-600",
    },
    {
      num: "06",
      title: "Adaptive Revision Plan",
      desc: "Allocates your available days and daily hours. Priority updates automatically when you re-test.",
      icon: Calendar,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">GapFinder AI</span>
              <span className="text-[10px] block text-slate-500 font-medium">Doctor for Studying</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          AI Ready School — Philosophy: "Human First. AI Next."
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
          Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">Doctor for Studying</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The app doesn't wait for your questions. Upload your syllabus, notes, and past papers. GapFinder tests you, diagnoses your weak topics, and prescribes a prioritized revision plan that automatically heals your learning gaps.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login?role=student"
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:translate-y-[-1px] transition-all"
          >
            Try Student Demo (Alex Rivera)
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login?role=teacher"
            className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:translate-y-[-1px] transition-all"
          >
            Try Teacher View (Dr. Evelyn Vance)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <BrainCircuit className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-slate-500">Strict Grounding</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Zero Hallucinations</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FileText className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">The Hero Feature</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Diagnostic Gap Report</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-xs text-slate-500">Self-Updating</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Revision Plan</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
            <p className="text-xs text-slate-500">Hybrid Search</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">BM25 + RRF Retrieval</p>
          </div>
        </div>
      </section>

      {/* 6-Step Core Loop */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">The Core Loop</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">From Upload to Mastery in 6 Steps</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Continuous diagnostic feedback that closes knowledge gaps through evidence-based revision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-800">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Feature Spotlight: The Gap Report */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-indigo-900/50">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              The Hero Output
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4">
              Not another chatbot. A clinical diagnosis for your learning.
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Standard AI chatbots wait passively for questions you already know to ask. GapFinder AI tests you across high-frequency exam topics, isolates specific conceptual misconceptions, and outputs an actionable Gap Report with transparent traffic-light classifications:
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-red-200">🔴 Weak Gap (&lt;50%): Urgent remediation required with concept reading.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                <span className="text-sm font-semibold text-amber-200">🟡 Moderate Gap (50–74%): Practice with past papers and application questions.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-200">🟢 Mastered (≥75%): High retention; maintain with brief spaced recap.</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                Explore Live Demo Environment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-xs text-slate-500 text-center">
        <p>© 2026 GapFinder AI. Developed for AI Ready School — "Human First. AI Next."</p>
        <p className="mt-1">Powered by Next.js 14, Vercel AI SDK, Groq Llama-3.3, and Drizzle Serverless Postgres.</p>
      </footer>
    </div>
  );
}
