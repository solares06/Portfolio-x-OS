import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, dueDate: string | null) => Promise<void>;
  initialData?: { title: string; dueDate: string | null };
}

export function TaskModal({ isOpen, onClose, onSave, initialData }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDueDate(initialData?.dueDate || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(title, dueDate || null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Task" : "New Task"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-2">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Task Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Complete quarterly report"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            style={{ colorScheme: "var(--color-scheme)" }}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
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
            {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : "Save Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
