"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Edit2, Trash2, PieChart as PieChartIcon, BarChart3, Repeat, Target } from "lucide-react";
import { 
  getFinanceEntries, getMonthSummary, createFinanceEntry, updateFinanceEntry, deleteFinanceEntry,
  getBudgets, setBudget, deleteBudget,
  getRecurringTransactions, createRecurringTransaction, deleteRecurringTransaction, processRecurringTransactions,
  getChartData
} from "@/lib/actions/finance";
import FinanceModal, { FinanceEntryData } from "@/components/FinanceModal";
import BudgetModal, { BudgetData } from "@/components/BudgetModal";
import RecurringTransactionModal, { RecurringData } from "@/components/RecurringTransactionModal";
import ConfirmModal from "@/components/ConfirmModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  const [budgets, setBudgets] = useState<any[]>([]);
  const [recurring, setRecurring] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEntry, setEditingEntry] = useState<FinanceEntryData | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<{id: string, type: string} | null>(null);

  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      await processRecurringTransactions(); // Auto-process on load

      const [entriesData, summaryData, budgetsData, recurringData, charts] = await Promise.all([
        getFinanceEntries(),
        getMonthSummary(),
        getBudgets(),
        getRecurringTransactions(),
        getChartData()
      ]);
      setEntries(entriesData as FinanceEntry[]);
      setSummary(summaryData);
      setBudgets(budgetsData);
      setRecurring(recurringData);
      setChartData(charts);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEntry = async (data: Partial<FinanceEntryData>) => {
    if (!data.amount || !data.category || !data.date || !data.type) return;
    if (modalMode === "create") {
      await createFinanceEntry({ date: data.date, category: data.category, amount: parseFloat(data.amount), type: data.type, notes: data.notes });
    } else if (modalMode === "edit" && editingEntry) {
      await updateFinanceEntry(editingEntry.id, { date: data.date, category: data.category, amount: parseFloat(data.amount), type: data.type, notes: data.notes });
    }
    await loadData(false);
  };

  const handleSaveBudget = async (data: BudgetData) => {
    await setBudget(data.category, parseFloat(data.amount));
    await loadData(false);
  };

  const handleSaveRecurring = async (data: RecurringData) => {
    await createRecurringTransaction({
      category: data.category,
      amount: parseFloat(data.amount),
      type: data.type,
      recurrence: data.recurrence,
      next_date: data.next_date,
      notes: data.notes
    });
    await loadData(false);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      if (entryToDelete.type === 'entry') await deleteFinanceEntry(entryToDelete.id);
      if (entryToDelete.type === 'budget') await deleteBudget(entryToDelete.id);
      if (entryToDelete.type === 'recurring') await deleteRecurringTransaction(entryToDelete.id);
      await loadData(false);
    } catch (e) {
      console.error(e);
    }
    setEntryToDelete(null);
  };

  // Prepare chart data
  const categoryTotals = entries.reduce((acc, entry) => {
    if (entry.type === 'expense') {
      const amt = parseFloat(entry.amount);
      acc[entry.category] = (acc[entry.category] || 0) + amt;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const COLORS = ['#00F2FF', '#FF0055', '#7A00FF', '#00FF88', '#FFD700', '#FF8C00'];

  // Group chartData by date for the Bar Chart
  const dailyDataMap = chartData.reduce((acc, curr) => {
    const d = curr.date;
    if (!acc[d]) acc[d] = { date: d, income: 0, expense: 0 };
    if (curr.type === 'income') acc[d].income += parseFloat(curr.amount);
    if (curr.type === 'expense') acc[d].expense += parseFloat(curr.amount);
    return acc;
  }, {} as Record<string, { date: string, income: number, expense: number }>);
  const dailyData = Object.values(dailyDataMap).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
    return (
      <div className="flex h-full w-full justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_top_right,rgba(0,242,255,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>

      <div className="p-8 max-w-7xl mx-auto w-full z-10 space-y-8">
        <header className="flex justify-between items-end border-b border-surface-container pb-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary uppercase neon-text-glow">Finance OS</h1>
            <p className="font-mono text-sm text-on-surface-variant mt-2 uppercase tracking-widest">Financial Telemetry & Analytics</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsBudgetModalOpen(true)} className="flex items-center gap-2 bg-surface-container-high border border-surface-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded transition-colors font-mono uppercase text-sm">
              <Target className="w-4 h-4" /> Budget
            </button>
            <button onClick={() => setIsRecurringModalOpen(true)} className="flex items-center gap-2 bg-surface-container-high border border-surface-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded transition-colors font-mono uppercase text-sm">
              <Repeat className="w-4 h-4" /> Recurring
            </button>
            <button onClick={() => { setModalMode("create"); setEditingEntry(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 px-4 py-2 rounded transition-colors font-mono uppercase text-sm">
              <Plus className="w-4 h-4" /> Log
            </button>
          </div>
        </header>

        <FinanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEntry} initialData={editingEntry} mode={modalMode} />
        <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={handleSaveBudget} />
        <RecurringTransactionModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} onSave={handleSaveRecurring} />
        <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setEntryToDelete(null); }} onConfirm={confirmDelete} title="Delete Item" message="Are you sure you want to delete this? This action cannot be undone." confirmText="Delete" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2"><TrendingUp className="w-5 h-5 text-primary" /><h3 className="font-mono text-xs uppercase tracking-widest">Income (Month)</h3></div>
            <p className="font-display text-3xl font-bold text-primary">₹{summary.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2"><TrendingDown className="w-5 h-5 text-error" /><h3 className="font-mono text-xs uppercase tracking-widest">Expense (Month)</h3></div>
            <p className="font-display text-3xl font-bold text-error">₹{summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-surface-container-low border border-surface-variant p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex items-center gap-3 text-on-surface-variant mb-2"><Wallet className="w-5 h-5 text-primary" /><h3 className="font-mono text-xs uppercase tracking-widest">Net Balance</h3></div>
            <p className="font-display text-3xl font-bold text-on-surface">₹{summary.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Charts & Budgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Daily Cashflow</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(val) => new Date(val).getDate().toString()} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Bar dataKey="income" fill="#00F2FF" radius={[2,2,0,0]} />
                  <Bar dataKey="expense" fill="#FF0055" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><PieChartIcon className="w-4 h-4"/> Expenses by Category</h2>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-on-surface-variant font-mono text-sm">No expenses to chart</span>
              )}
            </div>
          </div>
        </div>

        {/* Budgets & Recurring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary border-b border-surface-container pb-2">Active Budgets</h2>
            <div className="bg-surface-container-low border border-surface-variant rounded-lg p-6 flex flex-col gap-4">
              {budgets.length === 0 ? <span className="text-sm font-mono text-on-surface-variant">No budgets set.</span> : 
                budgets.map((b) => {
                  const spent = categoryTotals[b.category] || 0;
                  const limit = parseFloat(b.amount);
                  const percent = Math.min((spent / limit) * 100, 100);
                  const isOver = spent > limit;
                  return (
                    <div key={b.id} className="space-y-2 group">
                      <div className="flex justify-between font-mono text-sm">
                        <span className="uppercase text-on-surface flex items-center gap-2">
                          {b.category} 
                          <button onClick={() => { setEntryToDelete({id: b.id, type: 'budget'}); setIsDeleteModalOpen(true); }} className="opacity-0 group-hover:opacity-100 text-error"><Trash2 className="w-3 h-3"/></button>
                        </span>
                        <span className={isOver ? 'text-error font-bold' : 'text-on-surface-variant'}>₹{spent.toFixed(0)} / ₹{limit.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${isOver ? 'bg-error' : 'bg-primary'} transition-all`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-primary border-b border-surface-container pb-2">Recurring Transactions</h2>
            <div className="bg-surface-container-low border border-surface-variant rounded-lg p-4 flex flex-col divide-y divide-surface-variant">
              {recurring.length === 0 ? <span className="text-sm font-mono text-on-surface-variant p-2">No recurring items.</span> : 
                recurring.map((r) => (
                  <div key={r.id} className="py-2 flex justify-between items-center group">
                    <div>
                      <div className="font-bold text-on-surface">{r.category}</div>
                      <div className="text-xs font-mono text-on-surface-variant">Due: {new Date(r.next_date).toLocaleDateString()} ({r.recurrence})</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`font-mono ${r.type === 'income' ? 'text-primary' : 'text-error'}`}>₹{parseFloat(r.amount).toFixed(2)}</div>
                      <button onClick={() => { setEntryToDelete({id: r.id, type: 'recurring'}); setIsDeleteModalOpen(true); }} className="opacity-0 group-hover:opacity-100 text-error"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Daily Ledger */}
        <div className="space-y-4 pt-4">
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
                        <span className="font-display font-bold text-lg text-on-surface uppercase group-hover:text-primary transition-colors">{entry.category}</span>
                        <span className="font-mono text-xs text-on-surface-variant mt-1">
                          {new Date(entry.date).toLocaleDateString()} {entry.notes && `• ${entry.notes}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-mono font-bold text-lg ${isIncome ? 'text-primary' : 'text-error'}`}>
                          {isIncome ? "+" : "-"}₹{parseFloat(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingEntry({...entry, amount: parseFloat(entry.amount).toString()}); setModalMode("edit"); setIsModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { setEntryToDelete({id: entry.id, type: 'entry'}); setIsDeleteModalOpen(true); }} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
