import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type BodyMetricsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    weight_value: number, weight_unit: string, weight_delta: string,
    body_fat_value: number, body_fat_unit: string, body_fat_delta: string, body_fat_progress: number
  ) => Promise<void>;
  initialData?: {
    weight_value: number; weight_unit: string; weight_delta: string;
    body_fat_value: number; body_fat_unit: string; body_fat_delta: string; body_fat_progress: number;
  };
};

export default function BodyMetricsModal({ isOpen, onClose, onSave, initialData }: BodyMetricsModalProps) {
  const [weightValue, setWeightValue] = useState(0);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightDelta, setWeightDelta] = useState('+0kg');
  
  const [bodyFatValue, setBodyFatValue] = useState(0);
  const [bodyFatUnit, setBodyFatUnit] = useState('%');
  const [bodyFatDelta, setBodyFatDelta] = useState('0%');
  const [bodyFatProgress, setBodyFatProgress] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setWeightValue(initialData.weight_value);
        setWeightUnit(initialData.weight_unit);
        setWeightDelta(initialData.weight_delta);
        
        setBodyFatValue(initialData.body_fat_value);
        setBodyFatUnit(initialData.body_fat_unit);
        setBodyFatDelta(initialData.body_fat_delta);
        setBodyFatProgress(initialData.body_fat_progress);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(
        weightValue, weightUnit, weightDelta,
        bodyFatValue, bodyFatUnit, bodyFatDelta, bodyFatProgress
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Body Metrics">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <h4 className="font-display text-sm text-primary-container border-b border-card-border pb-1 mb-2">Weight</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Value</label>
            <input type="number" step="0.1" required value={weightValue} onChange={e => setWeightValue(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Unit</label>
            <input type="text" required value={weightUnit} onChange={e => setWeightUnit(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Delta</label>
            <input type="text" required value={weightDelta} onChange={e => setWeightDelta(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="+1.2kg" />
          </div>
        </div>

        <h4 className="font-display text-sm text-primary-container border-b border-card-border pb-1 mb-2 mt-4">Body Fat</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Value</label>
            <input type="number" step="0.1" required value={bodyFatValue} onChange={e => setBodyFatValue(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Unit</label>
            <input type="text" required value={bodyFatUnit} onChange={e => setBodyFatUnit(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Delta</label>
            <input type="text" required value={bodyFatDelta} onChange={e => setBodyFatDelta(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" placeholder="-0.5%" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Progress (0-100)</label>
            <input type="number" step="1" required value={bodyFatProgress} onChange={e => setBodyFatProgress(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 outline-none" />
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
