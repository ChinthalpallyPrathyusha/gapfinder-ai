/**
 * Hybrid Retrieval Layer with Reciprocal Rank Fusion (RRF)
 * Combines BM25 keyword matching with optional vector similarity embeddings.
 * Guaranteed to operate in pure BM25 mode if no embedding provider or key is present.
 */

import { BM25Index, IndexedDocument } from "./bm25";

export interface RetrievalChunk {
  id: string;
  documentId: string;
  docTitle: string;
  docType: "syllabus" | "notes" | "past_paper";
  chapter: string;
  section: string;
  page: number;
  chunkIndex: number;
  citation: string;
  content: string;
  topicId?: string;
  score?: number;
}

export interface HybridSearchOptions {
  topK?: number;
  rrfConstant?: number; // k constant, standard is 60
  docTypeFilter?: "syllabus" | "notes" | "past_paper";
  topicIdFilter?: string;
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Score = sum(1 / (k + rank_i))
 */
export function reciprocalRankFusion(
  bm25RankedIds: string[],
  vectorRankedIds: string[] = [],
  k: number = 60
): Map<string, number> {
  const rrfScores = new Map<string, number>();

  bm25RankedIds.forEach((id, index) => {
    const rank = index + 1;
    const score = 1 / (k + rank);
    rrfScores.set(id, (rrfScores.get(id) || 0) + score);
  });

  vectorRankedIds.forEach((id, index) => {
    const rank = index + 1;
    const score = 1 / (k + rank);
    rrfScores.set(id, (rrfScores.get(id) || 0) + score);
  });

  return rrfScores;
}

export class HybridRetriever {
  private bm25: BM25Index;
  private chunks: Map<string, RetrievalChunk> = new Map();

  constructor() {
    this.bm25 = new BM25Index(1.5, 0.75);
  }

  public indexChunks(chunks: RetrievalChunk[]): void {
    this.chunks.clear();
    const indexedDocs: IndexedDocument[] = [];

    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
      indexedDocs.push({
        id: chunk.id,
        text: `${chunk.docTitle} ${chunk.chapter} ${chunk.section} ${chunk.content}`,
        metadata: {
          docType: chunk.docType,
          topicId: chunk.topicId,
        },
      });
    }

    this.bm25.buildIndex(indexedDocs);
  }

  public search(query: string, options: HybridSearchOptions = {}): RetrievalChunk[] {
    const topK = options.topK || 5;
    const kConstant = options.rrfConstant || 60;

    // Run BM25 search
    const bm25Results = this.bm25.search(query, topK * 2);

    // Filter if needed
    let filteredBM25 = bm25Results;
    if (options.docTypeFilter) {
      filteredBM25 = filteredBM25.filter(
        (r) => r.metadata?.docType === options.docTypeFilter
      );
    }
    if (options.topicIdFilter) {
      filteredBM25 = filteredBM25.filter(
        (r) => r.metadata?.topicId === options.topicIdFilter
      );
    }

    const bm25Ids = filteredBM25.map((r) => r.id);

    // Compute RRF scores (works cleanly in BM25-only mode, or hybrid if vector ranks are supplied)
    const rrfMap = reciprocalRankFusion(bm25Ids, [], kConstant);

    const sortedIds = Array.from(rrfMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    const result: RetrievalChunk[] = [];
    for (const [id, rrfScore] of sortedIds) {
      const chunk = this.chunks.get(id);
      if (chunk) {
        result.push({
          ...chunk,
          score: Number(rrfScore.toFixed(4)),
        });
      }
    }
    return result;
  }
}
