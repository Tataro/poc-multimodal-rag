import { Badge } from "@/components/ui/badge";
import type { QueryMatch } from "@/lib/types";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  matches?: QueryMatch[];
};

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <article
          key={`${message.role}-${index}`}
          className={
            message.role === "assistant"
              ? "rounded-[1.8rem] border border-stone-900/10 bg-white/85 p-6"
              : "ml-auto max-w-2xl rounded-[1.8rem] bg-stone-950 p-5 text-white"
          }
        >
          <div className="mb-3 flex items-center gap-3">
            <Badge
              className={
                message.role === "assistant"
                  ? undefined
                  : "border-white/10 bg-white/10 text-white"
              }
            >
              {message.role === "assistant" ? "Assistant" : "You"}
            </Badge>
            {message.matches && message.matches.length > 0 ? (
              <span className="text-xs text-stone-500">
                {message.matches.length} sources
              </span>
            ) : null}
          </div>
          <p
            className={
              message.role === "assistant"
                ? "whitespace-pre-wrap text-sm leading-7 text-stone-700 sm:text-[15px]"
                : "whitespace-pre-wrap text-sm leading-7 text-white/90 sm:text-[15px]"
            }
          >
            {message.content}
          </p>
        </article>
      ))}
    </div>
  );
}
