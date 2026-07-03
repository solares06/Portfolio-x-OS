"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getJournalEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }

  return data;
}

export async function saveJournalEntry(id: string | null, entry: { title: string; body: string; date: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (id) {
    const { error } = await supabase
      .from("journal_entries")
      .update({
        title: entry.title,
        body: entry.body,
        date: entry.date,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("journal_entries")
      .insert([
        {
          title: entry.title,
          body: entry.body,
          date: entry.date,
          user_id: user.id,
        },
      ]);

    if (error) throw error;
  }

  revalidatePath("/os/journal");
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/os/journal");
}
