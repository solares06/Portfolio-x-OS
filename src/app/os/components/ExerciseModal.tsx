import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type ExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order_index: string, name: string, target: string, is_faded: boolean) => Promise<void>;
  initialData?: {
    order_index: string;
    name: string;
    target: string;
    is_faded: boolean;
  };
};

export default function ExerciseModal({ isOpen, onClose, onSave, initialData }: ExerciseModalProps) {
  const [order, setOrder] = useState('01');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [isFaded, setIsFaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setOrder(initialData.order_index);
        setName(initialData.name);
        setTarget(initialData.target);
        setIsFaded(initialData.is_faded);
      } else {
        setOrder('01');
        setName('');
        setTarget('');
        setIsFaded(false);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(order, name, target, isFaded);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Exercise" : "Add Exercise"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Order</label>
            <input type="text" required value={order} onChange={e => setOrder(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="01" />
          </div>
          <div className="col-span-3">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Exercise Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="e.g. Bench Press" />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Target Muscle(s)</label>
          <input type="text" required value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="e.g. Chest, Triceps" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_faded" checked={isFaded} onChange={e => setIsFaded(e.target.checked)} className="accent-primary-container" />
          <label htmlFor="is_faded" className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Mark as Faded (Completed/Skipped)</label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-xs uppercase text-on-surface-variant hover:text-on-surface transition-colors" disabled={isSaving}>Cancel</button>
          <button type="submit" className="px-4 py-2 font-mono text-xs uppercase bg-primary-container text-on-primary-container rounded hover:brightness-110 transition-all disabled:opacity-50" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
