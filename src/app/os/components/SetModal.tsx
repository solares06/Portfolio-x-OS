import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type SetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order_index: number, label: string, details: string, is_active: boolean, is_faded: boolean) => Promise<void>;
  initialData?: {
    order_index: number;
    label: string;
    details: string;
    is_active: boolean;
    is_faded: boolean;
  };
};

export default function SetModal({ isOpen, onClose, onSave, initialData }: SetModalProps) {
  const [order, setOrder] = useState(1);
  const [label, setLabel] = useState('');
  const [details, setDetails] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFaded, setIsFaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setOrder(initialData.order_index);
        setLabel(initialData.label);
        setDetails(initialData.details);
        setIsActive(initialData.is_active);
        setIsFaded(initialData.is_faded);
      } else {
        setOrder(1);
        setLabel('');
        setDetails('');
        setIsActive(false);
        setIsFaded(false);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(order, label, details, isActive, isFaded);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Set" : "Add Set"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Order</label>
            <input type="number" required value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
          </div>
          <div className="col-span-3">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Label</label>
            <input type="text" required value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="e.g. 1st Set" />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Details (Weight x Reps)</label>
          <input type="text" required value={details} onChange={e => setDetails(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="e.g. 100kg x 12" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active_set" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-primary-container" />
            <label htmlFor="is_active_set" className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Active Set</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_faded_set" checked={isFaded} onChange={e => setIsFaded(e.target.checked)} className="accent-primary-container" />
            <label htmlFor="is_faded_set" className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Faded (Skipped)</label>
          </div>
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
