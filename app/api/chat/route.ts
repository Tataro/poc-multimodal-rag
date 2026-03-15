import { NextResponse } from "next/server";

import { answerWithContext } from "@/lib/gemini/generate";
import { embedTextForQuery } from "@/lib/gemini/embeddings";
import { queryIndex } from "@/lib/pinecone/query";
import { chatRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { question, sourceType, topK } = chatRequestSchema.parse(json);

    const vector = await embedTextForQuery(question);
    const matches = await queryIndex({
      question,
      vector,
      topK: topK ?? 5,
      sourceType: sourceType && sourceType !== "all" ? sourceType : undefined,
    });

    if (matches.length === 0) {
      return NextResponse.json({
        answer:
          "No relevant sources were found. Try a broader question or ingest more material.",
        matches: [],
      });
    }

    const answer = await answerWithContext(question, matches);

    return NextResponse.json({ answer, matches });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat failure.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
