import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { HybridRetriever, RetrievalChunk } from "@/lib/retrieval/hybrid";
import { generateQuizQuestionsFromChunks } from "@/lib/ai/groq";
import { z } from "zod";

const GenerateQuizSchema = z.object({
  topicIds: z.array(z.string()).optional(),
  questionCount: z.number().min(2).max(20).optional().default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = GenerateQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quiz generation parameters" }, { status: 400 });
    }

    const { topicIds, questionCount, difficulty } = parsed.data;

    // 1. Fetch user's chunks and topics
    const rawChunks = await repo.getChunksByUser(session.userId);
    const topics = await repo.getTopicsByUser(session.userId);

    if (rawChunks.length === 0) {
      return NextResponse.json(
        { error: "No study material uploaded yet. Please upload notes, syllabus, or past papers first." },
        { status: 400 }
      );
    }

    // 2. Index chunks in Hybrid Retriever
    const retriever = new HybridRetriever();
    const formattedChunks: RetrievalChunk[] = rawChunks.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      docTitle: c.citation.split(",")[0] || "Material",
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

    // 3. Retrieve relevant chunks prioritized by selected topics and exam importance
    const selectedTopics = topicIds && topicIds.length > 0
      ? topics.filter((t) => topicIds.includes(t.id))
      : topics;

    const retrievedChunks: RetrievalChunk[] = [];
    const seenChunkIds = new Set<string>();

    for (const top of selectedTopics) {
      const results = retriever.search(`${top.title} ${top.description || ""}`, {
        topK: 3,
        topicIdFilter: top.id,
      });

      for (const res of results) {
        if (!seenChunkIds.has(res.id)) {
          seenChunkIds.add(res.id);
          retrievedChunks.push(res);
        }
      }
    }

    // If targeted search returned too few, add top general chunks
    if (retrievedChunks.length < 3) {
      const generalResults = retriever.search("concepts definitions mechanisms questions", { topK: 5 });
      for (const res of generalResults) {
        if (!seenChunkIds.has(res.id)) {
          seenChunkIds.add(res.id);
          retrievedChunks.push(res);
        }
      }
    }

    // 4. GENERATION (Strictly Grounded in Retrieved Chunks)
    const generatedQuestions = await generateQuizQuestionsFromChunks(
      retrievedChunks,
      questionCount,
      difficulty
    );

    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Validate validTopicIds from existing topics
    const existingTopicIds = new Set(topics.map((t) => t.id));
    const fallbackTopicId = selectedTopics[0]?.id || topics[0]?.id || "topic_1";

    // Build question database records with chunk text for "view source passage" popover
    const questionsToSave = generatedQuestions.map((q, idx) => {
      const sourceChunk = retrievedChunks.find((c) => c.id === q.sourceChunkId) || retrievedChunks[0];

      let assignedTopicId = fallbackTopicId;
      if (q.topicId && existingTopicIds.has(q.topicId)) {
        assignedTopicId = q.topicId;
      } else if (sourceChunk?.topicId && existingTopicIds.has(sourceChunk.topicId)) {
        assignedTopicId = sourceChunk.topicId;
      }

      return {
        id: `q_${quizId}_${idx + 1}`,
        quizId,
        topicId: assignedTopicId,
        questionType: q.questionType,
        prompt: q.prompt,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        misconception: q.misconception || null,
        difficulty: q.difficulty || difficulty,
        sourceChunkId: sourceChunk?.id || null,
        sourceCitation: sourceChunk?.citation || q.sourceCitation,
        sourceContentSnippet: sourceChunk?.content || "",
      };
    });

    const quizRecord = await repo.createQuiz(
      {
        id: quizId,
        userId: session.userId,
        title: `Diagnostic Quiz: ${selectedTopics.map((t) => t.title).slice(0, 2).join(", ")}${selectedTopics.length > 2 ? ` (+${selectedTopics.length - 2} more)` : ""}`,
        topicIds: selectedTopics.map((t) => t.id),
        status: "draft",
      },
      questionsToSave
    );

    return NextResponse.json({
      success: true,
      quiz: {
        id: quizRecord.id,
        title: quizRecord.title,
        questions: questionsToSave.map((q) => ({
          id: q.id,
          topicId: q.topicId,
          questionType: q.questionType,
          prompt: q.prompt,
          options: q.options,
          difficulty: q.difficulty,
          sourceCitation: q.sourceCitation,
          sourceContentSnippet: q.sourceContentSnippet,
        })),
      },
    });
  } catch (err: any) {
    console.error("Quiz generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate diagnostic quiz" }, { status: 500 });
  }
}
