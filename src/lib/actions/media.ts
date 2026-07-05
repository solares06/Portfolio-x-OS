"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMediaEntries() {
  const supabase = await createClient();

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
