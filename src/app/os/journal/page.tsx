"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  Calendar,
  Plus,
} from "lucide-react";
import { getJournalEntries, saveJournalEntry } from "@/lib/actions/journal";

type JournalEntry = { id: string; title: string; body: string; date: string; created_at: string; mood?: string };

export default function OSJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // For auto-saving
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved">("Saved");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await getJournalEntries();
        setEntries(data);
        if (data.length > 0) {
          setActiveEntryId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  const activeEntry = entries.find((e) => e.id === activeEntryId);

  const handleEntryUpdate = (field: "title" | "body", value: string) => {
    if (!activeEntry) return;

    // Optimistically update UI
    const updatedEntry = { ...activeEntry, [field]: value };
    setEntries(entries.map(e => e.id === activeEntryId ? updatedEntry : e));
    setSaveStatus("Unsaved");

    // Debounce save
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("Saving...");
      try {
        await saveJournalEntry(activeEntryId, {
          title: updatedEntry.title,
          body: updatedEntry.body,
          date: updatedEntry.date,
        });
        setSaveStatus("Saved");
      } catch (e) {
        console.error(e);
        setSaveStatus("Unsaved");
      }
    }, 1000);
  };

  const createNewEntry = () => {
    const newEntry = {
      id: "temp-" + Date.now(),
      title: "",
      body: "",
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    
    setEntries([newEntry, ...entries]);
    setActiveEntryId(newEntry.id);
    
    // We don't save immediately to DB until they type something
    // Or we could trigger a save here if we wanted an empty row
  };

  if (loading) {
    return (
      <div className="flex h-full w-full justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full relative z-10 bg-background overflow-hidden animate-in fade-in duration-500">
      {/* Abstract Background Glow */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_top_right,rgba(0,242,255,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>

      {/* Sub-sidebar: History & Navigation */}
      <aside className="w-[320px] glass-panel border-r border-outline-variant flex flex-col h-full z-10 relative shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <h2 className="font-display text-xl text-primary font-bold tracking-tight">Timeline</h2>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <button className="hover:text-primary-container transition-colors" onClick={createNewEntry}>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="text-on-surface-variant p-4 text-center text-sm font-mono">No journal entries found.</div>
          ) : entries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            const dateObj = new Date(entry.date);
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            
            return (
              <div
                key={entry.id}
                onClick={() => setActiveEntryId(entry.id)}
                className={`p-2 rounded border cursor-pointer transition-colors group ${
                  isActive
                    ? "bg-surface-container border-outline-variant border-l-2 border-l-primary-container"
                    : "border-transparent hover:border-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs uppercase ${
                      isActive ? "text-primary-container" : "text-on-surface-variant"
                    }`}
                  >
                    {dateStr}
                  </span>
                  {entry.mood && (
                    <span className="text-xs uppercase bg-surface-variant px-1 rounded text-on-surface">
                      {entry.mood}
                    </span>
                  )}
                </div>
                <h3
                  className={`font-bold text-base truncate ${
                    isActive ? "text-primary" : "text-on-surface"
                  }`}
                >
                  {entry.title || "Untitled Entry"}
                </h3>
                <p className="text-sm text-on-surface-variant truncate mt-1">
                  {entry.body ? entry.body.substring(0, 50).replace(/<[^>]*>?/gm, '') + "..." : "No content yet"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Global Search / Filter */}
        <div className="p-4 border-t border-surface-container mt-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary-container transition-colors" />
            <input
              type="text"
              className="w-full bg-surface-container-lowest border-b border-outline-variant focus:border-primary-container focus:outline-none focus:ring-0 pl-10 pr-4 py-2 font-mono text-sm text-primary transition-colors placeholder:text-outline bg-transparent"
              placeholder="Query timeline..."
            />
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary-container transition-all duration-300 group-focus-within:w-full neon-glow"></div>
          </div>
        </div>
      </aside>

      {/* Editor Canvas */}
      {activeEntry ? (
        <section className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 custom-scrollbar">
          {/* Top Actions */}
          <div className="sticky top-0 w-full flex justify-end items-center p-4 gap-4 bg-gradient-to-b from-background to-transparent z-20">
            <div className="flex items-center gap-2 bg-surface-container-low border border-surface-variant rounded-full px-3 py-1.5 backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-amber-400 animate-pulse" : saveStatus === "Unsaved" ? "bg-red-500" : "bg-primary-container"} neon-glow`}></span>
              <span className="font-mono text-xs uppercase text-on-surface-variant">
                {saveStatus}
              </span>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-4xl w-full mx-auto px-10 pb-10 pt-4 flex flex-col flex-1">
            {/* Date Header */}
            <div className="font-mono text-xs text-primary-container tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Calendar className="w-4 h-4" />
              {new Date(activeEntry.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Title */}
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 m-0 font-display text-5xl text-primary placeholder:text-surface-variant font-bold tracking-tight mb-8"
              placeholder="Entry Title..."
              value={activeEntry.title || ""}
              onChange={(e) => handleEntryUpdate("title", e.target.value)}
            />

            {/* Rich Text Area */}
            <textarea
              className="flex-1 w-full bg-transparent border-none outline-none focus:ring-0 p-0 m-0 text-base text-on-surface leading-relaxed resize-none min-h-[300px]"
              placeholder="Start typing your entry here..."
              value={activeEntry.body || ""}
              onChange={(e) => handleEntryUpdate("body", e.target.value)}
            />
          </div>
        </section>
      ) : (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant font-mono">
          Select or create an entry to start writing.
        </div>
      )}
    </div>
  );
}
