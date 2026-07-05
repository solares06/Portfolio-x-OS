"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, Tag, AlignLeft, DollarSign } from "lucide-react";
import { getFinanceEntries, getMonthSummary, createFinanceEntry } from "@/lib/actions/finance";

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
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: "",
    type: "expense" as "income" | "expense",
    notes: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) return;
    setSubmitting(true);
    try {
      await createFinanceEntry({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setIsFormOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        amount: "",
        type: "expense",
        notes: ""
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 px-4 py-2 rounded transition-colors font-mono uppercase text-sm"
          >
            <Plus className="w-4 h-4" />
            {isFormOpen ? "Cancel Entry" : "Log Transaction"}
          </button>
        </header>

        {/* Form Modal / Dropdown */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-surface-container-low border border-surface-variant rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-on-surface-variant tracking-wider">Type</label>
              <select 
                value={formData.type}
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
                  value={formData.category}
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
                  value={formData.amount}
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
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:outline-none pl-10 pr-3 py-2 text-sm font-mono rounded text-on-surface"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-5 flex justify-end mt-2">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-primary text-background px-6 py-2 rounded font-mono uppercase text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Commit Transaction"}
              </button>
            </div>
          </form>
        )}

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
                        <div className={`font-mono font-bold text-lg ${isIncome ? 'text-primary' : 'text-error'}`}>
                          {isIncome ? "+" : "-"}${parseFloat(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
