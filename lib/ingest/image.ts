import { randomUUID } from "node:crypto";

import { describeMedia } from "@/lib/gemini/generate";
import { embedMedia } from "@/lib/gemini/embeddings";
import { upsertRecord } from "@/lib/pinecone/upsert";
import { saveBuffer } from "@/lib/storage/local";
import type { IngestLog, IngestResult } from "@/lib/types";

export async function ingestImageFile(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
) {
  const logs: IngestLog[] = [];
  logs.push({ phase: "save", message: `Persisting ${fileName}.` });
  const stored = await saveBuffer({
    buffer,
    originalName: fileName,
    target: "images",
  });

  logs.push({ phase: "describe", message: "Generating descriptive caption." });
  const description = await describeMedia(buffer, mimeType);

  logs.push({ phase: "embed", message: "Creating multimodal embedding." });
  const values = await embedMedia(buffer, mimeType);

  await upsertRecord(
    {
      id: randomUUID(),
      sourceType: "image",
      sourceFile: fileName,
      mimeType,
      mediaPath: stored.publicPath,
      previewPath: stored.publicPath,
      description,
      createdAt: new Date().toISOString(),
    },
    values,
  );

  return {
    fileName,
    sourceType: "image",
    inserted: 1,
    logs,
  } satisfies IngestResult;
}
