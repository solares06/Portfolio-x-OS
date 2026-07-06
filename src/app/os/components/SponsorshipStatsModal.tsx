import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

type SponsorshipStatsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetAmount: number, activeLeads: number, conversionRate: string, eventReadiness: number) => Promise<void>;
  initialData?: { target_amount: number; active_leads: number; conversion_rate: string; event_readiness: number };
};

export default function SponsorshipStatsModal({ isOpen, onClose, onSave, initialData }: SponsorshipStatsModalProps) {
  const [targetAmount, setTargetAmount] = useState('');
  const [activeLeads, setActiveLeads] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [eventReadiness, setEventReadiness] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setTargetAmount(String(initialData.target_amount));
      setActiveLeads(String(initialData.active_leads));
      setConversionRate(initialData.conversion_rate);
      setEventReadiness(String(initialData.event_readiness));
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(
        parseInt(targetAmount) || 0,
        parseInt(activeLeads) || 0,
        conversionRate,
        parseInt(eventReadiness) || 0
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Sponsorship Telemetry">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Target Amount ($)
          </label>
          <input
            type="number"
            required
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Active Leads
          </label>
          <input
            type="number"
            required
            value={activeLeads}
            onChange={(e) => setActiveLeads(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Conversion Rate (e.g. 15%)
          </label>
          <input
            type="text"
            required
            value={conversionRate}
            onChange={(e) => setConversionRate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Event Readiness (%)
          </label>
          <input
            type="number"
            required
            min="0"
            max="100"
            value={eventReadiness}
            onChange={(e) => setEventReadiness(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
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
