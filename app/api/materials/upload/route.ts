import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { chunkDocument } from "@/lib/retrieval/chunking";
import { generateTopicTreeFromSyllabus } from "@/lib/ai/groq";
import { extractText } from "unpdf";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let title = "Document";
    let docType: "syllabus" | "notes" | "past_paper" = "notes";
    let textContent = "";
    let pageCount = 1;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const docTypeField = formData.get("docType") as string | null;

      if (docTypeField && ["syllabus", "notes", "past_paper"].includes(docTypeField)) {
        docType = docTypeField as any;
      }

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      title = file.name;
      const arrayBuffer = await file.arrayBuffer();

      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        try {
          const uint8Array = new Uint8Array(arrayBuffer);
          const pdfResult = await extractText(uint8Array);

          if (Array.isArray(pdfResult.text)) {
            textContent = pdfResult.text.join("\n\n");
            pageCount = pdfResult.text.length || 1;
          } else if (typeof pdfResult.text === "string") {
            textContent = pdfResult.text;
            pageCount = pdfResult.totalPages || 1;
          }

          // Scanned / image-only detection check
          if (!textContent || textContent.replace(/\s+/g, "").length < 25) {
            return NextResponse.json(
              {
                error: "This PDF appears to be scanned or image-only with no selectable text. Please upload a PDF with digital text, or paste the text directly.",
                isScanned: true,
              },
              { status: 422 }
            );
          }
        } catch (pdfErr: any) {
          console.error("PDF extraction error:", pdfErr);
          return NextResponse.json(
            { error: "Failed to extract text from this PDF. Please check if the file is encrypted or corrupted, or paste the text directly." },
            { status: 400 }
          );
        }
      } else {
        // Plain text / markdown
        const textDecoder = new TextDecoder();
        textContent = textDecoder.decode(arrayBuffer);
      }
    } else {
      // JSON payload (direct text pasting)
      const json = await req.json();
      title = json.title || (json.docType === "syllabus" ? "Syllabus Notes" : "Pasted Notes");
      docType = json.docType || "notes";
      textContent = json.text || "";
    }

    if (!textContent || textContent.trim().length < 10) {
      return NextResponse.json(
        { error: "Content is too short. Please provide meaningful academic text (at least 10 characters)." },
        { status: 400 }
      );
    }

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Save Document
    const document = await repo.createDocument({
      id: documentId,
      userId: session.userId,
      title,
      docType,
      rawContent: textContent,
      pageCount,
    });

    // 2. Perform Structure-Aware Chunking
    const rawChunks = chunkDocument(documentId, title, docType, textContent);
    // Tag chunks with existing user topics if available
    const existingUserTopics = await repo.getTopicsByUser(session.userId);
    const chunks = rawChunks.map((c) => {
      let matchedTopicId: string | undefined = undefined;
      if (existingUserTopics.length > 0) {
        const found = existingUserTopics.find(
          (t: any) =>
            c.content.toLowerCase().includes(t.title.toLowerCase()) ||
            c.metadata.citation.toLowerCase().includes(t.title.toLowerCase()) ||
            t.title.toLowerCase().split(" ").some((w: string) => w.length > 3 && c.content.toLowerCase().includes(w))
        );
        if (found) matchedTopicId = found.id;
      }

      return {
        ...c,
        userId: session.userId,
        docType: c.metadata.docType,
        chapter: c.metadata.chapter,
        section: c.metadata.section,
        page: c.metadata.page,
        chunkIndex: c.metadata.chunkIndex,
        citation: c.metadata.citation,
        topicId: matchedTopicId || null,
      };
    });

    await repo.insertChunks(chunks);

    // 3. If uploaded document is a Syllabus, automatically parse and REPLACE Topic Map
    let generatedTopicsCount = 0;
    if (docType === "syllabus") {
      try {
        const parsedTopics = await generateTopicTreeFromSyllabus(textContent);
        if (parsedTopics && parsedTopics.length > 0) {
          const topicsToInsert = parsedTopics.map((t: any, idx: number) => ({
            id: `top_${documentId}_${idx + 1}`,
            userId: session.userId,
            title: t.title,
            description: t.description,
            parentId: null,
            orderIndex: idx + 1,
            examImportance: t.examImportance || 6,
            examFrequency: t.examFrequency || 4,
          }));

          // Replace old syllabus topics with new syllabus topics
          await repo.replaceTopicsForUser(session.userId, topicsToInsert);
          generatedTopicsCount = topicsToInsert.length;

          // Map all existing chunks to the new syllabus topics
          const allUserChunks = await repo.getChunksByUser(session.userId);
          for (const c of allUserChunks) {
            const matching = topicsToInsert.find(
              (t: any) =>
                c.content.toLowerCase().includes(t.title.toLowerCase()) ||
                c.citation.toLowerCase().includes(t.title.toLowerCase()) ||
                t.title.toLowerCase().split(" ").some((w: string) => w.length > 3 && c.content.toLowerCase().includes(w))
            );
            if (matching && c.topicId !== matching.id) {
              await repo.updateChunkTopic(c.id, matching.id);
            }
          }
        }
      } catch (topicErr) {
        console.warn("Auto topic extraction warning:", topicErr);
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        docType: document.docType,
        chunksCount: chunks.length,
        pageCount,
      },
      generatedTopicsCount,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to process document" }, { status: 500 });
  }
}
