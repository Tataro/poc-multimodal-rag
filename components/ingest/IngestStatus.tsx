import type { IngestResult } from "@/lib/types";

export function IngestStatus({
  results,
  error,
}: {
  results: IngestResult[];
  error?: string | null;
}) {
  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-stone-900/10 p-5 text-sm text-stone-500">
        Ingestion logs will appear here after upload.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.fileName}
          className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl font-semibold text-stone-950">
                {result.fileName}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                {result.sourceType} · {result.inserted} record(s)
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {result.logs.map((log, index) => (
              <p
                key={`${result.fileName}-${index}`}
                className="rounded-2xl bg-stone-50 px-3 py-2 text-sm text-stone-600"
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-stone-400">
                  {log.phase}
                </span>
                <span className="ml-3">{log.message}</span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
