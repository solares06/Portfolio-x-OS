"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";

export type MeetingNoteData = {
  id?: string;
  title: string;
  date: string;
  content: string;
};

interface MeetingNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MeetingNoteData) => Promise<void>;
  initialData?: MeetingNoteData | null;
}

export default function MeetingNoteModal({ isOpen, onClose, onSave, initialData }: MeetingNoteModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDate(initialData.date);
        setContent(initialData.content);
      } else {
        setTitle("");
        setDate(new Date().toISOString().split('T')[0]);
        setContent("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        title,
        date,
        content
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Meeting Note" : "New Meeting Note"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Meeting Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            placeholder="e.g. Core Team Sync"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            style={{ colorScheme: "var(--color-scheme)" }}
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Notes Content
          </label>
          <textarea
            required
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none h-48 font-mono text-sm"
            placeholder="Action items, decisions..."
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
