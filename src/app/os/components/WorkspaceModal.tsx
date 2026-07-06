import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, icon: string, progress?: number, leetcode_count?: number) => Promise<void>;
  initialData?: { title: string; icon: string; progress?: number; leetcode_count?: number };
};

export default function WorkspaceModal({ isOpen, onClose, onSave, initialData }: WorkspaceModalProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('data_object');
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [leetcodeCount, setLeetcodeCount] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setIcon(initialData.icon);
        setProgress(initialData.progress);
        setLeetcodeCount(initialData.leetcode_count);
      } else {
        setTitle('');
        setIcon('data_object');
        setProgress(undefined);
        setLeetcodeCount(undefined);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(title, icon, progress, leetcodeCount);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Workspace" : "New Workspace"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Workspace Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
            placeholder="e.g. Distributed Systems"
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
            <option value="data_object">Database / Data Object</option>
            <option value="memory">CPU / Memory</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Progress (%) (Optional)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress === undefined ? '' : progress}
              onChange={(e) => setProgress(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. 45"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              LeetCode Count (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={leetcodeCount === undefined ? '' : leetcodeCount}
              onChange={(e) => setLeetcodeCount(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="e.g. 150"
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
