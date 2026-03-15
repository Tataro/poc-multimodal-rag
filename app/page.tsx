import Link from "next/link";
import { ArrowRight, DatabaseZap, Sparkles, Upload } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,160,81,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(67,97,238,0.18),transparent_34%),linear-gradient(180deg,#f7f1e8_0%,#f4efe8_45%,#efe8dd_100%)] px-6 py-8 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col rounded-4xl border border-stone-900/10 bg-white/70 p-8 shadow-[0_24px_80px_rgba(30,20,10,0.12)] backdrop-blur xl:p-12">
        <header className="flex flex-col gap-6 border-b border-stone-900/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-stone-50 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-stone-600">
              <Sparkles className="size-3.5" />
              Gemini Embedding 2 + Pinecone
            </div>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-balance text-stone-950 sm:text-6xl">
              Multimodal retrieval with a product-grade interface.
            </h1>
            <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Ingest text, images, and video into one embedding space, query
              them from one chat surface, and inspect the evidence without
              dropping into an admin panel.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-stone-600 sm:grid-cols-3 lg:w-104">
            <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                Embeddings
              </p>
              <p className="mt-2 font-display text-lg font-medium text-stone-900">
                Native multimodal
              </p>
            </div>
            <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                Vector DB
              </p>
              <p className="mt-2 font-display text-lg font-medium text-stone-900">
                Pinecone
              </p>
            </div>
            <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                Frontend
              </p>
              <p className="mt-2 font-display text-lg font-medium text-stone-900">
                Next.js
              </p>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-stone-900/10 bg-stone-950 p-7 text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-stone-400">
              <DatabaseZap className="size-4" />
              Retrieval flow
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                [
                  "1",
                  "Upload",
                  "Text, image, and video land in local storage with metadata for previews.",
                ],
                [
                  "2",
                  "Embed",
                  "Gemini Embedding 2 projects all modalities into one normalized 1536-d space.",
                ],
                [
                  "3",
                  "Answer",
                  "Pinecone returns nearest context, then Gemini writes the response with sources.",
                ],
              ].map(([step, title, body]) => (
                <div
                  key={step}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="font-mono text-xs text-orange-300">
                    STEP {step}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-medium">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-300">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/chat"
              className="group rounded-[1.75rem] border border-stone-900/10 bg-[linear-gradient(135deg,#ffedd5_0%,#fff_55%,#fee2e2_100%)] p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                    Chat
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-stone-950">
                    Query the corpus
                  </h2>
                </div>
                <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-600">
                Ask cross-modal questions, filter by media type, and inspect the
                retrieved evidence panel without leaving the thread.
              </p>
            </Link>

            <Link
              href="/ingest"
              className="group flex-1 rounded-[1.75rem] border border-stone-900/10 bg-[linear-gradient(135deg,#dbeafe_0%,#f8fafc_55%,#d1fae5_100%)] p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                    Ingest
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-stone-950">
                    Load source files
                  </h2>
                </div>
                <Upload className="size-6 transition-transform group-hover:-translate-y-1" />
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-600">
                Drop text, image, or video assets into the system, chunk long
                videos with ffmpeg, and stage everything for retrieval.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
