"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import FinanceCategorySelect from "./FinanceCategorySelect";

export type RecurringData = {
  id?: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  recurrence: "daily" | "weekly" | "monthly" | "yearly";
  next_date: string;
  notes?: string;
};

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecurringData) => Promise<void>;
  initialData?: RecurringData | null;
}

export default function RecurringTransactionModal({ isOpen, onClose, onSave, initialData }: RecurringModalProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [nextDate, setNextDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setAmount(initialData.amount);
        setType(initialData.type);
        setRecurrence(initialData.recurrence);
        setNextDate(initialData.next_date);
        setNotes(initialData.notes || "");
      } else {
        setCategory("");
        setAmount("");
        setType("expense");
        setRecurrence("monthly");
        setNextDate(new Date().toISOString().split('T')[0]);
        setNotes("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !nextDate) return;

    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        category,
        amount,
        type,
        recurrence,
        next_date: nextDate,
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Recurring Transaction" : "New Recurring Transaction"}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as "income" | "expense")}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
              style={{ colorScheme: "var(--color-scheme)" }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as any)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
              style={{ colorScheme: "var(--color-scheme)" }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="z-40 relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Category
            </label>
            <FinanceCategorySelect
              type={type}
              value={category}
              onChange={(val) => setCategory(val)}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Amount
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
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Next Due Date
          </label>
          <input
            type="date"
            required
            value={nextDate}
            onChange={e => setNextDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            style={{ colorScheme: "var(--color-scheme)" }}
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none"
            placeholder="Additional info..."
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
