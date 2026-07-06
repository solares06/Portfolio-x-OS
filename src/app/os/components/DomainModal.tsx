import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type DomainModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string, status_label: string) => Promise<void>;
  initialData?: { name: string; icon: string; status_label: string };
};

export default function DomainModal({ isOpen, onClose, onSave, initialData }: DomainModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('code');
  const [statusLabel, setStatusLabel] = useState('IDLE');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setIcon(initialData.icon);
        setStatusLabel(initialData.status_label);
      } else {
        setName('');
        setIcon('code');
        setStatusLabel('IDLE');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(name, icon, statusLabel);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Domain" : "New Domain"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Domain Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Artificial Intelligence"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Icon
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          >
            <option value="code">Code</option>
            <option value="brain">Brain</option>
            <option value="cpu">CPU</option>
            <option value="microscope">Microscope</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Status Label
          </label>
          <select
            value={statusLabel}
            onChange={(e) => setStatusLabel(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          >
            <option value="HEALTHY">HEALTHY</option>
            <option value="TRAINING">TRAINING</option>
            <option value="IDLE">IDLE</option>
          </select>
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
