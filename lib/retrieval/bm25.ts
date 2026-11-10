/**
 * BM25 Retrieval Engine
 * High-performance, zero-dependency Okapi BM25 scoring algorithm
 * with tokenization, stop-words filtering, and term frequency normalization.
 */

export interface IndexedDocument {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface BM25SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
  "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
  "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
  "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
  "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
  "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
  "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
  "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
  "your", "yours", "yourself", "yourselves"
]);

export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

export class BM25Index {
  private k1: number; // Term frequency saturation parameter (typically 1.2 to 2.0)
  private b: number;  // Length normalization parameter (typically 0.75)
  private documents: IndexedDocument[] = [];
  private docTokens: string[][] = [];
  private docLengths: number[] = [];
  private avgDocLength: number = 0;
  private idf: Map<string, number> = new Map();
  private termDocFrequencies: Map<string, Map<number, number>> = new Map();

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  public buildIndex(docs: IndexedDocument[]): void {
    this.documents = docs;
    this.docTokens = [];
    this.docLengths = [];
    this.termDocFrequencies.clear();
    this.idf.clear();

    const N = docs.length;
    if (N === 0) {
      this.avgDocLength = 0;
      return;
    }

    let totalLength = 0;
    const docFrequency: Map<string, number> = new Map();

    for (let i = 0; i < N; i++) {
      const tokens = tokenize(docs[i].text);
      this.docTokens.push(tokens);
      const len = tokens.length;
      this.docLengths.push(len);
      totalLength += len;

      const seenInDoc = new Set<string>();
      for (const token of tokens) {
        if (!this.termDocFrequencies.has(token)) {
          this.termDocFrequencies.set(token, new Map());
        }
        const docFreqMap = this.termDocFrequencies.get(token)!;
        docFreqMap.set(i, (docFreqMap.get(i) || 0) + 1);

        if (!seenInDoc.has(token)) {
          seenInDoc.add(token);
          docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
        }
      }
    }

    this.avgDocLength = totalLength / N;

    // Calculate Robertson-Spärck Jones IDF
    for (const [term, df] of docFrequency.entries()) {
      // idf = ln((N - df + 0.5) / (df + 0.5) + 1)
      const idfValue = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      this.idf.set(term, Math.max(0.01, idfValue));
    }
  }

  public search(query: string, topK: number = 5): BM25SearchResult[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.documents.length === 0) {
      return [];
    }

    const scores: { docIndex: number; score: number }[] = [];
    const N = this.documents.length;

    for (let i = 0; i < N; i++) {
      let score = 0;
      const docLength = this.docLengths[i];
      const lengthNorm = 1 - this.b + this.b * (docLength / (this.avgDocLength || 1));

      for (const token of queryTokens) {
        if (!this.idf.has(token)) continue;

        const termIdf = this.idf.get(token)!;
        const termFreq = this.termDocFrequencies.get(token)?.get(i) || 0;

        if (termFreq > 0) {
          const numerator = termFreq * (this.k1 + 1);
          const denominator = termFreq + this.k1 * lengthNorm;
          score += termIdf * (numerator / denominator);
        }
      }

      if (score > 0) {
        scores.push({ docIndex: i, score });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(s => ({
      id: this.documents[s.docIndex].id,
      score: Number(s.score.toFixed(4)),
      metadata: this.documents[s.docIndex].metadata
    }));
  }
}
