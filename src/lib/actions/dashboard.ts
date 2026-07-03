"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch today's events
  const today = new Date().toISOString().split('T')[0];
  
  const [eventsRes, tasksRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("date", today)
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
