-- Migration 009: Seed Gym Routine
DO $$
DECLARE
  v_user_id UUID;
  v_workout_day_id UUID;
  v_exercise_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users';
  END IF;

  -- Clear existing gym data to start fresh
  DELETE FROM gym_weekly_splits WHERE user_id = v_user_id;
  DELETE FROM gym_workout_days WHERE user_id = v_user_id;

  -- =========================================================================
  -- WEEKLY SPLITS (Starting Monday)
  -- =========================================================================
  INSERT INTO gym_weekly_splits (user_id, day_label, type, is_active, order_index) VALUES
  (v_user_id, 'MON', 'Push A', TRUE, 1),
  (v_user_id, 'TUE', 'Pull A', FALSE, 2),
  (v_user_id, 'WED', 'Legs + Abs', FALSE, 3),
  (v_user_id, 'THU', 'Rest', FALSE, 4),
  (v_user_id, 'FRI', 'Push B', FALSE, 5),
  (v_user_id, 'SAT', 'Pull B', FALSE, 6),
  (v_user_id, 'SUN', 'Rest', FALSE, 7);

  -- =========================================================================
  -- PUSH A (Monday)
  -- =========================================================================
  INSERT INTO gym_workout_days (user_id, day_id, title, duration, intensity) 
  VALUES (v_user_id, 'MON', 'Push A (Chest & Triceps)', '60-75 MIN', 'High') 
  RETURNING id INTO v_workout_day_id;

  -- Incline DB Chest Press
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '1', 'Incline DB Chest Press', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '4 Sets', '8-10 Reps', 1);

  -- Barbell Press (Smith Machine)
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '2', 'Barbell Press (Smith Machine)', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '8-10 Reps', 2);

  -- Pec Deck Fly
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '3', 'Pec Deck Fly', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12-15 Reps', 3);

  -- Cable Fly (lower chest)
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '4', 'Cable Fly (lower chest)', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12-15 Reps', 4);

  -- DB Shoulder Press
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '5', 'DB Shoulder Press', 'Shoulders') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '10 Reps (If time permits)', 5);

  -- Lateral Raise
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '6', 'Lateral Raise', 'Shoulders') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12-15 Reps (If time permits)', 6);

  -- Tricep Pushdown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '7', 'Tricep Pushdown', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps', 7);

  -- Overhead Tricep Extension
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '8', 'Overhead Tricep Extension', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps', 8);

  -- Incline DB Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '9', 'Incline DB Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '12 Reps (Light, quick)', 9);


  -- =========================================================================
  -- PULL A (Tuesday)
  -- =========================================================================
  INSERT INTO gym_workout_days (user_id, day_id, title, duration, intensity) 
  VALUES (v_user_id, 'TUE', 'Pull A (Back & Biceps)', '60-75 MIN', 'High') 
  RETURNING id INTO v_workout_day_id;

  -- Lat Pulldown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '1', 'Lat Pulldown', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '4 Sets', '8-10 Reps', 1);

  -- Seated Cable Row
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '2', 'Seated Cable Row', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10 Reps', 2);

  -- Bent Over DB Row
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '3', 'Bent Over DB Row', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10 Reps', 3);

  -- Wide Grip Row
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '4', 'Wide Grip Row', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '10-12 Reps', 4);

  -- Reverse Pec Deck
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '5', 'Reverse Pec Deck', 'Rear Delts') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '15 Reps', 5);

  -- Face Pull
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '6', 'Face Pull', 'Rear Delts/Upper Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '15 Reps', 6);

  -- Shrugs
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '7', 'Shrugs', 'Traps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '12 Reps', 7);

  -- Barbell/DB Bicep Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '8', 'Barbell/DB Bicep Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10-12 Reps', 8);

  -- Hammer Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '9', 'Hammer Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps', 9);

  -- Preacher Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '10', 'Preacher Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '12 Reps', 10);

  -- Rope Pushdown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '11', 'Rope Pushdown', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '15 Reps (Light, quick)', 11);


  -- =========================================================================
  -- LEGS + ABS (Wednesday)
  -- =========================================================================
  INSERT INTO gym_workout_days (user_id, day_id, title, duration, intensity) 
  VALUES (v_user_id, 'WED', 'Legs + Abs', '60-75 MIN', 'High') 
  RETURNING id INTO v_workout_day_id;

  -- Squat
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '1', 'Squat', 'Legs') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '4 Sets', '8-10 Reps', 1);

  -- Leg Extension
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '2', 'Leg Extension', 'Quads') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12-15 Reps', 2);

  -- Leg Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '3', 'Leg Curl', 'Hamstrings') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12-15 Reps', 3);

  -- Leg Press
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '4', 'Leg Press', 'Quads/Glutes') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '12 Reps', 4);

  -- Calf Raises
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '5', 'Calf Raises', 'Calves') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '15-20 Reps', 5);

  -- Abductors/Adductors
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '6', 'Abductors/Adductors', 'Legs') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '15 Reps (1x/week is enough)', 6);

  -- Abs (sit-ups / crunches)
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '7', 'Abs (sit-ups / crunches)', 'Core') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '12-15 Reps', 7);

  -- =========================================================================
  -- PUSH B (Friday)
  -- =========================================================================
  INSERT INTO gym_workout_days (user_id, day_id, title, duration, intensity) 
  VALUES (v_user_id, 'FRI', 'Push B (Chest & Triceps)', '60 MIN', 'High') 
  RETURNING id INTO v_workout_day_id;

  -- Incline DB/Barbell Press
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '1', 'Incline DB/Barbell Press', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '4 Sets', '8-10 Reps', 1);

  -- Machine Chest Press
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '2', 'Machine Chest Press', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10 Reps', 2);

  -- Decline DB Press / Cable Fly
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '3', 'Decline DB Press / Cable Fly', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps', 3);

  -- DB Fly
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '4', 'DB Fly', 'Chest') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2-3 Sets', '12-15 Reps', 4);

  -- Single Arm Tricep Pushdown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '5', 'Single Arm Tricep Pushdown', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps each arm', 5);

  -- Skull Crushers (EZ bar/DB)
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '6', 'Skull Crushers (EZ bar/DB)', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10-12 Reps', 6);

  -- Bench Dips or Close-Grip Push-up
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '7', 'Bench Dips / Close-Grip Push-up', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '12-15 Reps', 7);

  -- Hammer Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '8', 'Hammer Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '12 Reps (Light, quick)', 8);

  -- =========================================================================
  -- PULL B (Saturday)
  -- =========================================================================
  INSERT INTO gym_workout_days (user_id, day_id, title, duration, intensity) 
  VALUES (v_user_id, 'SAT', 'Pull B (Back & Biceps)', '60 MIN', 'High') 
  RETURNING id INTO v_workout_day_id;

  -- Close Grip Lat Pulldown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '1', 'Close Grip Lat Pulldown', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '4 Sets', '8-10 Reps', 1);

  -- Wide Grip Seated Row
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '2', 'Wide Grip Seated Row', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10 Reps', 2);

  -- Bent Over DB Row
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '3', 'Bent Over DB Row', 'Back') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10 Reps', 3);

  -- Cable Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '4', 'Cable Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '12 Reps', 4);

  -- Preacher Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '5', 'Preacher Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '3 Sets', '10-12 Reps', 5);

  -- Concentration Curl or Cross-Body Hammer Curl
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '6', 'Concentration / Cross-Body Hammer Curl', 'Biceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '12 Reps each arm', 6);

  -- Rope Pushdown
  INSERT INTO gym_exercises (user_id, workout_day_id, order_index, name, target) VALUES (v_user_id, v_workout_day_id, '7', 'Rope Pushdown', 'Triceps') RETURNING id INTO v_exercise_id;
  INSERT INTO gym_sets (user_id, exercise_id, label, details, order_index) VALUES (v_user_id, v_exercise_id, '2 Sets', '15 Reps (Light, quick)', 7);

END $$;
