import { NextResponse } from "next/server";

import { config } from "@/lib/config";
import { ingestImageFile } from "@/lib/ingest/image";
import { ingestTextFile } from "@/lib/ingest/text";
import { ingestVideoFile } from "@/lib/ingest/video";

export const runtime = "nodejs";

function detectTextMime(file: File) {
  if (file.type) {
    return file.type;
  }
  if (file.name.endsWith(".md")) {
    return "text/markdown";
  }
  return "text/plain";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const items = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded." },
        { status: 400 },
      );
    }

    const results = [];

    for (const file of items) {
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > config.MAX_UPLOAD_SIZE_MB) {
        throw new Error(
          `${file.name} exceeds the ${config.MAX_UPLOAD_SIZE_MB}MB upload limit.`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || detectTextMime(file);

      if (
        mimeType.startsWith("text/") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        const text = buffer.toString("utf8");
        results.push(await ingestTextFile(file.name, text));
        continue;
      }

      if (mimeType.startsWith("image/")) {
        results.push(await ingestImageFile(file.name, buffer, mimeType));
        continue;
      }

      if (
        mimeType.startsWith("video/") ||
        file.name.endsWith(".mp4") ||
        file.name.endsWith(".mov")
      ) {
        results.push(
          await ingestVideoFile(file.name, buffer, mimeType || "video/mp4"),
        );
        continue;
      }

      throw new Error(`Unsupported file type for ${file.name}.`);
    }

    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected ingestion failure.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
