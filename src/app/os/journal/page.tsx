"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react";
import { getJournalEntries, saveJournalEntry, uploadJournalPhoto, createBlankEntry, deleteJournalEntry } from "@/lib/actions/journal";
import Image from "next/image";
import ConfirmModal from "@/components/ConfirmModal";

type JournalEntry = { id: string; title: string; body: string; date: string; created_at: string; mood?: string; photoUrls?: string[] };

const MOODS = [
  { value: "happy", label: "Happy" },
  { value: "neutral", label: "Neutral" },
  { value: "focused", label: "Focused" },
  { value: "stressed", label: "Stressed" },
  { value: "tired", label: "Tired" },
  { value: "excited", label: "Excited" },
] as const;

export default function OSJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved">("Saved");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeEntryId) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", activeEntryId);
      
      await uploadJournalPhoto(formData);
      
      const data = await getJournalEntries();
      setEntries(data as JournalEntry[]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await getJournalEntries();
        setEntries(data as JournalEntry[]);
        if (data.length > 0) {
          setActiveEntryId(String(data[0].id));
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

  const handleMoodChange = async (mood: string) => {
    if (!activeEntry || !activeEntryId) return;
    const updatedEntry = { ...activeEntry, mood };
    setEntries(entries.map((e) => (e.id === activeEntryId ? updatedEntry : e)));
    setSaveStatus("Saving...");
    try {
      await saveJournalEntry(activeEntryId, {
        title: updatedEntry.title,
        body: updatedEntry.body,
        date: updatedEntry.date,
        mood,
      });
      setSaveStatus("Saved");
    } catch (e) {
      console.error(e);
      setSaveStatus("Unsaved");
    }
  };

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
          mood: updatedEntry.mood,
        });
        setSaveStatus("Saved");
      } catch (e) {
        console.error(e);
        setSaveStatus("Unsaved");
      }
    }, 1000);
  };

  const createNewEntry = async () => {
    try {
      setLoading(true);
      const newId = await createBlankEntry();
      const data = await getJournalEntries();
      setEntries(data as JournalEntry[]);
      setActiveEntryId(newId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntryClick = () => {
    if (!activeEntryId) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEntry = async () => {
    if (!activeEntryId) return;
    try {
      setLoading(true);
      await deleteJournalEntry(activeEntryId);
      const data = await getJournalEntries();
      setEntries(data as JournalEntry[]);
      if (data.length > 0) {
        setActiveEntryId(String(data[0].id));
      } else {
        setActiveEntryId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDeleteEntryClick}
                className="text-on-surface-variant hover:text-error transition-colors p-2"
                title="Delete Entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl w-full mx-auto px-10 pb-10 pt-4 flex flex-col flex-1">
            {/* Date Header */}
            <div className="font-mono text-xs text-primary-container tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Calendar className="w-4 h-4" />
              {new Date(activeEntry.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Mood */}
            <div className="mb-6">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleMoodChange(m.value)}
                    className={`px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider border transition-colors ${
                      activeEntry.mood === m.value
                        ? "bg-primary-container/20 border-primary-container text-primary-container"
                        : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary-container/50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
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

            {/* Daily Visuals */}
            <div className="mt-8 border-t border-surface-variant pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-primary font-bold">Daily Visuals</h3>
                <div className="relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  <button className="flex items-center gap-2 bg-surface-container-high hover:bg-primary-container/20 border border-outline-variant hover:border-primary-container transition-all px-4 py-2 rounded text-sm font-mono text-on-surface-variant hover:text-primary-container relative z-0">
                    <Plus className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Add Photo"}
                  </button>
                </div>
              </div>

              {activeEntry.photoUrls && activeEntry.photoUrls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeEntry.photoUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group">
                      <Image 
                        src={url} 
                        alt="Journal Photo" 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 border border-dashed border-outline-variant rounded-lg text-on-surface-variant font-mono text-sm bg-surface-container-lowest">
                  No visuals attached to this entry yet.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant font-mono">
          Select or create an entry to start writing.
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteEntry}
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
