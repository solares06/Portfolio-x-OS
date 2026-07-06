"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, Tag, AlignLeft, DollarSign, Edit2, Trash2 } from "lucide-react";
import { getFinanceEntries, getMonthSummary, createFinanceEntry, updateFinanceEntry, deleteFinanceEntry } from "@/lib/actions/finance";
import FinanceModal, { FinanceEntryData } from "@/components/FinanceModal";
import ConfirmModal from "@/components/ConfirmModal";

type FinanceEntry = {
  id: string;
  date: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  notes?: string;
  created_at: string;
};

type MonthSummary = {
  income: number;
  expense: number;
  net: number;
};

export default function OSFinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [summary, setSummary] = useState<MonthSummary>({ income: 0, expense: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEntry, setEditingEntry] = useState<FinanceEntryData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [entriesData, summaryData] = await Promise.all([
        getFinanceEntries(),
        getMonthSummary()
      ]);
      setEntries(entriesData as FinanceEntry[]);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEntry = async (data: Partial<FinanceEntryData>) => {
    if (!data.amount || !data.category || !data.date || !data.type) return;
    
    if (modalMode === "create") {
      await createFinanceEntry({
        date: data.date,
        category: data.category,
        amount: parseFloat(data.amount),
        type: data.type,
        notes: data.notes,
      });
    } else if (modalMode === "edit" && editingEntry) {
      await updateFinanceEntry(editingEntry.id, {
        date: data.date,
        category: data.category,
        amount: parseFloat(data.amount),
        type: data.type,
        notes: data.notes,
      });
    }
    await loadData();
  };

  const handleEditClick = (entry: FinanceEntry) => {
    setEditingEntry({
      ...entry,
      amount: parseFloat(entry.amount).toString()
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    const id = entryToDelete;
    // Optimistic update
    setEntries(prev => prev.filter(e => e.id !== id));
    try {
      await deleteFinanceEntry(id);
      await loadData(); // Reload to fix summary and actual data
    } catch (e) {
      console.error(e);
      await loadData(); // Revert on failure
    }
    setEntryToDelete(null);
  };

  // Category breakdown logic
  const categoryTotals = entries.reduce((acc, entry) => {
    if (entry.type === 'expense') {
      const amt = parseFloat(entry.amount);
      acc[entry.category] = (acc[entry.category] || 0) + amt;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div className="flex h-full w-full justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto custom-scrollbar relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_top_right,rgba(0,242,255,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>

      <div className="p-8 max-w-7xl mx-auto w-full z-10 space-y-8">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-surface-container pb-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary uppercase neon-text-glow">Finance</h1>
            <p className="font-mono text-sm text-on-surface-variant mt-2 uppercase tracking-widest">Financial Telemetry & Ledger</p>
          </div>
          <button 
            onClick={() => {
              setModalMode("create");
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 px-4 py-2 rounded transition-colors font-mono uppercase text-sm"
          >
            <Plus className="w-4 h-4" />
            Log Transaction
          </button>
        </header>

        {/* Form Modal / Dropdown */}
        <FinanceModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEntry}
          initialData={editingEntry}
          mode={modalMode}
        />

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-mono text-xs uppercase tracking-widest">Total Income (Month)</h3>
            </div>
            <p className="font-display text-3xl font-bold text-primary">${summary.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2">
              <TrendingDown className="w-5 h-5 text-error" />
              <h3 className="font-mono text-xs uppercase tracking-widest">Total Expense (Month)</h3>
            </div>
            <p className="font-display text-3xl font-bold text-error">${summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2">
              <Wallet className="w-5 h-5 text-primary-container" />
              <h3 className="font-mono text-xs uppercase tracking-widest">Net Balance (Month)</h3>
            </div>
            <p className="font-display text-3xl font-bold text-on-surface">${summary.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Main Ledger */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary border-b border-surface-container pb-2">Daily Ledger</h2>
            
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg overflow-hidden">
              {entries.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant font-mono text-sm">No transactions found.</div>
              ) : (
                <div className="flex flex-col divide-y divide-surface-variant">
                  {entries.map(entry => {
                    const isIncome = entry.type === 'income';
                    return (
                      <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-lg text-on-surface uppercase group-hover:text-primary transition-colors">
                            {entry.category}
                          </span>
                          <span className="font-mono text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                            {new Date(entry.date).toLocaleDateString()}
                            {entry.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px]">{entry.notes}</span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`font-mono font-bold text-lg ${isIncome ? 'text-primary' : 'text-error'}`}>
                            {isIncome ? "+" : "-"}${parseFloat(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditClick(entry)}
                              className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(entry.id)}
                              className="text-on-surface-variant hover:text-error transition-colors p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary border-b border-surface-container pb-2">Expense Breakdown</h2>
            <div className="bg-surface-container-low border border-surface-variant rounded-lg p-6 flex flex-col gap-4">
              {sortedCategories.length === 0 ? (
                <span className="text-sm font-mono text-on-surface-variant text-center py-4">No expenses recorded.</span>
              ) : (
                sortedCategories.map(([cat, total], idx) => {
                  const percentage = summary.expense > 0 ? (total / summary.expense) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between font-mono text-sm">
                        <span className="uppercase text-on-surface">{cat}</span>
                        <span className="text-error font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-error h-full opacity-80" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
