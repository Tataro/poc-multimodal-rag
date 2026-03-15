import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-stone-900/10 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
