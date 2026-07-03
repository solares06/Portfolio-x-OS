import React from "react";
import { PublicNav } from "@/components/PublicNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-public min-h-screen bg-background text-foreground transition-colors">
      <PublicNav />
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
