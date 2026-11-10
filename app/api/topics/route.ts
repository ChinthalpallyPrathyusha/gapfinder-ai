import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { generateTopicTreeFromSyllabus } from "@/lib/ai/groq";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await repo.getTopicsByUser(session.userId);
  const chunks = await repo.getChunksByUser(session.userId);

  // Calculate chunks per topic
  const topicStats = topics.map((t) => {
    const relatedChunks = chunks.filter(
      (c) =>
        c.topicId === t.id ||
        c.content.toLowerCase().includes(t.title.toLowerCase()) ||
        c.chapter.toLowerCase().includes(t.title.toLowerCase())
    );
    return {
      ...t,
      chunksCount: relatedChunks.length,
      sampleCitation: relatedChunks[0]?.citation || `Curriculum Section: ${t.title}`,
    };
  });

  return NextResponse.json({ topics: topicStats });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // If re-parsing requested
    if (body.action === "reparse") {
      const documents = await repo.getDocumentsByUser(session.userId);
      const syllabusDoc = documents.find((d) => d.docType === "syllabus");
      if (!syllabusDoc) {
        return NextResponse.json(
          { error: "No syllabus document found. Please upload a syllabus first." },
          { status: 400 }
        );
      }

      const parsed = await generateTopicTreeFromSyllabus(syllabusDoc.rawContent);
      const topicsToSave = parsed.map((t, idx) => ({
        id: `top_${Date.now()}_${idx + 1}`,
        userId: session.userId,
        title: t.title,
        description: t.description,
        parentId: null,
        orderIndex: idx + 1,
        examImportance: t.examImportance || 6,
        examFrequency: t.examFrequency || 4,
      }));

      await repo.saveTopics(topicsToSave);
      return NextResponse.json({ success: true, count: topicsToSave.length, topics: topicsToSave });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Topic route error:", err);
    return NextResponse.json({ error: err.message || "Failed to process topics" }, { status: 500 });
  }
}
