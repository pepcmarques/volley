"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }: {
  value: string; onValueChange: (value: string) => void; children: React.ReactNode;
}) {
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange}>{children}</SelectPrimitive.Root>;
}
export function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  return <SelectPrimitive.Trigger className={cn("flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200", className)}>{children}<SelectPrimitive.Icon><ChevronDown className="h-4 w-4 opacity-60" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}
export function SelectValue() { return <SelectPrimitive.Value />; }
export function SelectContent({ children }: { children: React.ReactNode }) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className="z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg" position="popper"><SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}
export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <SelectPrimitive.Item value={value} className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none data-[highlighted]:bg-slate-100"><span className="absolute left-2"><SelectPrimitive.ItemIndicator><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
