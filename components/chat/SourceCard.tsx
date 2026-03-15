import { FileText, ImageIcon, Film } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { QueryMatch } from "@/lib/types";

const icons = {
  text: FileText,
  image: ImageIcon,
  video: Film,
};

export function SourceCard({
  match,
  active,
  onClick,
}: Readonly<{ match: QueryMatch; active?: boolean; onClick?: () => void }>) {
  const Icon = icons[match.sourceType];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[1.4rem] border p-4 text-left transition duration-200",
        active
          ? "border-stone-950 bg-stone-950 text-white shadow-[0_18px_38px_rgba(20,13,8,0.22)]"
          : "border-stone-900/10 bg-white/80 text-stone-900 hover:-translate-y-0.5 hover:bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-2xl p-2.5",
              active ? "bg-white/10" : "bg-stone-100",
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{match.sourceFile}</p>
            <p
              className={cn(
                "mt-1 text-xs",
                active ? "text-stone-300" : "text-stone-500",
              )}
            >
              {match.sourceType}
            </p>
          </div>
        </div>
        <Badge
          className={
            active ? "border-white/15 bg-white/10 text-white" : undefined
          }
        >
          {Math.round(match.score * 100)}%
        </Badge>
      </div>
      <p
        className={cn(
          "mt-4 line-clamp-4 text-sm leading-6",
          active ? "text-stone-200" : "text-stone-600",
        )}
      >
        {match.chunkText ?? match.description ?? "Preview unavailable."}
      </p>
    </button>
  );
}
