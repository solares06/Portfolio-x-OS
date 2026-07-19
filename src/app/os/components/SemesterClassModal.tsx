import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SubjectType } from '@/lib/mock-data';

const TYPE_OPTIONS: { value: SubjectType; label: string; color: string }[] = [
  { value: 'theory', label: 'Theory', color: 'var(--primary-fixed-dim)' },
  { value: 'lab', label: 'Lab', color: 'var(--secondary-container)' },
  { value: 'minor_project', label: 'Minor Project', color: 'var(--tertiary-container)' },
  { value: 'major_project', label: 'Major Project', color: '#f472b6' },
];

// Derive color from type
function colorFromType(type: SubjectType): string {
  switch (type) {
    case 'theory': return 'primary';
    case 'lab': return 'secondary';
    case 'minor_project': return 'tertiary';
    case 'major_project': return 'error';
    default: return 'primary';
  }
}

type SemesterClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: string, instructor: string, next_due: string, next_due_label: string, status: string, notes: string, color: string, type: SubjectType) => Promise<void>;
  initialData?: { subject: string; instructor: string; next_due: string; next_due_label: string; status: string; notes: string; color: string; type?: SubjectType };
};

export default function SemesterClassModal({ isOpen, onClose, onSave, initialData }: SemesterClassModalProps) {
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [nextDueLabel, setNextDueLabel] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<SubjectType>('theory');
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
        setType(initialData.type || 'theory');
      } else {
        setSubject('');
        setInstructor('');
        setNextDue('');
        setNextDueLabel('');
        setStatus('In Progress');
        setNotes('');
        setType('theory');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const color = colorFromType(type);
      await onSave(subject, instructor, nextDue, nextDueLabel, status, notes, color, type);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Subject" : "New Subject"}>
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
              placeholder="e.g. Data Structures"
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
              Subject Type
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-all ${
                    type === opt.value
                      ? 'border-primary-container bg-primary-container/20 text-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  {opt.label}
                </button>
              ))}
            </div>
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
