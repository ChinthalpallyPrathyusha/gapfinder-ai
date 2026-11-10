"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  BookOpen,
  Map,
  HelpCircle,
  FileText,
  Activity,
  Calendar,
  MessageSquare,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: "student" | "teacher";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingSample, setLoadingSample] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleLoadSample() {
    setLoadingSample(true);
    try {
      const res = await fetch("/api/materials/sample", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sample curriculum & 3 diagnostic attempts loaded!");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to load sample material");
      }
    } catch {
      toast.error("Network error loading sample");
    } finally {
      setLoadingSample(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">GapFinder</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Doctor for Studying</p>
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 ml-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/dashboard"
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Activity className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/materials"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/materials")
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Materials
              </Link>
              <Link
                href="/topic-map"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/topic-map"
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Map className="w-4 h-4" />
                Topic Map
              </Link>
              <Link
                href="/quiz"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/quiz")
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Quiz
              </Link>
              <Link
                href="/gap-report"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/gap-report"
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-4 h-4" />
                Gap Report
              </Link>
              <Link
                href="/revision-plan"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/revision-plan"
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Plan
              </Link>
              <Link
                href="/assistant"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/assistant"
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Ask
              </Link>
              {user.role === "teacher" && (
                <Link
                  href="/teacher"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    pathname === "/teacher"
                      ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold"
                      : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Teacher View
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/how-it-works"
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors hidden sm:block"
          >
            How it works
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                disabled={loadingSample}
                className="hidden lg:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Populate sample syllabus, notes, past papers and attempts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {loadingSample ? "Loading..." : "Load Sample"}
              </button>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200">{user.name.split(" ")[0]}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === "teacher" ? "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200" : "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all hover:shadow"
              >
                Sign In / Demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
