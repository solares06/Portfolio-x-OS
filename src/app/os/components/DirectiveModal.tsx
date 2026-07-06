import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type DirectiveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: string, title: string, detail: string, due_label: string) => Promise<void>;
  initialData?: { type: string; title: string; detail: string; due_label: string };
};

export default function DirectiveModal({ isOpen, onClose, onSave, initialData }: DirectiveModalProps) {
  const [type, setType] = useState('goal');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dueLabel, setDueLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type.toLowerCase());
        setTitle(initialData.title);
        setDetail(initialData.detail || '');
        setDueLabel(initialData.due_label || '');
      } else {
        setType('goal');
        setTitle('');
        setDetail('');
        setDueLabel('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(type, title, detail, dueLabel);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Directive" : "New Directive"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Directive Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          >
            <option value="goal">Goal</option>
            <option value="deadline">Deadline</option>
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Finalize Pitch Deck"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Detail (Optional)
          </label>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Include metrics"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Due Label / Time (Optional)
          </label>
          <input
            type="text"
            value={dueLabel}
            onChange={(e) => setDueLabel(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. 14:00 or DUE MAR 15"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs uppercase text-on-surface-variant hover:text-on-surface transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 font-mono text-xs uppercase bg-primary-container text-on-primary-container rounded hover:brightness-110 transition-all disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
