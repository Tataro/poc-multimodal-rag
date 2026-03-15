import { GoogleGenAI } from "@google/genai";

import { assertRuntimeSecrets, config } from "@/lib/config";
import type { QueryMatch } from "@/lib/types";

function getAi() {
  assertRuntimeSecrets();
  return new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

export async function describeMedia(buffer: Buffer, mimeType: string) {
  const response = await getAi().models.generateContent({
    model: config.GEMINI_GENERATION_MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      },
      "Describe this media for a retrieval system. Include the main entities, actions, layout, and any notable relationships that would help answer questions later.",
    ],
  });

  return response.text ?? "";
}

export async function answerWithContext(
  question: string,
  matches: QueryMatch[],
) {
  const context = matches
    .map((match) => {
      const chunkLabel =
        typeof match.chunkIndex === "number"
          ? ` :: chunk ${match.chunkIndex}`
          : "";
      const label = `${match.sourceType.toUpperCase()} :: ${match.sourceFile}${chunkLabel} :: score ${match.score.toFixed(3)}`;
      const body =
        match.chunkText ?? match.description ?? "No textual context available.";
      return `${label}\n${body}`;
    })
    .join("\n\n---\n\n");

  const response = await getAi().models.generateContent({
    model: config.GEMINI_GENERATION_MODEL,
    contents: `You answer questions using a multimodal retrieval context. Cite the exact source file names in prose when you rely on them.\n\nQuestion: ${question}\n\nContext:\n${context}`,
  });

  return response.text ?? "No answer generated.";
}
