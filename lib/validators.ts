import { z } from "zod";

export const envSchema = z.object({
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-2-preview"),
  GEMINI_GENERATION_MODEL: z.string().default("gemini-3.1-flash-lite-preview"),
  PINECONE_API_KEY: z.string().default(""),
  PINECONE_INDEX_NAME: z.string().default(""),
  PINECONE_INDEX_HOST: z.string().optional(),
  PINECONE_NAMESPACE: z.string().default("default"),
  EMBEDDING_DIMENSION: z.coerce.number().int().positive().default(1536),
  LOCAL_UPLOAD_DIR: z.string().default("public/uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(200),
  FFMPEG_PATH: z.string().default("ffmpeg"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Multimodal RAG"),
  NEXT_PUBLIC_DEFAULT_TOP_K: z.coerce.number().int().positive().default(5),
  NEXT_PUBLIC_MAX_TOP_K: z.coerce.number().int().positive().default(10),
});

export const chatRequestSchema = z.object({
  question: z.string().min(1),
  topK: z.number().int().positive().max(20).optional(),
  sourceType: z.enum(["text", "image", "video", "all"]).optional(),
});
