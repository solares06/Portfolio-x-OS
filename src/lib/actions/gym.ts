"use server";

import { createClient } from "../supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    bodyFat: { value: data.body_fat_value, unit: data.body_fat_unit, delta: data.body_fat_delta, progress: data.body_fat_progress },
    photoUrl: data.photo_url || null
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
      isFaded: s.is_faded,
      logs: s.logs || []
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

export async function createExercise(workout_day_id: string, order_index: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let classifiedTarget = "Core";
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Classify the gym exercise "${name}" into exactly one of these muscle groups: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quads, Hamstrings, Calves, Core. Respond with ONLY the single muscle group name.`;
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim();
      if (aiResponse) classifiedTarget = aiResponse;
    } catch (e) {
      console.error("AI classification failed", e);
    }
  }

  const { error } = await supabase
    .from("gym_exercises")
    .insert([{ workout_day_id, order_index, name, target: classifiedTarget, is_faded: false, user_id: user.id }]);

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

export async function updateSetLogs(id: string, logs: { id: number; kg: string; reps: string; rpe: string; completed: boolean }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("gym_sets")
    .update({ logs })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function getMuscleDistribution() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Only count sets from the current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch all exercises for the user and their sets
  const { data: exercises, error } = await supabase
    .from("gym_exercises")
    .select(`
      id,
      name,
      target,
      gym_sets (id, logs, created_at)
    `)
    .eq("user_id", user.id);

  if (error) throw error;

  // Canonical muscle groups
  const CANONICAL_GROUPS = [
    "Chest", "Back", "Shoulders", "Biceps", "Triceps",
    "Quads", "Hamstrings", "Calves", "Core", "Forearms", "Glutes"
  ];

  // Normalize DB target field to a canonical muscle group
  const TARGET_NORMALIZE: Record<string, string> = {
    "chest": "Chest",
    "back": "Back", "upper back": "Back", "lats": "Back",
    "shoulders": "Shoulders", "rear delts": "Shoulders", "rear delts/upper back": "Shoulders", "delts": "Shoulders", "traps": "Shoulders",
    "biceps": "Biceps",
    "triceps": "Triceps",
    "quads": "Quads", "legs": "Quads", "quads/glutes": "Quads",
    "hamstrings": "Hamstrings",
    "calves": "Calves",
    "core": "Core", "abs": "Core",
    "forearms": "Forearms",
    "glutes": "Glutes",
  };

  // Fallback: exercise name → muscle group (only used when target field is empty)
  const EXERCISE_NAME_MAP: Record<string, string> = {
    "bench press": "Chest", "chest press": "Chest", "chest fly": "Chest",
    "fly": "Chest", "flye": "Chest", "incline press": "Chest", "decline press": "Chest",
    "push up": "Chest", "pushup": "Chest", "dip": "Chest", "cable cross": "Chest",
    "pec deck": "Chest", "pec": "Chest", "dumbbell press": "Chest", "db press": "Chest",
    "row": "Back", "pull up": "Back", "pullup": "Back", "chin up": "Back",
    "pulldown": "Back", "deadlift": "Back", "back extension": "Back", "face pull": "Back",
    "lat": "Back", "cable row": "Back", "seated row": "Back",
    "shoulder press": "Shoulders", "overhead press": "Shoulders", "ohp": "Shoulders",
    "lateral raise": "Shoulders", "front raise": "Shoulders", "rear delt": "Shoulders",
    "shrug": "Shoulders", "arnold press": "Shoulders", "upright row": "Shoulders",
    "bicep curl": "Biceps", "hammer curl": "Biceps", "preacher curl": "Biceps",
    "concentration curl": "Biceps", "barbell curl": "Biceps", "cable curl": "Biceps",
    "incline curl": "Biceps",
    "tricep": "Triceps", "skull crusher": "Triceps", "pushdown": "Triceps",
    "overhead extension": "Triceps", "kickback": "Triceps", "close grip": "Triceps",
    "squat": "Quads", "leg press": "Quads", "leg extension": "Quads",
    "lunge": "Quads", "hack squat": "Quads", "goblet squat": "Quads",
    "leg curl": "Hamstrings", "romanian deadlift": "Hamstrings", "rdl": "Hamstrings",
    "stiff leg": "Hamstrings", "good morning": "Hamstrings",
    "calf raise": "Calves", "calf": "Calves",
    "plank": "Core", "crunch": "Core", "sit up": "Core", "ab roller": "Core",
    "leg raise": "Core", "russian twist": "Core", "abs": "Core",
    "wrist curl": "Forearms", "farmer": "Forearms", "grip": "Forearms",
  };

  function classifyExercise(name: string, target: string | null): string {
    // 1. Use the target field from the DB (most reliable)
    if (target) {
      const normalized = TARGET_NORMALIZE[target.toLowerCase().trim()];
      if (normalized) return normalized;
    }
    
    // 2. Fall back to exercise name keyword matching
    const nameStr = (name || "").toLowerCase();
    for (const [keyword, muscle] of Object.entries(EXERCISE_NAME_MAP)) {
      if (nameStr.includes(keyword)) return muscle;
    }
    
    return "Core"; // Last resort fallback
  }

  const distribution: Record<string, number> = {};
  for (const g of CANONICAL_GROUPS) {
    distribution[g] = 0;
  }

  if (exercises) {
    for (const ex of exercises) {
      const category = classifyExercise(ex.name, ex.target);

      // Count sets from current month only
      let numSets = 0;
      if (ex.gym_sets && ex.gym_sets.length > 0) {
        for (const setRecord of ex.gym_sets) {
          if (setRecord.created_at && new Date(setRecord.created_at) < new Date(monthStart)) {
            continue;
          }
          const logs = setRecord.logs;
          numSets += (logs && Array.isArray(logs) && logs.length > 0) ? logs.length : 1;
        }
      }

      if (distribution[category] !== undefined) {
        distribution[category] += numSets;
      }
    }
  }

  // Dynamic max based on actual data
  const maxSets = Math.max(...Object.values(distribution), 1);

  const colorMap: Record<string, string> = {
    Chest: 'bg-primary-container',
    Back: 'bg-secondary-container',
    Shoulders: 'bg-[#90caf9]',
    Biceps: 'bg-[#fed83a]',
    Triceps: 'bg-[#ffb4ab]',
    Quads: 'bg-[#a5d6a7]',
    Hamstrings: 'bg-[#ce93d8]',
    Calves: 'bg-[#80cbc4]',
    Core: 'bg-outline',
    Forearms: 'bg-[#bcaaa4]',
    Glutes: 'bg-[#f48fb1]',
  };

  // Only return muscles that have sets > 0
  return Object.entries(distribution)
    .filter(([, sets]) => sets > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, sets]) => ({
      name,
      sets,
      max: maxSets,
      color: colorMap[name] || 'bg-outline',
    }));
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
    { day_label: "MON", type: "Push A", is_active: true, order_index: 1 },
    { day_label: "TUE", type: "Pull A", is_active: false, order_index: 2 },
    { day_label: "WED", type: "Legs + Abs", is_active: false, order_index: 3 },
    { day_label: "THU", type: "Rest", is_active: false, order_index: 4 },
    { day_label: "FRI", type: "Push B", is_active: false, order_index: 5 },
    { day_label: "SAT", type: "Pull B", is_active: false, order_index: 6 },
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

export async function getConsistencyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from("gym_consistency_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });
    
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function toggleConsistencyDay(dateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  // Check if it exists
  const { data: existing } = await supabase
    .from("gym_consistency_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", dateStr)
    .single();
    
  if (existing) {
    // Toggle completed status
    await supabase
      .from("gym_consistency_logs")
      .update({ completed: !existing.completed })
      .eq("id", existing.id);
  } else {
    // Insert new
    await supabase
      .from("gym_consistency_logs")
      .insert([{
        user_id: user.id,
        date: dateStr,
        completed: true,
        cycle_id: 1 // Default to 1 for now
      }]);
  }
}

// --- PR TRACKING ---
export async function logExercisePR(exerciseName: string, weight: number, reps: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !exerciseName) return { isNewPR: false };

  // Get current PR
  const { data: currentPR } = await supabase
    .from("gym_exercise_prs")
    .select("*")
    .eq("user_id", user.id)
    .eq("exercise_name", exerciseName)
    .single();

  let isNewPR = false;
  if (!currentPR) {
    isNewPR = true;
    await supabase.from("gym_exercise_prs").insert([{
      user_id: user.id, exercise_name: exerciseName, max_weight: weight, max_reps: reps
    }]);
  } else {
    // Check if new PR
    // simple logic: if weight is higher, or weight is same and reps are higher
    if (weight > currentPR.max_weight || (weight === currentPR.max_weight && reps > currentPR.max_reps)) {
      isNewPR = true;
      await supabase.from("gym_exercise_prs").update({
        max_weight: weight, max_reps: reps, updated_at: new Date().toISOString()
      }).eq("id", currentPR.id);
    }
  }

  return { isNewPR };
}

export async function uploadGymPhoto(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("gym-photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("gym-photos")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // Valid for 10 years

  if (signedUrlError) throw signedUrlError;
  const url = signedUrlData.signedUrl;

  const { data: latestMetric } = await supabase
    .from("body_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (latestMetric) {
    await supabase.from("body_metrics").update({ photo_url: url }).eq("id", latestMetric.id);
  } else {
    await supabase.from("body_metrics").insert([{ user_id: user.id, photo_url: url }]);
  }

  return url;
}

export async function deleteGymPhoto() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: latestMetric } = await supabase
    .from("body_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!latestMetric || !latestMetric.photo_url) return;

  try {
    const urlObj = new URL(latestMetric.photo_url);
    const pathname = urlObj.pathname;
    const pathParts = pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];

    if (fileName) {
      await supabase.storage.from("gym-photos").remove([fileName]);
    }
  } catch (e) {
    console.error("Error parsing photo URL for deletion:", e);
  }

  await supabase.from("body_metrics").update({ photo_url: null }).eq("id", latestMetric.id);
}

export async function generateAndEmailCycleReport() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: logs } = await supabase
    .from("gym_consistency_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(28);
    
  const logData = logs ? JSON.stringify(logs) : "No data";

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `Analyze this 4-week gym consistency data and generate an encouraging, structured progress report in Markdown: ${logData}`;
  const result = await model.generateContent(prompt);
  const report = result.response.text();

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OS <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL],
        subject: "Gym Cycle Report",
        html: `<p>Your new cycle report is ready.</p><pre>${report}</pre>`,
      }),
    });
    if (!res.ok) {
        throw new Error("Failed to send email");
    }
  }

  return report;
}

// --- GYM EXTENSIONS ---

export async function getGymCycleInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { currentWeek: 1, cycleLength: 8 };

  const { data, error } = await supabase
    .from("gym_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return { currentWeek: 1, cycleLength: 8 };
  }

  const startDate = new Date(data.cycle_start_date);
  const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  return {
    currentWeek: diffWeeks === 0 ? 1 : diffWeeks,
    cycleLength: data.cycle_length_weeks
  };
}

export async function saveWorkoutAsTemplate(workoutDayId: string, templateName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch the exercises
  const { data: exercises } = await supabase
    .from("gym_exercises")
    .select("*")
    .eq("workout_day_id", workoutDayId)
    .order("order_index", { ascending: true });

  if (!exercises || exercises.length === 0) return;

  // Create the template
  const { data: template, error: tError } = await supabase
    .from("gym_workout_templates")
    .insert({ user_id: user.id, name: templateName })
    .select()
    .single();

  if (tError || !template) throw tError;

  // Prepare template exercises
  const templateExercises = [];
  for (const ex of exercises) {
    // get sets
    const { data: sets } = await supabase
      .from("gym_sets")
      .select("*")
      .eq("exercise_id", ex.id);

    const setsRepsString = (sets && sets.length > 0) ? `${sets[0].label} | ${sets[0].details}` : "3 Sets | 10 Reps";
    
    templateExercises.push({
      template_id: template.id,
      name: ex.name,
      sets_reps_string: setsRepsString,
      intensity: 'Moderate',
      order_index: ex.order_index
    });
  }

  await supabase.from("gym_workout_template_exercises").insert(templateExercises);
}

export async function getWorkoutTemplates() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("gym_workout_templates")
    .select("*, gym_workout_template_exercises(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function loadTemplateIntoWorkout(templateId: string, workoutDayId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Get the template exercises
  const { data: tExercises, error: teError } = await supabase
    .from("gym_workout_template_exercises")
    .select("*")
    .eq("template_id", templateId)
    .order("order_index", { ascending: true });

  if (teError || !tExercises) throw teError;

  // 2. Delete existing exercises (this cascades to gym_sets in a real schema, but here we might need to delete manually, or trust CASCADE)
  // Let's manually delete sets first just in case
  const { data: oldExercises } = await supabase
    .from("gym_exercises")
    .select("id")
    .eq("workout_day_id", workoutDayId);

  if (oldExercises && oldExercises.length > 0) {
    const oldIds = oldExercises.map(e => e.id);
    await supabase.from("gym_sets").delete().in("exercise_id", oldIds);
    await supabase.from("gym_exercises").delete().in("id", oldIds);
  }

  // 3. Insert new exercises
  for (const tex of tExercises) {
    const { data: newEx } = await supabase
      .from("gym_exercises")
      .insert({
        user_id: user.id,
        workout_day_id: workoutDayId,
        order_index: tex.order_index,
        name: tex.name,
        target: "Various" // Simplified
      })
      .select()
      .single();

    if (newEx) {
      const parts = tex.sets_reps_string.split(" | ");
      const label = parts[0] || "3 Sets";
      const details = parts[1] || "10 Reps";
      await supabase.from("gym_sets").insert({
        user_id: user.id,
        exercise_id: newEx.id,
        order_index: 1,
        label,
        details
      });
    }
  }
}

export async function getGoogleFitStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { connected: false };

  const { data } = await supabase
    .from("google_fit_tokens")
    .select("expires_at, updated_at")
    .eq("user_id", user.id)
    .single();

  if (!data) return { connected: false };

  return {
    connected: true,
    lastSync: data.updated_at,
    tokenExpired: new Date(data.expires_at) < new Date(),
  };
}

async function refreshGoogleToken(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string) {
  const { data: tokenRecord } = await supabase
    .from("google_fit_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!tokenRecord) throw new Error("No Google Fit connection found");

  // Check if token is still valid
  if (new Date(tokenRecord.expires_at) > new Date()) {
    return tokenRecord.access_token;
  }

  // Refresh the token
  if (!tokenRecord.refresh_token) {
    throw new Error("No refresh token available. Please reconnect Google Fit.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
      client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
      refresh_token: tokenRecord.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh Google token. Please reconnect.");
  }

  const tokens = await res.json();

  await supabase
    .from("google_fit_tokens")
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return tokens.access_token;
}

export async function syncGoogleFit() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const accessToken = await refreshGoogleToken(supabase, user.id);

  // Fetch data for the last 7 days aligned to midnight
  const now = new Date();
  const endTimeMillis = now.getTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0); // Align to local midnight
  start.setDate(start.getDate() - 7);
  const startTimeMillis = start.getTime();

  const datasetUrl = `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`;

  const body = {
    aggregateBy: [
      { dataTypeName: "com.google.step_count.delta" },
      { dataTypeName: "com.google.calories.expended" },
      { dataTypeName: "com.google.heart_rate.bpm" },
      { dataTypeName: "com.google.weight" },
    ],
    bucketByTime: { durationMillis: 86400000 }, // 1 day
    startTimeMillis,
    endTimeMillis,
  };

  const res = await fetch(datasetUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Google Fit API error:", errText);
    throw new Error("Failed to fetch Google Fit data");
  }

  const data = await res.json();

  // Track the latest weight across all buckets for updating body_metrics at the end
  let latestWeight = 0;
  let latestWeightDate = "";

  // Process each day bucket
  for (const bucket of data.bucket || []) {
    const dateMs = parseInt(bucket.startTimeMillis);
    
    // Format locally to avoid UTC shifting issues (yesterday's date)
    const d = new Date(dateMs);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let steps = 0;
    let calories = 0;
    let heartRateAvg = 0;
    let heartRateMax = 0;
    let weight = 0;

    // Datasets come back in the SAME order as aggregateBy:
    // [0] = steps, [1] = calories, [2] = heart_rate, [3] = weight
    const datasets = bucket.dataset || [];
    
    // Steps (index 0)
    for (const point of datasets[0]?.point || []) {
      steps += point.value?.[0]?.intVal || 0;
    }
    // Calories (index 1)
    for (const point of datasets[1]?.point || []) {
      calories += point.value?.[0]?.fpVal || 0;
    }
    // Heart rate (index 2)
    for (const point of datasets[2]?.point || []) {
      heartRateAvg = point.value?.[0]?.fpVal || 0;
      heartRateMax = Math.max(heartRateMax, point.value?.[1]?.fpVal || point.value?.[0]?.fpVal || 0);
    }
    // Weight (index 3)
    for (const point of datasets[3]?.point || []) {
      weight = point.value?.[0]?.fpVal || 0;
    }

    console.log(`[Google Fit] ${date}: steps=${steps}, cal=${Math.round(calories)}, weight=${weight}`);

    // Upsert into google_fit_data
    await supabase
      .from("google_fit_data")
      .upsert({
        user_id: user.id,
        date,
        steps,
        calories_burned: Math.round(calories),
        heart_rate_avg: heartRateAvg ? Math.round(heartRateAvg) : null,
        heart_rate_max: heartRateMax ? Math.round(heartRateMax) : null,
        weight: weight ? parseFloat(weight.toFixed(1)) : null,
      }, { onConflict: 'user_id,date' });

    // Track the latest weight we've seen
    if (weight > 0) {
      latestWeight = weight;
      latestWeightDate = date;
    }
  }

  // After processing all buckets, update body_metrics with the latest weight from Google Fit
  if (latestWeight > 0) {
    console.log(`[Google Fit] Updating body_metrics with latest weight: ${latestWeight}kg from ${latestWeightDate}`);
    
    // Get the most recent body_metrics row (regardless of date)
    const { data: latestMetric } = await supabase
      .from("body_metrics")
      .select("id, weight_value, body_fat_value, body_fat_unit, body_fat_delta, body_fat_progress")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const prevWeight = latestMetric?.weight_value || 0;
    const delta = prevWeight > 0 ? (latestWeight - prevWeight) : 0;
    const deltaStr = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}kg`;

    if (latestMetric) {
      // Update the latest body_metrics row with the new weight
      await supabase.from("body_metrics").update({
        weight_value: parseFloat(latestWeight.toFixed(1)),
        weight_unit: "kg",
        weight_delta: deltaStr,
      }).eq("id", latestMetric.id);
    } else {
      // No body_metrics row exists at all, create one
      await supabase.from("body_metrics").insert({
        user_id: user.id,
        date: latestWeightDate,
        weight_value: parseFloat(latestWeight.toFixed(1)),
        weight_unit: "kg",
        weight_delta: deltaStr,
        body_fat_value: 0,
        body_fat_unit: "%",
        body_fat_delta: "0%",
        body_fat_progress: 0,
      });
    }
  }

  // Update last sync time
  await supabase
    .from("google_fit_tokens")
    .update({ updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return { success: true, days: data.bucket?.length || 0 };
}

export async function getGoogleFitWeeklyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data } = await supabase
    .from("google_fit_data")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  return data || [];
}

// Legacy function kept for backward compatibility
export async function importHealthData() {
  return syncGoogleFit();
}

