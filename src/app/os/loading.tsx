import React from "react";
import { Loader2 } from "lucide-react";

export default function OSLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-300">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <h2 className="font-display text-xl font-bold text-on-surface">Initializing Module...</h2>
      <p className="text-sm text-on-surface-variant mt-2 font-mono">Establishing secure link</p>
    </div>
  );
}
