"use client";

import React, { useState, useEffect } from "react";
import { getMediaEntries, createMediaEntry, updateMediaEntry, deleteMediaEntry } from "@/lib/actions/media";
import { Plus, Trash2, Edit2, Film, BookOpen, Star, Loader2, X } from "lucide-react";
import Image from "next/image";

type MediaEntry = {
  id: string;
  title: string;
  type: string;
  status: string;
  rating?: number | null;
  cover_url?: string | null;
};

export default function OSMediaPage() {
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [status, setStatus] = useState("watchlist");
  const [rating, setRating] = useState<number | "">("");
  const [coverUrl, setCoverUrl] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getMediaEntries();
      setEntries(data as MediaEntry[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleOpenModal = (entry?: MediaEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setTitle(entry.title);
      setType(entry.type);
      setStatus(entry.status);
      setRating(entry.rating ?? "");
      setCoverUrl(entry.cover_url || "");
    } else {
      setEditingEntry(null);
      setTitle("");
      setType("movie");
      setStatus("watchlist");
      setRating("");
      setCoverUrl("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        type,
        status,
        rating: rating === "" ? null : Number(rating),
        cover_url: coverUrl || null
      };

      if (editingEntry) {
        await updateMediaEntry(editingEntry.id, payload);
      } else {
        await createMediaEntry(payload);
      }
      handleCloseModal();
      loadEntries();
    } catch (err) {
      console.error(err);
      alert("Failed to save media entry");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this?")) {
      try {
        await deleteMediaEntry(id);
        loadEntries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full justify-center items-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden animate-in fade-in duration-500 relative z-10 p-6 custom-scrollbar overflow-y-auto">
      {/* Abstract Background */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="font-display text-3xl text-primary font-bold tracking-tight">Media Vault</h1>
          <p className="text-on-surface-variant text-sm mt-1">Books and movies tracking</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Media
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative z-10">
        {entries.map(entry => (
          <div key={entry.id} className="glass-panel border border-surface-variant rounded-xl overflow-hidden group flex flex-col cursor-pointer" onClick={() => handleOpenModal(entry)}>
            <div className="relative aspect-[2/3] w-full bg-surface-container-high">
              {entry.cover_url ? (
                <Image src={entry.cover_url} alt={entry.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-on-surface-variant opacity-50">
                  {entry.type === 'book' ? <BookOpen className="w-12 h-12" /> : <Film className="w-12 h-12" />}
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="bg-error/90 text-on-error p-1.5 rounded-full hover:bg-error transition-colors backdrop-blur-md"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="absolute top-2 left-2 z-10">
                <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded backdrop-blur-md tracking-wider shadow-sm ${
                  entry.status === 'watched' ? 'bg-primary/80 text-on-primary' :
                  entry.status === 'watching' ? 'bg-tertiary/80 text-on-tertiary' :
                  'bg-surface-variant/80 text-on-surface'
                }`}>
                  {entry.status}
                </span>
              </div>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-on-surface line-clamp-2">{entry.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-on-surface-variant flex items-center gap-1 opacity-60">
                  {entry.type === 'book' ? <BookOpen className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                </span>
                {entry.rating && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                    <span>{entry.rating}</span>
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-variant font-mono">
            No media entries found. Click 'Add Media' to start tracking.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md border border-outline-variant rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-surface-container bg-surface-container-low/50">
              <h2 className="font-display text-xl text-primary font-bold">{editingEntry ? "Edit Media" : "Add Media"}</h2>
              <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Title *</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:border-primary focus:outline-none"
                  placeholder="e.g. Dune"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:border-primary focus:outline-none appearance-none"
                  >
                    <option value="movie">Movie</option>
                    <option value="book">Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:border-primary focus:outline-none appearance-none"
                  >
                    <option value="watched">Watched/Read</option>
                    <option value="watching">Watching/Reading</option>
                    <option value="watchlist">Watchlist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Rating (1-5)</label>
                <input 
                  type="number" 
                  min="1" max="5" step="0.5"
                  value={rating} 
                  onChange={e => setRating(e.target.value === "" ? "" : Number(e.target.value))} 
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:border-primary focus:outline-none"
                  placeholder="e.g. 4.5"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Cover URL</label>
                <input 
                  type="url" 
                  value={coverUrl} 
                  onChange={e => setCoverUrl(e.target.value)} 
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-mono uppercase rounded text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-mono uppercase tracking-wider rounded bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
