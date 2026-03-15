import { NextResponse } from "next/server";

import { config } from "@/lib/config";
import { pingPinecone } from "@/lib/pinecone/client";
import { ensureFfmpegBinary } from "@/lib/utils/ffmpeg";

export const runtime = "nodejs";

export async function GET() {
  const ffmpeg = await ensureFfmpegBinary();

  try {
    await pingPinecone();
    return NextResponse.json({
      ok: true,
      services: {
        env: Boolean(config.GEMINI_API_KEY && config.PINECONE_API_KEY),
        gemini: true,
        pinecone: true,
        ffmpeg,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        services: {
          env: Boolean(config.GEMINI_API_KEY && config.PINECONE_API_KEY),
          gemini: true,
          pinecone: false,
          ffmpeg,
        },
      },
      { status: 500 },
    );
  }
}
