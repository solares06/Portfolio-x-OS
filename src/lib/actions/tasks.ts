"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("done", { ascending: true }) // Pending first
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data;
}

export async function toggleTaskStatus(id: string, done: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  
  revalidatePath("/os");
}

export async function createTask(title: string, dueDate: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        due_date: dueDate,
        user_id: user.id,
      },
    ]);

  if (error) throw error;
  revalidatePath("/os");
}

export async function editTask(id: string, title: string, dueDate: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks")
    .update({ title, due_date: dueDate })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/os");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/os");
}
