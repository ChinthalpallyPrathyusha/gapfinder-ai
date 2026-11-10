/**
 * Structure-Aware Document Chunker
 * Detects structural headings (Chapters, Sections, Modules, Pages)
 * to generate semantic chunks with human-readable citations.
 */

export interface ChunkMetadata {
  documentId: string;
  docTitle: string;
  docType: "syllabus" | "notes" | "past_paper";
  chapter: string;
  section: string;
  page: number;
  chunkIndex: number;
  citation: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  tokenCount: number;
  metadata: ChunkMetadata;
}

export interface ChunkingOptions {
  maxChunkSize?: number; // target max word count per chunk (~400-600 words)
  overlap?: number;      // overlap words (~50 words)
}

// Regex patterns to detect headings
const CHAPTER_REGEX = /^(?:chapter|unit|module|part)\s*(\d+|[ivxlcdm]+)[:.\s-]+([^\n\r]+)/im;
const SECTION_REGEX = /^(?:section|topic|lesson)\s*(\d+(?:\.\d+)*)[:.\s-]+([^\n\r]+)/im;
const MARKDOWN_HEADER_REGEX = /^(#{1,3})\s+([^\n\r]+)/m;
const PAGE_BREAK_REGEX = /(?:\[Page\s*(\d+)\]|--- Page\s*(\d+)\s*---|(?:\f))/i;

export function extractStructureFromText(text: string): { chapter: string; section: string } {
  let chapter = "General";
  let section = "Overview";

  const chapterMatch = text.match(CHAPTER_REGEX);
  if (chapterMatch) {
    chapter = `Chapter ${chapterMatch[1]}: ${chapterMatch[2].trim()}`;
  } else {
    const mdH1 = text.match(/^#\s+([^\n\r]+)/m);
    if (mdH1) {
      chapter = mdH1[1].trim();
    }
  }

  const sectionMatch = text.match(SECTION_REGEX);
  if (sectionMatch) {
    section = `Section ${sectionMatch[1]}: ${sectionMatch[2].trim()}`;
  } else {
    const mdH2 = text.match(/^##\s+([^\n\r]+)/m);
    if (mdH2) {
      section = mdH2[1].trim();
    }
  }

  return { chapter, section };
}

export function chunkDocument(
  documentId: string,
  docTitle: string,
  docType: "syllabus" | "notes" | "past_paper",
  rawContent: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const maxChunkWords = options.maxChunkSize || 350;
  const overlapWords = options.overlap || 40;

  if (!rawContent || !rawContent.trim()) {
    return [];
  }

  // Split into paragraphs / lines
  const rawParagraphs = rawContent.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];

  let currentChapter = "Chapter 1";
  let currentSection = "Section 1";
  let currentPage = 1;
  let currentWords: string[] = [];
  let chunkIndex = 0;

  function commitChunk() {
    if (currentWords.length === 0) return;

    const content = currentWords.join(" ").trim();
    const wordCount = currentWords.length;
    const citation = `${docTitle}, ${currentChapter}, ${currentSection}, p.${currentPage}`;

    chunks.push({
      id: `${documentId}_chunk_${chunkIndex}`,
      documentId,
      content,
      tokenCount: Math.round(wordCount * 1.3),
      metadata: {
        documentId,
        docTitle,
        docType,
        chapter: currentChapter,
        section: currentSection,
        page: currentPage,
        chunkIndex,
        citation,
      },
    });

    chunkIndex++;

    // Preserve overlap
    if (currentWords.length > overlapWords) {
      currentWords = currentWords.slice(currentWords.length - overlapWords);
    } else {
      currentWords = [];
    }
  }

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check for page markers
    const pageMatch = trimmed.match(PAGE_BREAK_REGEX);
    if (pageMatch) {
      const pageNum = parseInt(pageMatch[1] || pageMatch[2] || "0", 10);
      if (pageNum > 0) currentPage = pageNum;
    }

    // Check for structural headings
    const chapterMatch = trimmed.match(CHAPTER_REGEX);
    if (chapterMatch) {
      commitChunk();
      currentChapter = `Chapter ${chapterMatch[1]}: ${chapterMatch[2].trim()}`;
    }

    const sectionMatch = trimmed.match(SECTION_REGEX);
    if (sectionMatch) {
      commitChunk();
      currentSection = `Section ${sectionMatch[1]}: ${sectionMatch[2].trim()}`;
    }

    const mdHeaderMatch = trimmed.match(MARKDOWN_HEADER_REGEX);
    if (mdHeaderMatch) {
      commitChunk();
      if (mdHeaderMatch[1].length === 1) {
        currentChapter = mdHeaderMatch[2].trim();
      } else {
        currentSection = mdHeaderMatch[2].trim();
      }
    }

    const words = trimmed.split(/\s+/);
    for (const w of words) {
      currentWords.push(w);
      if (currentWords.length >= maxChunkWords) {
        commitChunk();
      }
    }
  }

  // Flush remaining words
  if (currentWords.length > 0) {
    commitChunk();
  }

  return chunks;
}
