import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type TeamMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, role: string, avatar_url?: string) => Promise<void>;
  initialData?: { name: string; role: string; avatar_url?: string };
};

export default function TeamMemberModal({ isOpen, onClose, onSave, initialData }: TeamMemberModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setRole(initialData.role);
        setAvatarUrl(initialData.avatar_url || '');
      } else {
        setName('');
        setRole('');
        setAvatarUrl('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(name, role, avatarUrl || undefined);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Operative" : "Add Operative"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Role
          </label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Lead Developer"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Avatar URL (Optional)
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="https://example.com/avatar.jpg"
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
