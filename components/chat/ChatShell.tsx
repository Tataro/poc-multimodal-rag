"use client";

import { useMemo, useState } from "react";

import { Composer } from "@/components/chat/Composer";
import { MediaPreview } from "@/components/chat/MediaPreview";
import { MessageList, type ChatMessage } from "@/components/chat/MessageList";
import { SourceCard } from "@/components/chat/SourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChatResponse, QueryMatch, SourceType } from "@/lib/types";

const filters: Array<{ label: string; value: SourceType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Text", value: "text" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
];

const starterQuestions = [
  "What does the system architecture describe?",
  "Summarize the training material across all modalities.",
  "Find anything that mentions form validation.",
];

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<QueryMatch[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SourceType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMatch = useMemo(
    () =>
      matches.find((match) => match.id === activeMatchId) ?? matches[0] ?? null,
    [activeMatchId, matches],
  );

  async function submitQuestion(question: string) {
    setLoading(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", content: question }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topK: 5, sourceType: filter }),
      });

      const json = (await response.json()) as ChatResponse & { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Chat request failed.");
      }

      setMatches(json.matches);
      setActiveMatchId(json.matches[0]?.id ?? null);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: json.answer, matches: json.matches },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unknown error.";
      setError(message);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Request failed: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_24rem]">
      <section className="space-y-6">
        <div className="rounded-[1.8rem] border border-stone-900/10 bg-white/75 p-6 shadow-[0_16px_44px_rgba(30,20,10,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Chat</Badge>
            <p className="text-sm text-stone-600">
              Use one query box for text, images, and video chunks.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item.value}
                variant={filter === item.value ? "primary" : "secondary"}
                className="px-3 py-2 text-xs uppercase tracking-[0.16em]"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {starterQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void submitQuestion(question)}
                className="rounded-full border border-stone-900/10 bg-stone-50 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[18rem] rounded-[1.8rem] border border-stone-900/10 bg-white/65 p-6 shadow-[0_16px_44px_rgba(30,20,10,0.08)]">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <h2 className="font-display text-3xl font-semibold text-stone-900">
                No conversation yet
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-stone-500">
                Start with a question. The app will embed your query with Gemini
                Embedding 2, search Pinecone, and answer from the retrieved
                evidence.
              </p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
        </div>

        <Composer disabled={loading} onSubmit={submitQuestion} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.8rem] border border-stone-900/10 bg-white/75 p-5 shadow-[0_16px_44px_rgba(30,20,10,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-500">
                Evidence
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-stone-950">
                Retrieved sources
              </h2>
            </div>
            <Badge>{matches.length}</Badge>
          </div>
          <div className="space-y-3">
            {matches.length === 0 ? (
              <p className="rounded-[1.3rem] border border-dashed border-stone-900/10 p-4 text-sm text-stone-500">
                Results will appear here after the first query.
              </p>
            ) : (
              matches.map((match) => (
                <SourceCard
                  key={match.id}
                  match={match}
                  active={match.id === activeMatch?.id}
                  onClick={() => setActiveMatchId(match.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-stone-900/10 bg-white/75 p-5 shadow-[0_16px_44px_rgba(30,20,10,0.08)]">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-500">
            Preview
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-stone-950">
            Selected source
          </h2>
          <div className="mt-4">
            <MediaPreview match={activeMatch} />
          </div>
        </div>
      </aside>
    </div>
  );
}
