import { supabase } from '../../../lib/supabase';
import type { WorkoutTemplate } from '../types';
import type { Database } from '../../../types/database';

type ProfileInsert = Database['public']['Tables']['profile']['Insert'];
type WeightLogInsert = Database['public']['Tables']['weight_logs']['Insert'];
type PlanInsert = Database['public']['Tables']['plans']['Insert'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];

export const createUserProfile = async (profileData: ProfileInsert) => {
  const { data, error } = await supabase
    .from('profile')
    .upsert(profileData, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return data;
};

export const createInitialWeightLog = async (weightData: WeightLogInsert) => {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(weightData, {
      onConflict: 'user_id,measured_at',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create weight log: ${error.message}`);
  }

  return data;
};

export const createWorkoutPlan = async ({
  user_id,
  template,
  startDate
}: {
  user_id: string;
  template: WorkoutTemplate;
  startDate: Date;
}) => {
  // 1. Create the plan
  const planData: PlanInsert = {
    user_id,
    goal_days_per_week: template.daysPerWeek,
    plan_scope: 'weekly',
    start_date: startDate.toISOString().split('T')[0],
    meta: {
      template_id: template.id,
      template_name: template.name,
      created_from_onboarding: true
    }
  };

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert(planData)
    .select()
    .single();

  if (planError) {
    throw new Error(`Failed to create workout plan: ${planError.message}`);
  }

  // 2. Create workouts for the first week
  const workouts = generateFirstWeekWorkouts(user_id, plan.id, template, startDate);
  
  const { data: createdWorkouts, error: workoutsError } = await supabase
    .from('workouts')
    .insert(workouts)
    .select();

  if (workoutsError) {
    throw new Error(`Failed to create workouts: ${workoutsError.message}`);
  }

  // 3. Create exercises for each workout
  for (const workout of createdWorkouts) {
    const workoutTemplate = template.workouts.find(w => w.name === workout.title);
    if (workoutTemplate) {
      const exercises: ExerciseInsert[] = workoutTemplate.exercises.map((exercise, index) => ({
        user_id,
        workout_id: workout.id,
        slug: exercise.slug,
        name_en: exercise.name_en,
        name_es: exercise.name_es,
        machine_brand: exercise.equipment || null,
        order_index: index,
        target_sets: exercise.target_sets,
        target_reps: exercise.target_reps
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercises);

      if (exercisesError) {
        throw new Error(`Failed to create exercises for workout ${workout.title}: ${exercisesError.message}`);
      }
    }
  }

  return { plan, workouts: createdWorkouts };
};

const generateFirstWeekWorkouts = (
  user_id: string,
  plan_id: number,
  template: WorkoutTemplate,
  startDate: Date
): WorkoutInsert[] => {
  const workouts: WorkoutInsert[] = [];
  const currentDate = new Date(startDate);
  
  // Start from tomorrow (or today if it's early in the day)
  const now = new Date();
  if (now.getHours() < 6) {
    // If it's before 6 AM, start today
    currentDate.setTime(now.getTime());
  } else {
    // Otherwise start tomorrow
    currentDate.setTime(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // Generate workouts for the next 7 days based on the template
  const daysToSchedule = Math.min(template.daysPerWeek, 7);
  let workoutIndex = 0;

  for (let day = 0; day < 7 && workoutIndex < daysToSchedule; day++) {
    const workoutDate = new Date(currentDate);
    workoutDate.setDate(currentDate.getDate() + day);
    
    // Skip weekends for 1-3 day plans, or distribute evenly
    if (shouldScheduleWorkout(day, template.daysPerWeek)) {
      const templateWorkout = template.workouts[workoutIndex % template.workouts.length];
      
      workouts.push({
        user_id,
        plan_id,
        date: workoutDate.toISOString().split('T')[0],
        title: templateWorkout.name,
        is_completed: false,
        notes: `Generated from ${template.name} template`
      });
      
      workoutIndex++;
    }
  }

  return workouts;
};

const shouldScheduleWorkout = (dayIndex: number, daysPerWeek: number): boolean => {
  // dayIndex: 0 = today/tomorrow, 1 = next day, etc.
  // This is a simple distribution algorithm
  
  switch (daysPerWeek) {
    case 1:
      return dayIndex === 1; // Schedule for tomorrow
    case 2:
      return dayIndex === 1 || dayIndex === 4; // Mon, Thu pattern
    case 3:
      return dayIndex === 1 || dayIndex === 3 || dayIndex === 5; // Mon, Wed, Fri
    case 4:
      return dayIndex === 1 || dayIndex === 2 || dayIndex === 4 || dayIndex === 5; // Mon, Tue, Thu, Fri
    case 5:
      return dayIndex >= 1 && dayIndex <= 5; // Mon-Fri
    case 6:
      return dayIndex >= 1 && dayIndex <= 6; // Mon-Sat
    case 7:
      return true; // Every day
    default:
      return false;
  }
};