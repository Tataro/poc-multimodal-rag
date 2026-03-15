export type SourceType = "text" | "image" | "video";

export type SourceRecord = {
  id: string;
  sourceType: SourceType;
  sourceFile: string;
  mimeType: string;
  chunkIndex?: number;
  sourceVideo?: string;
  mediaPath?: string;
  previewPath?: string;
  description?: string;
  chunkText?: string;
  createdAt: string;
};

export type QueryMatch = SourceRecord & {
  score: number;
};

export type ChatRequest = {
  question: string;
  topK?: number;
  sourceType?: SourceType | "all";
};

export type ChatResponse = {
  answer: string;
  matches: QueryMatch[];
};

export type IngestLog = {
  phase: string;
  message: string;
};

export type IngestResult = {
  fileName: string;
  sourceType: SourceType;
  inserted: number;
  logs: IngestLog[];
};

export type HealthResponse = {
  ok: boolean;
  services: {
    env: boolean;
    gemini: boolean;
    pinecone: boolean;
    ffmpeg: boolean;
  };
};
