"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";
import { getFinanceCategories, createFinanceCategory, deleteFinanceCategory } from "@/lib/actions/finance";

type FinanceCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  type: "income" | "expense";
};

export default function FinanceCategorySelect({ value, onChange, type }: Props) {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getFinanceCategories();
      setCategories(data as FinanceCategory[]);
    } catch (e) {
      console.error(e);
    }
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  // If there's no matching category in DB but we have a value, just render it.
  const displayValue = value || "Select category...";

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      const newCat = await createFinanceCategory(newCategoryName.trim(), type);
      await loadCategories();
      onChange(newCat.name);
      setNewCategoryName("");
      setIsOpen(false);
    } catch (e) {
      console.error("Failed to create category", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteFinanceCategory(id);
      await loadCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-full bg-surface-container-low border border-surface-variant p-2 rounded text-on-surface font-mono text-sm cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-container-high border border-surface-variant rounded shadow-lg overflow-hidden flex flex-col max-h-64">
          <div className="overflow-y-auto flex-1">
            {filteredCategories.length === 0 ? (
              <div className="p-3 text-xs text-on-surface-variant font-mono">No categories found.</div>
            ) : (
              filteredCategories.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-2 hover:bg-surface-variant cursor-pointer group"
                  onClick={() => {
                    onChange(c.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {value === c.name && <Check className="w-3 h-3 text-primary" />}
                    <span className={`font-mono text-sm ${value === c.name ? "text-primary font-bold" : "text-on-surface"}`}>{c.name}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t border-surface-variant bg-surface-container-low flex gap-2">
            <input 
              type="text" 
              placeholder="New category..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              className="flex-1 bg-surface-container-lowest border border-surface-variant p-1.5 rounded text-on-surface font-mono text-xs focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              onClick={handleCreate}
              disabled={isCreating || !newCategoryName.trim()}
              className="bg-primary text-on-primary p-1.5 rounded hover:bg-primary-container disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}
