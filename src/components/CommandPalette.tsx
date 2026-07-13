"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter, usePathname } from "next/navigation";
import { Search, Download, Terminal, Calculator, Folder, FileText, Activity, Users, Settings } from "lucide-react";
import { globalSearch, SearchResult } from "@/lib/actions/search";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const prefix = pathname.startsWith("/os") ? "/os" : "";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await globalSearch(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  const handleExport = () => {
    window.location.href = "/api/export";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative w-full max-w-2xl bg-surface-container border border-outline-variant rounded-xl shadow-2xl overflow-hidden text-on-surface"
        shouldFilter={false} // We do filtering on server or custom logic for static
      >
        <div className="flex items-center border-b border-outline-variant px-4">
          <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
          <Command.Input 
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Search OS or type a command..." 
            className="w-full bg-transparent border-none text-base focus:ring-0 p-4 outline-none placeholder:text-on-surface-variant text-on-surface"
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-6 text-center text-sm text-on-surface-variant font-mono">
            {loading ? "Searching databanks..." : "No results found."}
          </Command.Empty>

          {/* Database Search Results */}
          {results.length > 0 && (
            <Command.Group heading="Search Results" className="text-[10px] uppercase tracking-widest text-on-surface-variant p-2 font-bold font-mono">
              {results.map((result) => (
                <Command.Item 
                  key={result.id} 
                  onSelect={() => runCommand(() => router.push(`${prefix}${result.href === '/' ? '' : result.href}` || '/'))}
                  className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant transition-colors"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-body text-sm font-medium text-on-surface">{result.title}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">{result.type} • {result.subtitle}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Static Commands */}
          {!query && (
            <>
              <Command.Group heading="Navigation" className="text-[10px] uppercase tracking-widest text-on-surface-variant p-2 font-bold font-mono">
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Terminal className="w-4 h-4 text-on-surface-variant" /> Go to Dashboard
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/finance`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Calculator className="w-4 h-4 text-on-surface-variant" /> Go to Finance
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/gym`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Activity className="w-4 h-4 text-on-surface-variant" /> Go to Gym
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/study`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Folder className="w-4 h-4 text-on-surface-variant" /> Go to Study Nexus
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/extracurricular`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Users className="w-4 h-4 text-on-surface-variant" /> Go to E-Cell
                </Command.Item>
              </Command.Group>

              <Command.Group heading="System Actions" className="text-[10px] uppercase tracking-widest text-on-surface-variant p-2 mt-2 font-bold font-mono border-t border-outline-variant">
                <Command.Item onSelect={() => runCommand(handleExport)} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Download className="w-4 h-4 text-primary" /> Export OS Data Backup
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push(`${prefix}/settings`))} className="flex items-center gap-2 p-2 mt-1 rounded cursor-pointer hover:bg-surface-variant data-[selected=true]:bg-surface-variant text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4 text-on-surface-variant" /> OS Settings
                </Command.Item>
              </Command.Group>
            </>
          )}
        </Command.List>
        <div className="bg-surface-container-high border-t border-outline-variant p-2 flex justify-between items-center text-xs font-mono text-on-surface-variant">
          <span>Search global modules or execute actions</span>
          <div className="flex gap-2">
            <span><kbd className="bg-surface-container-highest px-1 py-0.5 rounded border border-outline-variant">esc</kbd> close</span>
          </div>
        </div>
      </Command>
      
      {/* Global CSS for cmdk specific styles if needed */}
      <style jsx global>{`
        [cmdk-group-heading] {
          padding: 8px;
          color: var(--on-surface-variant);
          font-family: monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
