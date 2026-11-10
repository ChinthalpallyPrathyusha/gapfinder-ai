import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await repo.getDocumentsByUser(session.userId);
  const chunks = await repo.getChunksByUser(session.userId);

  return NextResponse.json({
    documents,
    chunksCount: chunks.length,
    recentChunks: chunks.slice(0, 10).map((c) => ({
      id: c.id,
      documentId: c.documentId,
      citation: c.citation,
      chapter: c.chapter,
      section: c.section,
      preview: c.content.slice(0, 120) + "...",
      tokenCount: c.tokenCount,
    })),
  });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("id");
  const clearAll = searchParams.get("all") === "true";

  if (clearAll) {
    await repo.clearAllUserData(session.userId);
    return NextResponse.json({ success: true, message: "All documents and topics cleared" });
  }

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  await repo.deleteDocument(documentId, session.userId);

  return NextResponse.json({ success: true });
}
