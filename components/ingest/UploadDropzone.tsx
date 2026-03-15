"use client";

import { UploadCloud } from "lucide-react";
import { useRef } from "react";

export function UploadDropzone({
  onFiles,
}: {
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="rounded-[1.8rem] border border-dashed border-stone-900/20 bg-white/60 p-8 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <div className="rounded-full bg-stone-950 p-4 text-white">
          <UploadCloud className="size-6" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold text-stone-950">
            Drop files to ingest
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            Supported for phase one: markdown, plain text, PNG, JPEG, MP4, and
            MOV.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".md,.txt,.png,.jpg,.jpeg,.mp4,.mov"
          className="hidden"
          onChange={(event) => onFiles(event.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
        >
          Browse files
        </button>
      </div>
    </div>
  );
}
