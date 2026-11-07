import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", ...props }: React.ComponentProps<"span"> & { variant?: "default" | "amber" | "success" | "muted" | "destructive" | "outline" }) {
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    amber: "bg-amber text-amber-foreground",
    success: "bg-success text-success-foreground",
    muted: "bg-muted text-muted-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border text-foreground",
  };
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
