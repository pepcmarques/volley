import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" };
export function Button({ className, variant = "default", ...props }: Props) {
  const styles = {
    default: "bg-slate-900 text-white hover:bg-slate-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-50",
    ghost: "hover:bg-slate-100",
  };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50", styles[variant], className)} {...props} />;
}
