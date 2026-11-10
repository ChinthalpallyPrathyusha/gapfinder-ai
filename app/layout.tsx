import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GapFinder AI — The Doctor for Studying",
  description: "Diagnose weak topics from your syllabus, notes, and past papers, and receive an adaptive revision plan that updates as you improve.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
