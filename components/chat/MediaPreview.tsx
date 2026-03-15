import Image from "next/image";

import type { QueryMatch } from "@/lib/types";

export function MediaPreview({ match }: { match: QueryMatch | null }) {
  if (!match) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-stone-900/10 bg-white/60 p-6 text-sm text-stone-500">
        Select a retrieved source to inspect its preview.
      </div>
    );
  }

  if (match.sourceType === "image" && match.previewPath) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-stone-900/10 bg-white">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={match.previewPath}
            alt={match.sourceFile}
            fill
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  if (match.sourceType === "video" && match.mediaPath) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-stone-900/10 bg-black">
        <video
          controls
          preload="metadata"
          poster={match.previewPath}
          className="aspect-video w-full"
        >
          <source src={match.mediaPath} type={match.mimeType} />
        </video>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-stone-900/10 bg-white/80 p-6 text-sm leading-6 text-stone-600">
      {match.chunkText ?? match.description ?? "No preview available."}
    </div>
  );
}
