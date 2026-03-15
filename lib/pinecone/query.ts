import { getIndex } from "@/lib/pinecone/client";
import type { QueryMatch, SourceType } from "@/lib/types";

function sortMatches(matches: QueryMatch[]) {
  return [...matches].sort((left, right) => right.score - left.score);
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3);
}

function getMatchText(match: QueryMatch) {
  return [match.sourceFile, match.chunkText, match.description]
    .filter(Boolean)
    .join(" ");
}

function getLexicalOverlapScore(question: string, match: QueryMatch) {
  const questionTokens = [...new Set(tokenize(question))];
  if (questionTokens.length === 0) {
    return 0;
  }

  const matchTokens = new Set(tokenize(getMatchText(match)));
  let overlapCount = 0;

  for (const token of questionTokens) {
    if (matchTokens.has(token)) {
      overlapCount += 1;
    }
  }

  return overlapCount / questionTokens.length;
}

function getAllModeRankScore(question: string, match: QueryMatch) {
  const lexicalOverlap = getLexicalOverlapScore(question, match);
  const modalityBoost = match.sourceType === "text" ? 0 : 0.03;
  return match.score + lexicalOverlap * 0.25 + modalityBoost;
}

function getStringMetadata(
  metadata: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  return typeof metadata[key] === "string" ? metadata[key] : fallback;
}

function mergeAllModeMatches(
  question: string,
  resultSets: QueryMatch[][],
  topK: number,
) {
  const sortedSets = resultSets
    .map(sortMatches)
    .filter((matches) => matches.length > 0);

  const merged: QueryMatch[] = [];
  const seen = new Set<string>();

  for (const matches of sortedSets) {
    const topMatch = matches[0];
    if (!topMatch || seen.has(topMatch.id)) {
      continue;
    }
    merged.push(topMatch);
    seen.add(topMatch.id);
  }

  const remaining = sortedSets
    .flatMap((matches) => matches.slice(1))
    .sort(
      (left, right) =>
        getAllModeRankScore(question, right) -
        getAllModeRankScore(question, left),
    );

  for (const match of remaining) {
    if (merged.length >= topK) {
      break;
    }
    if (seen.has(match.id)) {
      continue;
    }
    merged.push(match);
    seen.add(match.id);
  }

  return merged
    .toSorted(
      (left, right) =>
        getAllModeRankScore(question, right) -
        getAllModeRankScore(question, left),
    )
    .slice(0, topK);
}

export async function queryIndex(params: {
  question: string;
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
          sourceFile: getStringMetadata(metadata, "sourceFile", match.id),
          mimeType: getStringMetadata(
            metadata,
            "mimeType",
            "application/octet-stream",
          ),
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

  if (params.sourceType) {
    return sortMatches(results.flat()).slice(0, params.topK);
  }

  return mergeAllModeMatches(params.question, results, params.topK);
}
