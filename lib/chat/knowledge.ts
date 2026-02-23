// lib/chat/knowledge.ts
// RAG retrieval: embed user query with Gemini, search pgvector for relevant knowledge chunks

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPool } from "@/lib/db";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMS = 768; // Truncate to match pgvector column (Matryoshka embedding)
const MAX_CHUNKS = 5;
const SIMILARITY_THRESHOLD = 0.3;

/**
 * Retrieve relevant knowledge chunks for a user query.
 *
 * 1. Embeds the query using Gemini gemini-embedding-001
 * 2. Truncates to 768 dims (Matryoshka) to match stored embeddings
 * 3. Queries Neon pgvector for cosine similarity
 * 4. Returns top chunks concatenated as markdown (or null if no good matches)
 */
export async function getRelevantKnowledge(
  query: string,
  geminiKey: string
): Promise<string | null> {
  try {
    // Embed the user's query
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(query);
    // Truncate to 768 dims — gemini-embedding-001 is a Matryoshka model,
    // so the first N dimensions are a valid lower-dimensional embedding
    const embedding = result.embedding.values.slice(0, EMBEDDING_DIMS);

    // Format as pgvector literal: [0.1,0.2,...]
    const vectorLiteral = `[${embedding.join(",")}]`;

    // Query for similar chunks
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT section_heading, chunk_text,
              1 - (embedding <=> $1::vector) AS similarity
       FROM knowledge_chunks
       WHERE 1 - (embedding <=> $1::vector) > $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [vectorLiteral, SIMILARITY_THRESHOLD, MAX_CHUNKS]
    );

    if (rows.length === 0) {
      return null;
    }

    // Concatenate chunks as markdown sections
    const sections = rows.map(
      (row: { section_heading: string | null; chunk_text: string; similarity: number }) =>
        row.chunk_text
    );

    return sections.join("\n\n---\n\n");
  } catch (error) {
    // Log but don't fail the chat — knowledge retrieval is best-effort
    console.error("[knowledge] RAG retrieval failed:", error);
    return null;
  }
}
