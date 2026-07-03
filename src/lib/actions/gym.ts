"use server";

import { createClient } from "../supabase/server";

export async function getBodyMetrics() {
  const supabase = await createClient();
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

export async function getWorkoutDay() {
  const supabase = await createClient();
  // Fetch the active workout day
  const { data: dayData, error: dayError } = await supabase
    .from("gym_workout_days")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

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
    dayId: dayData.day_id,
    title: dayData.title,
    duration: dayData.duration,
    intensity: dayData.intensity,
    exercises: fullExercises
  };
}
