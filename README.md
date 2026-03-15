# Multimodal RAG POC

This repository contains a multimodal retrieval-augmented generation proof of concept built with Next.js, Tailwind CSS, Gemini Embedding 2, and Pinecone.

The project is designed to answer one core question: how do we build a single search and chat experience over text, images, and video using Gemini's native multimodal embedding model instead of converting everything into plain text first?

## What this project does

- Ingests text files, images, and video
- Generates native multimodal embeddings with `gemini-embedding-2-preview`
- Stores vectors in Pinecone
- Stores uploaded previewable assets locally for the POC
- Lets users query the indexed corpus through a chat-style UI
- Shows retrieval evidence with modality-aware previews

## Why this architecture

The important design choice in this project is that retrieval vectors for images and video come from the raw media itself, not from a text caption alone.

That means the system uses two different Gemini capabilities for different jobs:

- `gemini-embedding-2-preview`
  used for retrieval vectors across text, images, and video
- `gemini-3.1-flash-lite-preview`
  used for generating descriptions and final answers from retrieved context

This separation matters:

- embeddings are for finding relevant items
- generated descriptions are for giving the answering model usable language to cite and summarize

## Current scope

Implemented now:

- product-style landing page
- product-style chat page
- product-style upload and ingest page
- query API route
- ingest API route
- health check route
- text chunking
- image embedding and description generation
- video chunking with `ffmpeg`
- Pinecone upsert and query helpers

Not implemented yet:

- streaming chat responses
- streamed ingestion progress via SSE or websockets
- deletion and re-index management
- object storage
- authentication
- multi-user isolation
- background job processing

## Tech stack

- Next.js App Router
- React 19
- Tailwind CSS v4
- TypeScript
- `@google/genai`
- `@pinecone-database/pinecone`
- `zod`
- `ffmpeg`

## Repository structure

```text
.
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   ├── health/route.ts
│   │   └── ingest/route.ts
│   ├── chat/page.tsx
│   ├── ingest/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   ├── ingest/
│   └── ui/
├── lib/
│   ├── gemini/
│   ├── ingest/
│   ├── pinecone/
│   ├── storage/
│   ├── utils/
│   ├── config.ts
│   ├── types.ts
│   └── validators.ts
├── public/uploads/
│   ├── images/
│   ├── posters/
│   └── video/
├── data/manifests/
├── .env.example
└── README.md
```

## Requirements

- Node.js 20 or newer
- pnpm
- ffmpeg installed and available on `PATH`
- Gemini API key
- Pinecone API key
- A Pinecone dense index configured for:
  - dimension `1536`
  - metric `cosine`

## Pinecone index requirements

Before using the app, create a Pinecone index manually.

Recommended configuration:

- Index name: `multimodal-rag`
- Dimension: `1536`
- Metric: `cosine`
- Namespace strategy: the app currently writes into modality-specific namespaces via the SDK query/upsert layer

If your Pinecone setup gives you a dedicated host for the index, place that host value in `PINECONE_INDEX_HOST`.

## Environment variables

Copy the example file first:

```bash
cp .env.example .env.local
```

Then configure:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=gemini-embedding-2-preview
GEMINI_GENERATION_MODEL=gemini-3.1-flash-lite-preview
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=multimodal-rag
PINECONE_INDEX_HOST=your-pinecone-index-host
PINECONE_NAMESPACE=default
EMBEDDING_DIMENSION=1536
LOCAL_UPLOAD_DIR=public/uploads
MAX_UPLOAD_SIZE_MB=200
FFMPEG_PATH=ffmpeg
NEXT_PUBLIC_APP_NAME=Multimodal RAG
NEXT_PUBLIC_DEFAULT_TOP_K=5
NEXT_PUBLIC_MAX_TOP_K=10
```

### Variable notes

- `GEMINI_API_KEY`
  required for both embeddings and generation
- `GEMINI_EMBEDDING_MODEL`
  should remain `gemini-embedding-2-preview` unless you intentionally change models
- `GEMINI_GENERATION_MODEL`
  used for descriptions and final answers
- `PINECONE_INDEX_NAME`
  must match an existing index
- `PINECONE_INDEX_HOST`
  required if your Pinecone setup expects direct host addressing
- `EMBEDDING_DIMENSION`
  set to `1536` in this project
- `LOCAL_UPLOAD_DIR`
  local storage root for the POC
- `FFMPEG_PATH`
  can stay `ffmpeg` if ffmpeg is already on `PATH`

## Install

```bash
pnpm install
```

## Local development

Start the development server:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Validation commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## App routes

- `/`
  overview page with navigation to chat and ingest
- `/chat`
  multimodal retrieval chat interface
- `/ingest`
  upload and ingestion interface
- `/api/chat`
  query embedding, Pinecone retrieval, answer generation
- `/api/ingest`
  file upload, ingest orchestration, indexing
- `/api/health`
  runtime readiness check for env, Pinecone, and ffmpeg

## Ingestion behavior

### Text ingestion

- supports `.md` and `.txt`
- splits large text into overlapping chunks
- embeds each chunk with retrieval-document settings
- stores chunk text in record metadata for answer grounding

### Image ingestion

- persists the original image under `public/uploads/images`
- creates one native multimodal embedding from the raw image
- generates one textual description for downstream answer generation
- stores preview and description metadata alongside the vector record

### Video ingestion

- persists the uploaded video under `public/uploads/video`
- chunks long video with `ffmpeg`
- creates one poster frame per chunk under `public/uploads/posters`
- creates one native video embedding per chunk
- generates one description per chunk
- stores each chunk as its own Pinecone record

## Retrieval flow

The query path is:

1. User enters a question in the chat UI.
2. The backend embeds that question with Gemini Embedding 2 using retrieval-query mode.
3. The query vector is normalized.
4. Pinecone is queried for nearest matches.
5. Retrieved metadata is converted into context blocks.
6. Gemini generation produces the final answer.
7. The UI renders the answer plus evidence cards and media previews.

## Why vectors are normalized

Gemini's docs note that smaller dimensions such as `1536` are not normalized by default. Since this project uses cosine similarity in Pinecone, the application normalizes embeddings before upsert and query to keep distance behavior consistent.

## Using the app

### Ingest files

1. Open `/ingest`.
2. Drag files into the dropzone or browse manually.
3. Start ingestion.
4. Wait for the per-file logs to complete.

### Query the corpus

1. Open `/chat`.
2. Ask a question.
3. Review the returned answer.
4. Inspect the evidence cards on the right.
5. Click a source to preview the related text, image, or video segment.

## Important limitations

- This is a proof of concept, not a hardened production system.
- Uploaded assets are stored on local disk.
- Ingestion is synchronous and may block on large video files.
- Pinecone index lifecycle is not managed by the app.
- There is no auth or access control.
- There is no retry queue for long-running or failed jobs.

## Recommended next improvements

- add streaming answer responses in chat
- add server-sent events for ingest progress
- add delete and reindex flows
- add object storage support
- add background workers for video processing
- add persistent source manifests and audit metadata
- add tests around ingest and query services

## Authorship note

This project was written with GitHub Copilot using the GPT-5.4 model.
