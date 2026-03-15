import { getIndex } from "@/lib/pinecone/client";
import type { QueryMatch, SourceType } from "@/lib/types";

export async function queryIndex(params: {
  vector: number[];
  topK: number;
  sourceType?: SourceType;
}) {
  const namespaces: SourceType[] = params.sourceType
    ? [params.sourceType]
    : ["text", "image", "video"];

  const results = await Promise.all(
    namespaces.map(async (namespace) => {
      const index = getIndex().namespace(namespace);
      const response = await index.query({
        vector: params.vector,
        topK: params.topK,
        includeMetadata: true,
        includeValues: false,
      });

      return (response.matches ?? []).map<QueryMatch>((match) => {
        const metadata = (match.metadata ?? {}) as Record<string, unknown>;
        return {
          id: match.id,
          score: match.score ?? 0,
          sourceType: (metadata.sourceType as SourceType) ?? namespace,
          sourceFile: String(metadata.sourceFile ?? match.id),
          mimeType: String(metadata.mimeType ?? "application/octet-stream"),
          chunkIndex:
            typeof metadata.chunkIndex === "number"
              ? metadata.chunkIndex
              : undefined,
          sourceVideo:
            typeof metadata.sourceVideo === "string"
              ? metadata.sourceVideo
              : undefined,
          mediaPath:
            typeof metadata.mediaPath === "string"
              ? metadata.mediaPath
              : undefined,
          previewPath:
            typeof metadata.previewPath === "string"
              ? metadata.previewPath
              : undefined,
          description:
            typeof metadata.description === "string"
              ? metadata.description
              : undefined,
          chunkText:
            typeof metadata.chunkText === "string"
              ? metadata.chunkText
              : undefined,
          createdAt:
            typeof metadata.createdAt === "string"
              ? metadata.createdAt
              : new Date().toISOString(),
        };
      });
    }),
  );

  return results
    .flat()
    .sort((left, right) => right.score - left.score)
    .slice(0, params.topK);
}
