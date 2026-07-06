import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type SemesterClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: string, instructor: string, next_due: string, next_due_label: string, status: string, notes: string, color: string) => Promise<void>;
  initialData?: { subject: string; instructor: string; next_due: string; next_due_label: string; status: string; notes: string; color: string };
};

export default function SemesterClassModal({ isOpen, onClose, onSave, initialData }: SemesterClassModalProps) {
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [nextDueLabel, setNextDueLabel] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('primary');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSubject(initialData.subject);
        setInstructor(initialData.instructor);
        setNextDue(initialData.next_due);
        setNextDueLabel(initialData.next_due_label);
        setStatus(initialData.status);
        setNotes(initialData.notes);
        setColor(initialData.color);
      } else {
        setSubject('');
        setInstructor('');
        setNextDue('');
        setNextDueLabel('');
        setStatus('In Progress');
        setNotes('');
        setColor('primary');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(subject, instructor, nextDue, nextDueLabel, status, notes, color);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Class" : "New Class"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. CS410"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Instructor
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. Dr. Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Next Due Date
            </label>
            <input
              type="text"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. Oct 24"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Due Label
            </label>
            <input
              type="text"
              value={nextDueLabel}
              onChange={(e) => setNextDueLabel(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. Midterm Exam"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            >
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Color Label
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            >
              <option value="primary">Primary (Cyan)</option>
              <option value="secondary">Secondary (Purple)</option>
              <option value="error">Error (Red)</option>
              <option value="tertiary">Tertiary (Yellow)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-none h-16"
            placeholder="e.g. Read chapters 4 and 5"
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
