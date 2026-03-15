type QueueItem = {
  name: string;
  size: number;
  status: "queued" | "uploading" | "processing" | "done" | "error";
};

export function UploadQueue({ items }: { items: QueueItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[1.5rem] border border-dashed border-stone-900/10 p-5 text-sm text-stone-500">
        Selected files will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between rounded-[1.4rem] border border-stone-900/10 bg-white/75 px-4 py-3"
        >
          <div>
            <p className="font-medium text-stone-900">{item.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
              {(item.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-600">
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
