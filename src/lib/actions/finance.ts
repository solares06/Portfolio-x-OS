"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFinanceEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("finance_entries")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching finance entries:", error);
    return [];
  }
  return data;
}

export async function getMonthSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { income: 0, expense: 0, net: 0 };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("finance_entries")
    .select("amount, type")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth);

  if (error) {
    console.error("Error fetching month summary:", error);
    return { income: 0, expense: 0, net: 0 };
  }

  let income = 0;
  let expense = 0;

  data.forEach((entry) => {
    const amt = parseFloat(entry.amount);
    if (entry.type === "income") {
      income += amt;
    } else {
      expense += amt;
    }
  });

  return {
    income,
    expense,
    net: income - expense
  };
}

export async function createFinanceEntry(entry: {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("finance_entries")
    .insert([
      {
        user_id: user.id,
        date: entry.date,
        category: entry.category,
        amount: entry.amount,
        type: entry.type,
        notes: entry.notes,
      },
    ]);

  if (error) {
    console.error("Error creating finance entry:", error);
    throw error;
  }

  revalidatePath("/os/finance");
}

export async function updateFinanceEntry(id: string, entry: {
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("finance_entries")
    .update({
      date: entry.date,
      category: entry.category,
      amount: entry.amount,
      type: entry.type,
      notes: entry.notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating finance entry:", error);
    throw error;
  }

  revalidatePath("/os/finance");
}

export async function deleteFinanceEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("finance_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting finance entry:", error);
    throw error;
  }

  revalidatePath("/os/finance");
}

// --- Budgets ---
export async function getBudgets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("finance_budgets")
    .select("*")
    .order("category");
  
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function setBudget(category: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Upsert the budget
  const { error } = await supabase
    .from("finance_budgets")
    .upsert({ user_id: user.id, category, amount }, { onConflict: 'user_id, category' });

  if (error) throw error;
  revalidatePath("/os/finance");
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("finance_budgets").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/os/finance");
}

// --- Recurring Transactions ---
export async function getRecurringTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("finance_recurring")
    .select("*")
    .order("next_date");
  
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function createRecurringTransaction(entry: {
  amount: number;
  category: string;
  type: "income" | "expense";
  recurrence: "daily" | "weekly" | "monthly" | "yearly";
  notes?: string;
  next_date: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("finance_recurring").insert([{
    user_id: user.id,
    ...entry
  }]);

  if (error) throw error;
  revalidatePath("/os/finance");
}

export async function deleteRecurringTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("finance_recurring").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/os/finance");
}

export async function processRecurringTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // Fetch due transactions
  const { data: dueTransactions, error } = await supabase
    .from("finance_recurring")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_date", today);

  if (error || !dueTransactions || dueTransactions.length === 0) return;

  for (const rt of dueTransactions) {
    // Insert into entries
    await supabase.from("finance_entries").insert([{
      user_id: user.id,
      date: rt.next_date,
      category: rt.category,
      amount: rt.amount,
      type: rt.type,
      notes: rt.notes ? `[Auto] ${rt.notes}` : '[Auto]',
    }]);

    // Calculate next date
    const nextDate = new Date(rt.next_date);
    if (rt.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    if (rt.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    if (rt.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    if (rt.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    // Update the recurring entry
    await supabase.from("finance_recurring").update({ next_date: nextDate.toISOString().split('T')[0] }).eq("id", rt.id);
  }
}

// --- Chart Data ---
export async function getChartData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("finance_entries")
    .select("amount, type, category, date")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date");

  if (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
  return data;
}
