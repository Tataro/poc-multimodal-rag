import path from "node:path";

import { envSchema } from "@/lib/validators";

const parsed = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL,
  GEMINI_GENERATION_MODEL: process.env.GEMINI_GENERATION_MODEL,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  PINECONE_INDEX_HOST: process.env.PINECONE_INDEX_HOST,
  PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE,
  EMBEDDING_DIMENSION: process.env.EMBEDDING_DIMENSION,
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
  MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB,
  FFMPEG_PATH: process.env.FFMPEG_PATH,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_DEFAULT_TOP_K: process.env.NEXT_PUBLIC_DEFAULT_TOP_K,
  NEXT_PUBLIC_MAX_TOP_K: process.env.NEXT_PUBLIC_MAX_TOP_K,
});

const env = parsed;

export const config = {
  ...env,
  uploadRoot: path.join(process.cwd(), env.LOCAL_UPLOAD_DIR),
  imageRoot: path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, "images"),
  videoRoot: path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, "video"),
  posterRoot: path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, "posters"),
  manifestRoot: path.join(process.cwd(), "data/manifests"),
  publicUploadRoot: `/${env.LOCAL_UPLOAD_DIR.replace(/^public\/?/, "")}`,
};

export function assertRuntimeSecrets() {
  if (!config.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required.");
  }
  if (!config.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is required.");
  }
  if (!config.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is required.");
  }
}
