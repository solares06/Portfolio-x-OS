"use server";

import { createClient } from "../supabase/server";

export async function getBodyMetrics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      weight: { value: 0, unit: "kg", delta: "+0kg" },
      bodyFat: { value: 0, unit: "%", delta: "0%", progress: 0 }
    };
  }
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Return empty state if no data
    return {
      weight: { value: 0, unit: "kg", delta: "+0kg" },
      bodyFat: { value: 0, unit: "%", delta: "0%", progress: 0 }
    };
  }

  return {
    weight: { value: data.weight_value, unit: data.weight_unit, delta: data.weight_delta },
    bodyFat: { value: data.body_fat_value, unit: data.body_fat_unit, delta: data.body_fat_delta, progress: data.body_fat_progress }
  };
}

export async function getWeeklySplit() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("gym_weekly_splits")
    .select("*")
    .order("order_index", { ascending: true });

  if (error || !data || data.length === 0) {
    return [];
  }

  return data.map(d => ({
    id: d.id,
    dayLabel: d.day_label,
    type: d.type,
    isActive: d.is_active
  }));
}

export async function getWorkoutDay(dayId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Fetch the active workout day
  let query = supabase.from("gym_workout_days").select("*").eq("user_id", user.id);
  
  if (dayId) {
    query = query.eq("day_id", dayId);
  } else {
    // If no specific day requested, fallback to the first one available
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data: dayData, error: dayError } = await query.single();

  if (dayError || !dayData) {
    return null;
  }

  // Fetch exercises
  const { data: exercisesData } = await supabase
    .from("gym_exercises")
    .select("*")
    .eq("workout_day_id", dayData.id)
    .order("order_index", { ascending: true });

  const exercises = exercisesData || [];

  // Fetch all sets for these exercises
  const exerciseIds = exercises.map(ex => ex.id);
  const { data: setsData } = await supabase
    .from("gym_sets")
    .select("*")
    .in("exercise_id", exerciseIds.length > 0 ? exerciseIds : ['00000000-0000-0000-0000-000000000000'])
    .order("order_index", { ascending: true });

  const sets = setsData || [];

  const fullExercises = exercises.map(ex => ({
    id: ex.id,
    order: ex.order_index,
    name: ex.name,
    target: ex.target,
    isFaded: ex.is_faded,
    sets: sets.filter(s => s.exercise_id === ex.id).map(s => ({
      id: s.id,
      label: s.label,
      details: s.details,
      isActive: s.is_active,
      isFaded: s.is_faded
    }))
  }));

  return {
    id: dayData.id,
    dayId: dayData.day_id,
    title: dayData.title,
    duration: dayData.duration,
    intensity: dayData.intensity,
    exercises: fullExercises
  };
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export async function updateBodyMetrics(
  weight_value: number, weight_unit: string, weight_delta: string,
  body_fat_value: number, body_fat_unit: string, body_fat_delta: string, body_fat_progress: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("body_metrics")
    .select("id")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("body_metrics")
      .update({ weight_value, weight_unit, weight_delta, body_fat_value, body_fat_unit, body_fat_delta, body_fat_progress })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("body_metrics")
      .insert([{ 
        weight_value, weight_unit, weight_delta, 
        body_fat_value, body_fat_unit, body_fat_delta, body_fat_progress, 
        user_id: user.id 
      }]);
    if (error) throw error;
  }
}

export async function updateWeeklySplitType(id: string, type: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_weekly_splits")
    .update({ type, is_active: type !== "Rest" })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function createWorkoutDay(day_id: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_workout_days")
    .insert([{
      user_id: user.id,
      day_id,
      title,
      duration: "60 MIN",
      intensity: "Medium"
    }]);
  if (error) throw error;
}

export async function createExercise(workout_day_id: string, order_index: string, name: string, target: string, is_faded: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_exercises")
    .insert([{ workout_day_id, order_index, name, target, is_faded, user_id: user.id }]);

  if (error) throw error;
}

export async function editExercise(id: string, order_index: string, name: string, target: string, is_faded: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_exercises")
    .update({ order_index, name, target, is_faded })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_exercises")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createSet(exercise_id: string, order_index: number, label: string, details: string, is_active: boolean = false, is_faded: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_sets")
    .insert([{ exercise_id, order_index, label, details, is_active, is_faded, user_id: user.id }]);

  if (error) throw error;
}

export async function editSet(id: string, label: string, details: string, is_active: boolean, is_faded: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_sets")
    .update({ label, details, is_active, is_faded })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteSet(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_sets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function initializeGymProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Create initial metrics
  await supabase.from("body_metrics").insert([{
    user_id: user.id,
    weight_value: 0, weight_unit: "kg", weight_delta: "+0kg",
    body_fat_value: 0, body_fat_unit: "%", body_fat_delta: "0%", body_fat_progress: 0
  }]);

  // 2. Create weekly splits
  const days = [
    { day_label: "MON", type: "Rest", is_active: false, order_index: 1 },
    { day_label: "TUE", type: "Rest", is_active: false, order_index: 2 },
    { day_label: "WED", type: "Rest", is_active: false, order_index: 3 },
    { day_label: "THU", type: "Rest", is_active: false, order_index: 4 },
    { day_label: "FRI", type: "Rest", is_active: false, order_index: 5 },
    { day_label: "SAT", type: "Rest", is_active: false, order_index: 6 },
    { day_label: "SUN", type: "Rest", is_active: false, order_index: 7 }
  ].map(d => ({ ...d, user_id: user.id }));
  await supabase.from("gym_weekly_splits").insert(days);

  // 3. Create initial workout day
  await supabase.from("gym_workout_days").insert([{
    user_id: user.id,
    day_id: "DAY 1",
    title: "New Workout",
    duration: "60 MIN",
    intensity: "Medium"
  }]);
}
