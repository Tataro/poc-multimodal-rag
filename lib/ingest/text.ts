import { randomUUID } from "node:crypto";

import { embedTextForDocument } from "@/lib/gemini/embeddings";
import { upsertRecord } from "@/lib/pinecone/upsert";
import type { IngestLog, IngestResult } from "@/lib/types";

function chunkText(text: string, size = 1200, overlap = 150) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= size) {
    return [clean];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + size, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) {
      break;
    }
    start += size - overlap;
  }
  return chunks;
}

export async function ingestTextFile(fileName: string, text: string) {
  const logs: IngestLog[] = [];
  const chunks = chunkText(text);
  logs.push({
    phase: "chunk",
    message: `Split into ${chunks.length} chunk(s).`,
  });

  for (const [chunkIndex, chunk] of chunks.entries()) {
    logs.push({
      phase: "embed",
      message: `Embedding chunk ${chunkIndex + 1}/${chunks.length}.`,
    });
    const values = await embedTextForDocument(chunk);
    await upsertRecord(
      {
        id: randomUUID(),
        sourceType: "text",
        sourceFile: fileName,
        mimeType: "text/plain",
        chunkIndex,
        chunkText: chunk,
        createdAt: new Date().toISOString(),
      },
      values,
    );
  }

  return {
    fileName,
    sourceType: "text",
    inserted: chunks.length,
    logs,
  } satisfies IngestResult;
}
