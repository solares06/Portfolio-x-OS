"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const results: SearchResult[] = [];
  const q = `%${query}%`;

  // Search Tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status")
    .eq("user_id", user.id)
    .ilike("title", q)
    .limit(5);

  if (tasks) {
    tasks.forEach(t => results.push({
      id: `task-${t.id}`,
      type: "Task",
      title: t.title,
      subtitle: `Status: ${t.status}`,
      href: `/os/dashboard`
    }));
  }

  // Search Research Notes
  const { data: notes } = await supabase
    .from("research_notes")
    .select("id, title, content")
    .eq("user_id", user.id)
    .or(`title.ilike.${q},content.ilike.${q}`)
    .limit(5);

  if (notes) {
    notes.forEach(n => results.push({
      id: `note-${n.id}`,
      type: "Research Note",
      title: n.title,
      subtitle: n.content.substring(0, 40) + "...",
      href: `/os/dashboard`
    }));
  }

  // Search Finance Entries
  const { data: finance } = await supabase
    .from("finance_entries")
    .select("id, description, amount, type")
    .eq("user_id", user.id)
    .ilike("description", q)
    .limit(5);

  if (finance) {
    finance.forEach(f => results.push({
      id: `finance-${f.id}`,
      type: "Finance",
      title: f.description,
      subtitle: `${f.type === 'expense' ? '-' : '+'}$${f.amount}`,
      href: `/os/finance`
    }));
  }

  // Search Journal Entries
  const { data: journals } = await supabase
    .from("journal_entries")
    .select("id, title, content")
    .eq("user_id", user.id)
    .or(`title.ilike.${q},content.ilike.${q}`)
    .limit(5);

  if (journals) {
    journals.forEach(j => results.push({
      id: `journal-${j.id}`,
      type: "Journal",
      title: j.title,
      subtitle: j.content?.substring(0, 40) + "...",
      href: `/os/dashboard`
    }));
  }

  return results;
}
