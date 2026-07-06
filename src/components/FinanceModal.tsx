import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Tag, AlignLeft, DollarSign } from "lucide-react";

export type FinanceEntryData = {
  id: string;
  date: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  notes?: string;
};

type FinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FinanceEntryData>) => Promise<void>;
  initialData?: FinanceEntryData | null;
  mode: "create" | "edit";
};

export default function FinanceModal({ isOpen, onClose, onSave, initialData, mode }: FinanceModalProps) {
  const [formData, setFormData] = useState<Partial<FinanceEntryData>>({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: "",
    type: "expense",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          date: new Date().toISOString().split("T")[0],
          category: "",
          amount: "",
          type: "expense",
          notes: ""
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-low border border-surface-variant w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <h2 className="font-display font-bold text-lg text-primary">
            {mode === "create" ? "Log Transaction" : "Edit Transaction"}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="space-y-1">
            <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="date" 
                required
                value={formData.date || ""}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Type</label>
            <select 
              value={formData.type || "expense"}
              onChange={e => setFormData({...formData, type: e.target.value as "income" | "expense"})}
              className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none px-3 py-2 text-sm font-mono rounded text-on-surface"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                required
                placeholder="e.g. Groceries"
                value={formData.category || ""}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface uppercase placeholder:normal-case"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Notes (Optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Details..."
                value={formData.notes || ""}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-mono uppercase text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-mono uppercase bg-primary text-background rounded hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
