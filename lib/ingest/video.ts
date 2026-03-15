import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { describeMedia } from "@/lib/gemini/generate";
import { embedMedia } from "@/lib/gemini/embeddings";
import { upsertRecord } from "@/lib/pinecone/upsert";
import { saveBuffer } from "@/lib/storage/local";
import { chunkVideoFile, extractPoster } from "@/lib/utils/ffmpeg";
import { config } from "@/lib/config";
import type { IngestLog, IngestResult } from "@/lib/types";

export async function ingestVideoFile(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
) {
  const logs: IngestLog[] = [];
  logs.push({ phase: "save", message: `Persisting ${fileName}.` });
  const original = await saveBuffer({
    buffer,
    originalName: fileName,
    target: "video",
  });

  const tempChunkRoot = path.join(
    config.videoRoot,
    `tmp-${randomUUID().slice(0, 8)}`,
  );
  await mkdir(tempChunkRoot, { recursive: true });

  logs.push({
    phase: "chunk",
    message: "Chunking video for Gemini embedding limits.",
  });
  const chunks = await chunkVideoFile(original.absolutePath, tempChunkRoot);

  for (const chunk of chunks) {
    logs.push({
      phase: "poster",
      message: `Extracting poster for chunk ${chunk.chunkIndex + 1}.`,
    });
    const posterName = `${path.basename(chunk.path, ".mp4")}.jpg`;
    const posterPath = path.join(config.posterRoot, posterName);
    await extractPoster(chunk.path, posterPath);

    const chunkBuffer = await readFile(chunk.path);
    logs.push({
      phase: "describe",
      message: `Generating description for chunk ${chunk.chunkIndex + 1}.`,
    });
    const description = await describeMedia(chunkBuffer, mimeType);
    logs.push({
      phase: "embed",
      message: `Embedding chunk ${chunk.chunkIndex + 1}.`,
    });
    const values = await embedMedia(chunkBuffer, mimeType);

    const chunkFileName = path.basename(chunk.path);
    await upsertRecord(
      {
        id: randomUUID(),
        sourceType: "video",
        sourceFile: chunkFileName,
        mimeType,
        chunkIndex: chunk.chunkIndex,
        sourceVideo: fileName,
        mediaPath: `${config.publicUploadRoot}/video/${path.relative(config.videoRoot, chunk.path).replace(/\\/g, "/")}`,
        previewPath: `${config.publicUploadRoot}/posters/${posterName}`,
        description,
        createdAt: new Date().toISOString(),
      },
      values,
    );
  }

  return {
    fileName,
    sourceType: "video",
    inserted: chunks.length,
    logs,
  } satisfies IngestResult;
}
