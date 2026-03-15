import Link from "next/link";

import { ChatShell } from "@/components/chat/ChatShell";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,160,81,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(66,99,235,0.14),_transparent_30%),linear-gradient(180deg,_#f6f1e9_0%,_#efe6d9_100%)] px-6 py-8 text-stone-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-stone-900/10 bg-white/70 p-6 shadow-[0_20px_60px_rgba(30,20,10,0.08)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">
              Query surface
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-stone-950">
              Multimodal chat
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Ask one question across text chunks, images, and video segments
              indexed by Gemini Embedding 2 and stored in Pinecone.
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
              href="/ingest"
            >
              Go to ingest
            </Link>
          </nav>
        </header>

        <ChatShell />
      </div>
    </main>
  );
}
