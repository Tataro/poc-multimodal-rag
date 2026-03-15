import { GoogleGenAI } from "@google/genai";

import { assertRuntimeSecrets, config } from "@/lib/config";

type InlineContent = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

function getAi() {
  assertRuntimeSecrets();
  return new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

function normalize(vector: number[]) {
  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value ** 2, 0),
  );
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    return vector;
  }
  return vector.map((value) => value / magnitude);
}

async function embedContent(
  contents: string | InlineContent[],
  taskType?: string,
) {
  const response = await getAi().models.embedContent({
    model: config.GEMINI_EMBEDDING_MODEL,
    contents,
    config: {
      outputDimensionality: config.EMBEDDING_DIMENSION,
      ...(taskType ? { taskType } : {}),
    },
  });

  const vector = response.embeddings?.[0]?.values ?? [];
  return normalize(vector);
}

export async function embedTextForDocument(text: string) {
  return embedContent(text, "RETRIEVAL_DOCUMENT");
}

export async function embedTextForQuery(text: string) {
  return embedContent(text, "RETRIEVAL_QUERY");
}

export async function embedMedia(buffer: Buffer, mimeType: string) {
  return embedContent([
    {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    },
  ]);
}
