import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, date: string, time: string | null, recurrence_rule: string | null) => Promise<void>;
  onDelete?: () => void;
  initialData?: { title: string; date: string; time: string | null; recurrence_rule?: string | null };
}

export function EventModal({ isOpen, onClose, onSave, onDelete, initialData }: EventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDate(initialData?.date || new Date().toISOString().split('T')[0]);
      setTime(initialData?.time || "");
      setRecurrenceRule(initialData?.recurrence_rule || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(title, date, time || null, recurrenceRule || null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Event" : "New Event"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-2">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Event Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Core Sync"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              style={{ colorScheme: "var(--color-scheme)" }}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Time (Optional)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              style={{ colorScheme: "var(--color-scheme)" }}
            />
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Repeat
          </label>
          <select
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            style={{ colorScheme: "var(--color-scheme)" }}
          >
            <option value="">Never</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div className="flex justify-between space-x-2 pt-2 items-center">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-error hover:bg-error/10 transition-colors rounded font-mono text-xs uppercase tracking-widest"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors font-mono text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-container/20 border border-primary-container text-primary hover:bg-primary-container hover:text-on-primary-container rounded transition-colors font-mono text-xs uppercase tracking-widest flex items-center justify-center min-w-[100px]"
            >
              {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : "Save Event"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
