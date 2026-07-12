"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";

export type BudgetData = {
  id?: string;
  category: string;
  amount: string;
};

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BudgetData) => Promise<void>;
  initialData?: BudgetData | null;
}

export default function BudgetModal({ isOpen, onClose, onSave, initialData }: BudgetModalProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setAmount(initialData.amount);
      } else {
        setCategory("");
        setAmount("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        category,
        amount
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Budget" : "New Budget"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Category
          </label>
          <input
            type="text"
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            placeholder="e.g. Food, Transport"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Monthly Limit
          </label>
          <input
            type="number"
            required
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            placeholder="0.00"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Saving..." : "Save Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
