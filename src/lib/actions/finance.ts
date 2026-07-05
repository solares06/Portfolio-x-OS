"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFinanceEntries() {
  const supabase = await createClient();
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
