"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getJournalEntries(): Promise<Record<string, unknown>[]> {
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
  const entriesWithUrls = await Promise.all(data.map(async (entry: Record<string, unknown>) => {
    let photoUrls: string[] = [];
    const photos = entry.photos as string[] | undefined;
    if (photos && photos.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from("journal-photos")
        .createSignedUrls(photos, 604800); // 7 days

      if (signedUrls) {
        photoUrls = signedUrls.map((s: { signedUrl: string | null }) => s.signedUrl).filter(Boolean) as string[];
      }
    }
    return { ...entry, photoUrls };
  }));

  return entriesWithUrls;
}

export async function createBlankEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("journal_entries")
    .insert([{ title: "", body: "", date: new Date().toISOString().split('T')[0], user_id: user.id }])
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/os/journal");
  return data.id;
}

export async function saveJournalEntry(id: string | null, entry: { title: string; body: string; date: string; mood?: string | null }) {
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
        mood: entry.mood ?? null,
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
          mood: entry.mood ?? null,
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

export async function uploadJournalPhoto(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const entryId = formData.get("entryId") as string;
  if (!file || !entryId) throw new Error("Missing file or entryId");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${entryId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("journal-photos")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  const { data: entry, error: fetchError } = await supabase
    .from("journal_entries")
    .select("photos")
    .eq("id", entryId)
    .single();

  if (fetchError) throw fetchError;

  const currentPhotos = entry.photos || [];
  const { error: updateError } = await supabase
    .from("journal_entries")
    .update({ photos: [...currentPhotos, filePath] })
    .eq("id", entryId);

  if (updateError) throw updateError;

  revalidatePath("/os/journal");
}
