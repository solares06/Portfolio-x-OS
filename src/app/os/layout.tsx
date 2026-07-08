import Link from "next/link";
import React from "react";
import LogoutButton from "@/components/os/LogoutButton";

export default function OSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-os h-screen overflow-hidden bg-background text-foreground flex transition-colors">
      <aside className="w-64 border-r border-card-border bg-card p-6 flex flex-col space-y-4 shrink-0">
        <h2 className="font-display font-bold text-2xl text-primary mb-4">OS Dashboard</h2>
        <nav className="flex flex-col space-y-2 font-sans flex-1">
          <Link href="/" className="hover:text-primary transition-colors py-1">Dashboard</Link>
          <Link href="/journal" className="hover:text-primary transition-colors py-1">Journal</Link>
          <Link href="/gym" className="hover:text-primary transition-colors py-1">Gym</Link>
          <Link href="/study" className="hover:text-primary transition-colors py-1">Study</Link>
          <Link href="/extracurricular" className="hover:text-primary transition-colors py-1">Extracurricular</Link>
          <Link href="/projects" className="hover:text-primary transition-colors py-1">Projects</Link>
          <Link href="/finance" className="hover:text-primary transition-colors py-1">Finance</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
