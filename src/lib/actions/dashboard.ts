"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(year?: number, month?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const startOfMonth = new Date(y, m, 1).toISOString().split('T')[0];
  const endOfMonth = new Date(y, m + 1, 0).toISOString().split('T')[0];
  
  const [eventsRes, tasksRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)
      .order("date", { ascending: true })
      .order("time", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  return {
    events: eventsRes.data || [],
    tasks: tasksRes.data || []
  };
}

export async function createEvent(title: string, date: string, time: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .insert([{ title, date, time, user_id: user.id }]);

  if (error) throw error;
}

export async function editEvent(id: string, title: string, date: string, time: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .update({ title, date, time })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
