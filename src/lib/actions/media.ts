"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMediaEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("media_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching media entries:", error);
    return [];
  }
  return data;
}

export async function createMediaEntry(entry: { title: string; type: string; status: string; rating?: number | null; cover_url?: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("media_entries")
    .insert([
      {
        ...entry,
        user_id: user.id,
      },
    ]);

  if (error) throw error;
  revalidatePath("/os/media");
}

export async function updateMediaEntry(id: string, entry: { title?: string; type?: string; status?: string; rating?: number | null; cover_url?: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("media_entries")
    .update(entry)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/os/media");
}

export async function deleteMediaEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("media_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/os/media");
}
