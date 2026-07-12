"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";

export type SponsorData = {
  id?: string;
  company: string;
  status: "Lead" | "Contacted" | "Negotiating" | "Secured" | "Rejected";
  amount?: string;
  notes?: string;
};

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SponsorData) => Promise<void>;
  initialData?: SponsorData | null;
}

export default function SponsorModal({ isOpen, onClose, onSave, initialData }: SponsorModalProps) {
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<SponsorData["status"]>("Lead");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCompany(initialData.company);
        setStatus(initialData.status);
        setAmount(initialData.amount || "");
        setNotes(initialData.notes || "");
      } else {
        setCompany("");
        setStatus("Lead");
        setAmount("");
        setNotes("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        company,
        status,
        amount,
        notes
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Sponsor" : "New Sponsor"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Company Name
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as SponsorData["status"])}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none [color-scheme:dark]"
            >
              <option value="Lead">Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Negotiating">Negotiating</option>
              <option value="Secured">Secured</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Expected Amount ($)
            </label>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
              placeholder="e.g. 5000"
            />
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none h-24"
            placeholder="Key contacts, next steps..."
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Saving..." : "Save Sponsor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
