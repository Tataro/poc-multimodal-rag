import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-stone-950 text-white hover:bg-stone-800",
        variant === "secondary" &&
          "border border-stone-900/10 bg-white text-stone-900 hover:bg-stone-50",
        variant === "ghost" && "text-stone-700 hover:bg-stone-900/5",
        className,
      )}
      {...props}
    />
  );
}
