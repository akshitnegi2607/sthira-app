/**
 * Sthira — Exercise Substitution & Muscle Mapping Service
 * Enables instant equipment or movement substitutions during workouts
 * while retaining training intent and muscle stimulus.
 */

import { Exercise } from '../types/database';

export interface ExerciseSubstituteOption {
  exercise: Exercise;
  reason: 'explicit_match' | 'same_muscle' | 'same_category';
  recommendedStartingWeightKg: number;
}

/**
 * Maps primary muscles and workout categories to general joint / body areas
 * for cross-referencing with pain and fatigue tracking.
 */
export function getAssociatedBodyArea(primaryMuscle: string, category: string): string {
  const muscle = (primaryMuscle || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (muscle.includes('deltoid') || cat.includes('shoulder') || muscle.includes('rotator')) {
    return 'Shoulder';
  }
  if (muscle.includes('pectoral') || cat.includes('chest')) {
    return 'Shoulder'; // Bench/press commonly stresses anterior shoulder
  }
  if (muscle.includes('triceps') || muscle.includes('biceps') || cat.includes('arm')) {
    return 'Elbow';
  }
  if (muscle.includes('erector') || muscle.includes('lower back') || muscle.includes('spine')) {
    return 'Lower Back';
  }
  if (muscle.includes('quadriceps') || muscle.includes('hamstring') || cat.includes('leg')) {
    return 'Knee';
  }
  if (muscle.includes('glute') || cat.includes('hip')) {
    return 'Hip';
  }
  if (muscle.includes('calf') || muscle.includes('gastrocnemius') || muscle.includes('soleus')) {
    return 'Ankle';
  }
  if (muscle.includes('trap') || muscle.includes('cervical')) {
    return 'Neck';
  }
  return 'General';
}

/**
 * Finds sensible substitution options for a given exercise.
 */
export function getSubstitutesForExercise(
  currentExercise: Exercise,
  allExercises: Exercise[]
): ExerciseSubstituteOption[] {
  const result: ExerciseSubstituteOption[] = [];
  const addedIds = new Set<string>([currentExercise.id]);

  // 1. Check explicit substitutions listed in exercise data
  if (currentExercise.substitutions) {
    const declaredNames = currentExercise.substitutions
      .split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);

    for (const name of declaredNames) {
      const match = allExercises.find(
        (ex) =>
          !addedIds.has(ex.id) &&
          (ex.name.toLowerCase() === name ||
            ex.name.toLowerCase().includes(name) ||
            name.includes(ex.name.toLowerCase()))
      );

      if (match) {
        addedIds.add(match.id);
        result.push({
          exercise: match,
          reason: 'explicit_match',
          recommendedStartingWeightKg: match.current_recommended_weight_kg ?? match.starting_weight_kg ?? 15,
        });
      }
    }
  }

  // 2. Add exercises targeting the exact same primary muscle
  const sameMuscle = allExercises.filter(
    (ex) =>
      !addedIds.has(ex.id) &&
      ex.primary_muscle.toLowerCase() === currentExercise.primary_muscle.toLowerCase()
  );

  for (const ex of sameMuscle) {
    addedIds.add(ex.id);
    result.push({
      exercise: ex,
      reason: 'same_muscle',
      recommendedStartingWeightKg: ex.current_recommended_weight_kg ?? ex.starting_weight_kg ?? 15,
    });
  }

  // 3. Add exercises in the same category
  const sameCategory = allExercises.filter(
    (ex) =>
      !addedIds.has(ex.id) &&
      ex.category.toLowerCase() === currentExercise.category.toLowerCase()
  );

  for (const ex of sameCategory) {
    addedIds.add(ex.id);
    result.push({
      exercise: ex,
      reason: 'same_category',
      recommendedStartingWeightKg: ex.current_recommended_weight_kg ?? ex.starting_weight_kg ?? 15,
    });
  }

  return result;
}
