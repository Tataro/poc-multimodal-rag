"use client";

import Link from "next/link";
import { useState } from "react";

import { IngestStatus } from "@/components/ingest/IngestStatus";
import { UploadDropzone } from "@/components/ingest/UploadDropzone";
import { UploadQueue } from "@/components/ingest/UploadQueue";
import { Button } from "@/components/ui/button";
import type { IngestResult } from "@/lib/types";

type QueueItem = {
  name: string;
  size: number;
  status: "queued" | "uploading" | "processing" | "done" | "error";
};

function markQueue(items: QueueItem[], status: QueueItem["status"]) {
  return items.map((item) => ({ ...item, status }));
}

function markIngested(items: QueueItem[], results: IngestResult[]) {
  return items.map((item) => ({
    ...item,
    status: results.some((result) => result.fileName === item.name)
      ? "done"
      : item.status,
  }));
}

export default function IngestPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [results, setResults] = useState<IngestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateSelection(fileList: FileList | null) {
    const incoming = Array.from(fileList ?? []);
    setFiles(incoming);
    setQueue(
      incoming.map((file) => ({
        name: file.name,
        size: file.size,
        status: "queued",
      })),
    );
    setResults([]);
    setError(null);
  }

  async function ingest() {
    if (files.length === 0) {
      return;
    }

    setLoading(true);
    setQueue((current) => markQueue(current, "uploading"));
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      setQueue((current) => markQueue(current, "processing"));

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json()) as {
        results?: IngestResult[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Ingestion failed.");
      }

      const ingested = json.results ?? [];
      setResults(ingested);
      setQueue((current) => markIngested(current, ingested));
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected ingestion failure.";
      setError(message);
      setQueue((current) => markQueue(current, "error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(66,99,235,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(22,163,74,0.16),transparent_28%),linear-gradient(180deg,#f3efe8_0%,#ebe6dc_100%)] px-6 py-8 text-stone-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-4xl border border-stone-900/10 bg-white/70 p-6 shadow-[0_20px_60px_rgba(30,20,10,0.08)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">
              Ingestion surface
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-stone-950">
              Upload source files
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Stage documents locally, create Gemini embeddings, and upsert them
              to Pinecone. Videos are chunked before indexing.
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link
              className="rounded-full border border-stone-900/10 bg-white px-4 py-2.5"
              href="/"
            >
              Overview
            </Link>
            <Link
              className="rounded-full border border-stone-900/10 bg-stone-950 px-4 py-2.5 text-white"
              href="/chat"
            >
              Go to chat
            </Link>
          </nav>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <UploadDropzone onFiles={updateSelection} />
            <div className="rounded-[1.8rem] border border-stone-900/10 bg-white/75 p-6 shadow-[0_16px_44px_rgba(30,20,10,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-500">
                    Queue
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-stone-950">
                    Selected files
                  </h2>
                </div>
                <Button
                  onClick={() => void ingest()}
                  disabled={loading || files.length === 0}
                >
                  {loading ? "Processing..." : "Start ingestion"}
                </Button>
              </div>
              <UploadQueue items={queue} />
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[1.8rem] border border-stone-900/10 bg-stone-950 p-6 text-stone-100 shadow-[0_16px_44px_rgba(30,20,10,0.16)]">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-400">
                How it works
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                <li>Text files are chunked for retrieval quality.</li>
                <li>
                  Images get one native embedding and one generated description.
                </li>
                <li>
                  Videos are chunked under Gemini limits and indexed per
                  segment.
                </li>
              </ul>
            </div>

            <IngestStatus results={results} error={error} />
          </aside>
        </div>
      </div>
    </main>
  );
}
