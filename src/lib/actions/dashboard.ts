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
      .order("date", { ascending: true })
      .order("time", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  let events = eventsRes.data || [];
  
  // Expand recurring events for the current month view
  const expandedEvents: any[] = [];
  
  events.forEach(ev => {
    if (ev.recurrence_rule === 'weekly') {
      // Generate events for every week in the month
      const evDate = new Date(ev.date);
      const dayOfWeek = evDate.getDay();
      
      let curr = new Date(y, m, 1);
      while (curr.getMonth() === m) {
        if (curr.getDay() === dayOfWeek && curr >= evDate) {
          expandedEvents.push({ ...ev, date: curr.toISOString().split('T')[0] });
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      if (ev.date >= startOfMonth && ev.date <= endOfMonth) {
        expandedEvents.push(ev);
      }
    }
  });

  // Sort expanded events by date
  expandedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    events: expandedEvents,
    tasks: tasksRes.data || []
  };
}

export async function createEvent(title: string, date: string, time: string | null = null, recurrence_rule: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .insert([{ title, date, time, recurrence_rule, user_id: user.id }]);

  if (error) throw error;
}

export async function editEvent(id: string, title: string, date: string, time: string | null = null, recurrence_rule: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .update({ title, date, time, recurrence_rule })
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

export async function getTodaySummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  // 1. Gym Workout Day
  const { data: splitDay } = await supabase
    .from("gym_weekly_splits")
    .select("*")
    .eq("user_id", user.id)
    .ilike("day_label", `%${dayName}%`)
    .single();

  let gymWorkout = null;
  if (splitDay && splitDay.type.toLowerCase() !== 'rest') {
    const { data: day } = await supabase
      .from("gym_workout_days")
      .select("title")
      .eq("user_id", user.id)
      .eq("day_label", splitDay.day_label)
      .single();
    if (day) gymWorkout = day.title;
  } else if (splitDay) {
    gymWorkout = "Rest Day";
  }

  // 2. Open Tasks (limit 3)
  const { data: openTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("done", false)
    .order("created_at", { ascending: false })
    .limit(3);

  // 3. Next Class Due
  const { data: nextClass } = await supabase
    .from("study_classes")
    .select("code, title, schedule")
    .eq("user_id", user.id)
    .ilike("schedule", `%${dayName}%`)
    .limit(1)
    .single();

  return {
    gymWorkout,
    openTasks: openTasks || [],
    nextClass: nextClass || null
  };
}

export async function getWeeklyReview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const startStr = oneWeekAgo.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];

  // Tasks completed this week
  const { count: tasksCompleted } = await supabase
    .from("tasks")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id)
    .eq("done", true)
    .gte("updated_at", startStr)
    .lte("updated_at", endStr + "T23:59:59Z");

  // Gym consistency logs this week
  const { count: gymDays } = await supabase
    .from("gym_consistency_logs")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("date", startStr)
    .lte("date", endStr);

  return {
    tasksCompleted: tasksCompleted || 0,
    gymDays: gymDays || 0,
  };
}

export async function getDynamicNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const todayStr = new Date().toISOString().split('T')[0];
  const notifications = [];

  // Overdue tasks
  const { data: overdueTasks } = await supabase
    .from("tasks")
    .select("title, due_date")
    .eq("user_id", user.id)
    .eq("done", false)
    .lt("due_date", todayStr);

  if (overdueTasks && overdueTasks.length > 0) {
    notifications.push({
      id: "overdue_tasks",
      type: "warning",
      title: "Overdue Tasks",
      message: `You have ${overdueTasks.length} overdue task(s).`
    });
  }

  // Gym consistency - check if no completed log in last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

  const { data: recentGym } = await supabase
    .from("gym_consistency_logs")
    .select("date")
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("date", threeDaysAgoStr)
    .limit(1);

  if (!recentGym || recentGym.length === 0) {
    notifications.push({
      id: "gym_streak",
      type: "error",
      title: "Gym Streak at Risk",
      message: "You haven't logged a gym session in 3 days!"
    });
  }

  return notifications;
}
