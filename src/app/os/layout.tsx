import { headers } from "next/headers";
import Link from "next/link";
import React from "react";
import LogoutButton from "@/components/os/LogoutButton";
import TopBar from "@/components/os/TopBar";
import CommandPalette from "@/components/CommandPalette";
import { ThemeProvider } from "@/components/os/ThemeProvider";
import ThemeToggle from "@/components/os/ThemeToggle";

export const dynamic = 'force-dynamic';

export default function OSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = headers().get("host") || "";
  const isOSSubdomain = host.startsWith("os.");
  const prefix = isOSSubdomain ? "" : "/os";

  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden bg-background text-foreground flex transition-colors">
        <CommandPalette />
      <aside className="w-64 border-r border-card-border bg-card p-6 flex flex-col space-y-4 shrink-0">
        <h2 className="font-display font-bold text-2xl text-primary mb-4">OS Dashboard</h2>
        <nav className="flex flex-col space-y-2 font-sans flex-1">
          <Link href={`${prefix}/`} className="hover:text-primary transition-colors py-1">Dashboard</Link>
          <Link href={`${prefix}/journal`} className="hover:text-primary transition-colors py-1">Journal</Link>
          <Link href={`${prefix}/gym`} className="hover:text-primary transition-colors py-1">Gym</Link>
          <Link href={`${prefix}/study`} className="hover:text-primary transition-colors py-1">Study</Link>
          <Link href={`${prefix}/extracurricular`} className="hover:text-primary transition-colors py-1">Extracurricular</Link>
          <Link href={`${prefix}/finance`} className="hover:text-primary transition-colors py-1">Finance</Link>
          <Link href={`${prefix}/media`} className="hover:text-primary transition-colors py-1">Media</Link>
          <Link href="/" className="hover:text-primary transition-colors py-1">Public Portfolio</Link>
        </nav>
        <div className="flex items-center justify-between mt-4">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>
      </div>
    </ThemeProvider>
  );
}
