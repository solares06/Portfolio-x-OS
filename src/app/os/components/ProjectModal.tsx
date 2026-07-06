import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ProjectDomain } from '@/lib/mock-data';

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain_id: string, title: string, description: string, status: string, progress: number) => Promise<void>;
  domains: ProjectDomain[];
  initialData?: { domain_id: string; title: string; description: string; status: string; progress: number };
};

export default function ProjectModal({ isOpen, onClose, onSave, domains, initialData }: ProjectModalProps) {
  const [domainId, setDomainId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDomainId(initialData.domain_id);
        setTitle(initialData.title);
        setDescription(initialData.description);
        setStatus(initialData.status);
        setProgress(initialData.progress);
      } else {
        setDomainId(domains[0]?.id || '');
        setTitle('');
        setDescription('');
        setStatus('active');
        setProgress(0);
      }
    }
  }, [isOpen, initialData, domains]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(domainId, title, description, status, progress);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Project" : "New Project"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Domain
          </label>
          <select
            required
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          >
            {domains.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
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
            placeholder="e.g. Neon OS Redesign"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Description
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-none h-20"
            placeholder="e.g. Build an immersive web interface"
          />
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
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
              <option value="idle">Idle</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Progress (%)
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
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
