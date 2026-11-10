import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { HybridRetriever, RetrievalChunk } from "@/lib/retrieval/hybrid";
import { explainTopicGrounded } from "@/lib/ai/groq";
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string().min(2),
  topicId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = QuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const { query, topicId } = parsed.data;

    // 1. Fetch user's chunks
    const rawChunks = await repo.getChunksByUser(session.userId);

    if (rawChunks.length === 0) {
      return NextResponse.json({
        answer: "You have not uploaded any study materials yet. Please upload your syllabus or notes in the Materials tab so I can ground answers in your actual curriculum.",
        citations: [],
        coveredInContext: false,
        retrievedChunks: [],
      });
    }

    // 2. Hybrid Retrieval
    const retriever = new HybridRetriever();
    const formattedChunks: RetrievalChunk[] = rawChunks.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      docTitle: c.citation.split(",")[0] || "Document",
      docType: c.docType,
      chapter: c.chapter,
      section: c.section,
      page: c.page,
      chunkIndex: c.chunkIndex,
      citation: c.citation,
      content: c.content,
      topicId: c.topicId || undefined,
    }));

    retriever.indexChunks(formattedChunks);

    const retrievedChunks = retriever.search(query, {
      topK: 4,
      topicIdFilter: topicId,
    });

    // 3. Grounded Generation
    const result = await explainTopicGrounded(query, retrievedChunks);

    return NextResponse.json({
      answer: result.answer,
      citations: result.citations,
      coveredInContext: result.coveredInContext,
      retrievedChunks: retrievedChunks.map((c) => ({
        id: c.id,
        citation: c.citation,
        chapter: c.chapter,
        section: c.section,
        page: c.page,
        content: c.content,
        score: c.score,
      })),
    });
  } catch (err: any) {
    console.error("Assistant error:", err);
    return NextResponse.json({ error: err.message || "Failed to process query" }, { status: 500 });
  }
}
