"use client";

import { Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function Composer({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (question: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="rounded-[1.6rem] border border-stone-900/10 bg-white/80 p-3 shadow-[0_16px_40px_rgba(30,20,10,0.08)]"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!value.trim() || disabled) {
          return;
        }
        const current = value;
        setValue("");
        await onSubmit(current);
      }}
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask about system architecture, training material, or what appears in a screenshot or clip."
        rows={4}
        className="min-h-28 w-full resize-none border-0 bg-transparent px-3 py-3 text-sm leading-7 text-stone-800 outline-none placeholder:text-stone-400"
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-900/10 px-2 pt-3">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
          Cross-modal search enabled
        </p>
        <Button type="submit" disabled={disabled || !value.trim()}>
          {disabled ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <SendHorizonal className="mr-2 size-4" />
          )}
          Send
        </Button>
      </div>
    </form>
  );
}
