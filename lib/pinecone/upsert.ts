import { getIndex } from "@/lib/pinecone/client";
import type { SourceRecord } from "@/lib/types";

export async function upsertRecord(record: SourceRecord, values: number[]) {
  const index = getIndex().namespace(
    record.sourceType === "text"
      ? "text"
      : record.sourceType === "image"
        ? "image"
        : "video",
  );

  await index.upsert([
    {
      id: record.id,
      values,
      metadata: record,
    },
  ]);
}
