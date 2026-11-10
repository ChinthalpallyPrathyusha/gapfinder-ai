"use client";

import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  FileUp,
  Tag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function MaterialsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [recentChunks, setRecentChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<"syllabus" | "notes" | "past_paper">("notes");
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setRecentChunks(data.recentChunks || []);
      }
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    try {
      const res = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.isScanned) {
          toast.error(data.error, { duration: 6000 });
        } else {
          toast.error(data.error || "Upload failed");
        }
        return;
      }

      toast.success(
        `Successfully indexed "${file.name}" into ${data.document?.chunksCount || 1} semantic chunks!`
      );
      if (data.generatedTopicsCount > 0) {
        toast.info(`Generated ${data.generatedTopicsCount} topics from your syllabus!`);
      }
      fetchMaterials();
    } catch {
      toast.error("Network error during file upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setUploading(true);
    try {
      const res = await fetch("/api/materials/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pastedTitle || `${docType.toUpperCase()} Notes`,
          docType,
          text: pastedText,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to process text");
        return;
      }

      toast.success(`Indexed into ${data.document?.chunksCount || 1} semantic chunks!`);
      setPastedTitle("");
      setPastedText("");
      setPasteMode(false);
      fetchMaterials();
    } catch {
      toast.error("Failed to upload pasted text");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document and its indexed chunks?")) return;
    try {
      const res = await fetch(`/api/materials?id=${docId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document removed");
        fetchMaterials();
      }
    } catch {
      toast.error("Failed to delete document");
    }
  }

  async function handleClearAll() {
    if (!confirm("Are you sure you want to clear all uploaded materials and previous topics to start fresh?")) return;
    try {
      const res = await fetch("/api/materials?all=true", { method: "DELETE" });
      if (res.ok) {
        toast.success("All materials and syllabus topics cleared!");
        fetchMaterials();
      }
    } catch {
      toast.error("Failed to clear materials");
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Material & Document Index
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upload your syllabus, textbook chapters, notes, and past papers. GapFinder chunks them with structural chapter/section citations.
          </p>
        </div>

        {/* Upload Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Document Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-500 mr-1">Document Type:</span>
              {(["syllabus", "notes", "past_paper"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    docType === type
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPasteMode(!pasteMode)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <FileUp className="w-3.5 h-3.5" />
              {pasteMode ? "Switch to File Upload" : "Or Paste Raw Text"}
            </button>
          </div>

          {!pasteMode ? (
            /* Drag and Drop Box */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {uploading ? "Extracting & Chunking Document..." : "Click or Drag & Drop to Upload"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, TXT, and Markdown (.pdf, .txt, .md). Digital PDFs only.
              </p>
            </div>
          ) : (
            /* Paste Text Form */
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Genetics Notes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Content (Paste Syllabus, Chapter Text, or Past Exam Questions)
                </label>
                <textarea
                  rows={8}
                  required
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your chapter notes, headings, and definitions here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={uploading || !pastedText.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {uploading ? "Indexing..." : "Index Content"}
              </button>
            </form>
          )}
        </div>

        {/* Uploaded Documents List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Uploaded Materials</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{documents.length} documents indexed</span>
              {documents.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors"
                >
                  Clear All & Start Fresh
                </button>
              )}
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {doc.docType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No materials uploaded yet. Upload a syllabus or notes above, or click "Load Sample" in the top bar.
            </p>
          )}
        </div>

        {/* Structure-Aware Chunks Explorer */}
        {recentChunks.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Indexed Semantic Chunks & Citation Labels
                </h2>
                <p className="text-xs text-slate-500">
                  Structure-aware chunking tracks chapter headings and generates verifiable citations.
                </p>
              </div>
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{chunk.citation}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {chunk.preview}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{chunk.chapter}</span>
                    <span>~{chunk.tokenCount} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
