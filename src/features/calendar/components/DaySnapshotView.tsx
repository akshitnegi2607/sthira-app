/**
 * Sthira — Day Snapshot View Component
 * Detailed daily breakdown rendering Exercises with exact sets and weights,
 * Nutrition macros & meal items, and Journal reflections & readiness.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { DaySnapshot } from '@/services/calendarHistoryService';

interface DaySnapshotViewProps {
  snapshot: DaySnapshot;
  onLogWorkoutForDate?: (date: string) => void;
  onOpenJournalForDate?: (date: string) => void;
  onOpenNutritionForDate?: (date: string) => void;
}

export const DaySnapshotView: React.FC<DaySnapshotViewProps> = ({
  snapshot,
  onLogWorkoutForDate,
  onOpenJournalForDate,
  onOpenNutritionForDate,
}) => {
  const { colors, isDark } = useAppTheme();

  const {
    date,
    formattedDate,
    dayOfWeekName,
    isToday,
    scaleWeightKg,
    ekadashiEvent,
    workout,
    nutrition,
    journal,
  } = snapshot;

  const calPct = Math.min(100, Math.round((nutrition.caloriesConsumed / (nutrition.calorieTarget || 2450)) * 100));
  const protPct = Math.min(100, Math.round((nutrition.proteinConsumed / (nutrition.proteinTarget || 120)) * 100));

  return (
    <View style={styles.container}>
      {/* 1. Day Header Strip */}
      <View
        style={[
          styles.dayHeaderCard,
          { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.dayOfWeekText, { color: colors.accent }]}>
            {dayOfWeekName.toUpperCase()} {isToday ? '• TODAY' : ''}
          </Text>
          <Text style={[styles.dateTitleText, { color: colors.text }]}>{formattedDate}</Text>
        </View>

        <View style={styles.headerRightBadges}>
          {scaleWeightKg !== null && (
            <View
              style={[
                styles.badgePill,
                { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)' },
              ]}>
              <Ionicons name="scale-outline" size={12} color={colors.protein} />
              <Text style={[styles.badgeText, { color: colors.protein }]}>{scaleWeightKg} kg</Text>
            </View>
          )}

          {ekadashiEvent && (
            <View style={[styles.badgePill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="sparkles" size={11} color="#F59E0B" />
              <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{ekadashiEvent.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. EXERCISE & WORKOUT PERFORMANCE CARD */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: workout.hasWorkout ? colors.accent : colors.cardBorder,
          },
        ]}>
        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View
              style={[
                styles.sectionIconCircle,
                {
                  backgroundColor: workout.hasWorkout
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(148, 163, 184, 0.12)',
                },
              ]}>
              <Ionicons
                name="barbell-outline"
                size={16}
                color={workout.hasWorkout ? colors.accent : colors.textMuted}
              />
            </View>
            <View>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {workout.primaryTitle}
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                {workout.hasWorkout
                  ? `${workout.durationMinutes} mins • ${workout.completedSetsCount} sets completed`
                  : 'Training & Resistance Log'}
              </Text>
            </View>
          </View>

          {workout.hasWorkout && (
            <View
              style={[
                styles.volumeBadge,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' },
              ]}>
              <Text style={[styles.volumeBadgeText, { color: colors.accent }]}>
                {workout.totalVolumeKg.toLocaleString()} kg lifted
              </Text>
            </View>
          )}
        </View>

        {/* Detailed Exercise Sets */}
        {workout.hasWorkout && workout.sessions.length > 0 ? (
          <View style={styles.exerciseList}>
            {workout.sessions.map((sess) => (
              <View key={sess.session.id}>
                {sess.exercises.map((item, exIdx) => {
                  const completedSets = item.sets.filter((s) => s.is_completed === 1);
                  return (
                    <View
                      key={item.workoutExercise.id}
                      style={[
                        styles.exerciseItemBox,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(0, 0, 0, 0.02)',
                          borderColor: colors.cardBorder,
                        },
                      ]}>
                      {/* Exercise Header */}
                      <View style={styles.exerciseItemHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.exerciseName, { color: colors.text }]}>
                            {exIdx + 1}. {item.exercise.name}
                          </Text>
                          <Text style={[styles.exerciseMuscle, { color: colors.textMuted }]}>
                            {item.exercise.primary_muscle} • {item.exercise.target_rep_range} reps
                          </Text>
                        </View>
                        <Text style={[styles.setsSummaryText, { color: colors.textSecondary }]}>
                          {completedSets.length} sets
                        </Text>
                      </View>

                      {/* Sets Table */}
                      <View style={styles.setsTable}>
                        <View style={styles.setsTableHeader}>
                          <Text style={[styles.setTh, { width: 34, color: colors.textMuted }]}>SET</Text>
                          <Text style={[styles.setTh, { flex: 1, color: colors.textMuted }]}>WEIGHT</Text>
                          <Text style={[styles.setTh, { width: 60, color: colors.textMuted, textAlign: 'center' }]}>REPS</Text>
                          <Text style={[styles.setTh, { width: 44, color: colors.textMuted, textAlign: 'center' }]}>RIR</Text>
                        </View>

                        {item.sets.map((set) => (
                          <View
                            key={set.id}
                            style={[
                              styles.setRow,
                              set.is_completed === 1 && {
                                backgroundColor: isDark
                                  ? 'rgba(16, 185, 129, 0.08)'
                                  : 'rgba(16, 185, 129, 0.04)',
                              },
                            ]}>
                            <Text style={[styles.setColNumber, { color: colors.textMuted }]}>
                              {set.set_number}
                            </Text>
                            <Text style={[styles.setColWeight, { color: colors.text }]}>
                              <Text style={{ fontWeight: '800' }}>{set.weight_kg}</Text> kg
                            </Text>
                            <Text style={[styles.setColReps, { color: colors.text }]}>
                              {set.reps} reps
                            </Text>
                            <Text style={[styles.setColRir, { color: colors.textMuted }]}>
                              {set.rir !== null ? `@${set.rir}` : '—'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}

                {/* Perceived Exertion / Notes */}
                {sess.session.difficulty_perceived ? (
                  <View style={styles.postWorkoutNotesRow}>
                    <Text style={[styles.postWorkoutNotesLabel, { color: colors.textMuted }]}>
                      Perceived Exertion:
                    </Text>
                    <Text style={[styles.postWorkoutNotesVal, { color: colors.accent }]}>
                      {sess.session.difficulty_perceived}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCardBox}>
            <Ionicons name="barbell-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>
              No workout was recorded on this date.
            </Text>
            {onLogWorkoutForDate && (
              <TouchableOpacity
                onPress={() => onLogWorkoutForDate(date)}
                style={[
                  styles.quickActionBtn,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <Ionicons name="add" size={14} color={colors.accent} />
                <Text style={[styles.quickActionBtnText, { color: colors.accent }]}>
                  Log / Catch Up Workout
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* 3. DAILY NUTRITION & MEALS CARD */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: nutrition.hasNutrition ? '#F97316' : colors.cardBorder,
          },
        ]}>
        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View
              style={[
                styles.sectionIconCircle,
                {
                  backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.12)',
                },
              ]}>
              <Ionicons name="restaurant-outline" size={16} color="#F97316" />
            </View>
            <View>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Daily Nutrition</Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                {nutrition.hasNutrition
                  ? `${nutrition.meals.length} meal entries logged`
                  : 'Calorie & Macro Tracker'}
              </Text>
            </View>
          </View>

          {nutrition.waterLiters > 0 && (
            <View style={styles.waterPill}>
              <Ionicons name="water" size={12} color="#38BDF8" />
              <Text style={styles.waterText}>{nutrition.waterLiters} L</Text>
            </View>
          )}
        </View>

        {/* Macro Summary Strip */}
        <View style={styles.macroStrip}>
          <View style={[styles.macroPillBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <Text style={[styles.macroPillLabel, { color: colors.textMuted }]}>CALORIES</Text>
            <Text style={[styles.macroPillVal, { color: colors.text }]}>
              {nutrition.caloriesConsumed}{' '}
              <Text style={{ fontSize: 10, color: colors.textMuted }}>/ {nutrition.calorieTarget}</Text>
            </Text>
            <View style={styles.macroProgressBarBg}>
              <View
                style={[
                  styles.macroProgressBarFill,
                  { width: `${calPct}%`, backgroundColor: colors.calories },
                ]}
              />
            </View>
          </View>

          <View style={[styles.macroPillBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <Text style={[styles.macroPillLabel, { color: colors.textMuted }]}>PROTEIN</Text>
            <Text style={[styles.macroPillVal, { color: colors.protein }]}>
              {nutrition.proteinConsumed}g{' '}
              <Text style={{ fontSize: 10, color: colors.textMuted }}>/ {nutrition.proteinTarget}g</Text>
            </Text>
            <View style={styles.macroProgressBarBg}>
              <View
                style={[
                  styles.macroProgressBarFill,
                  { width: `${protPct}%`, backgroundColor: colors.protein },
                ]}
              />
            </View>
          </View>

          <View style={[styles.macroPillBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
            <Text style={[styles.macroPillLabel, { color: colors.textMuted }]}>CARBS / FAT</Text>
            <Text style={[styles.macroPillVal, { color: colors.text }]}>
              {nutrition.carbsConsumed}g / {nutrition.fatConsumed}g
            </Text>
            <Text style={[styles.macroSubText, { color: colors.textMuted }]}>Balanced split</Text>
          </View>
        </View>

        {/* Meals Logged List */}
        {nutrition.meals.length > 0 ? (
          <View style={styles.mealsList}>
            {nutrition.meals.map((meal) => (
              <View
                key={meal.id}
                style={[
                  styles.mealItemBox,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <View style={styles.mealItemHeader}>
                  <Text style={[styles.mealSlotLabel, { color: colors.accent }]}>
                    {meal.meal_type.toUpperCase()}
                  </Text>
                  <Text style={[styles.mealCalText, { color: colors.text }]}>
                    {meal.total_calories} kcal • {meal.total_protein}g protein
                  </Text>
                </View>
                <Text style={[styles.mealRawText, { color: colors.textSecondary }]}>
                  {meal.raw_text}
                </Text>

                {/* Sub-items */}
                {meal.items && meal.items.length > 0 && (
                  <View style={styles.mealSubItemsRow}>
                    {meal.items.map((item, idx) => (
                      <Text key={idx} style={[styles.mealSubItemTag, { color: colors.textMuted }]}>
                        • {item.food_name} ({item.quantity} {item.unit})
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCardBox}>
            <Ionicons name="restaurant-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>
              No meals logged on this date.
            </Text>
          </View>
        )}
      </View>

      {/* 4. JOURNAL, RECOVERY & MINDSET CARD */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: journal.hasJournal ? '#8B5CF6' : colors.cardBorder,
          },
        ]}>
        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View
              style={[
                styles.sectionIconCircle,
                {
                  backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.12)',
                },
              ]}>
              <Ionicons name="book-outline" size={16} color="#8B5CF6" />
            </View>
            <View>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Journal & Mindset</Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                {journal.sleepHours ? `${journal.sleepHours} hrs sleep logged` : 'Readiness & Reflections'}
              </Text>
            </View>
          </View>

          {journal.readinessScore !== null && (
            <View
              style={[
                styles.badgePill,
                { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.12)' },
              ]}>
              <Ionicons name="pulse" size={12} color="#8B5CF6" />
              <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>
                Readiness: {journal.readinessScore}%
              </Text>
            </View>
          )}
        </View>

        {/* Ratings Breakdown Grid */}
        {(journal.energyRating !== null || journal.sorenessRating !== null) && (
          <View style={styles.ratingsRow}>
            {journal.energyRating !== null && (
              <View style={styles.ratingCol}>
                <Text style={[styles.ratingLabel, { color: colors.textMuted }]}>ENERGY</Text>
                <Text style={[styles.ratingVal, { color: colors.text }]}>{journal.energyRating}/10</Text>
              </View>
            )}
            {journal.sorenessRating !== null && (
              <View style={styles.ratingCol}>
                <Text style={[styles.ratingLabel, { color: colors.textMuted }]}>SORENESS</Text>
                <Text style={[styles.ratingVal, { color: colors.text }]}>{journal.sorenessRating}/10</Text>
              </View>
            )}
            {journal.moodRating !== null && (
              <View style={styles.ratingCol}>
                <Text style={[styles.ratingLabel, { color: colors.textMuted }]}>MOOD</Text>
                <Text style={[styles.ratingVal, { color: colors.text }]}>{journal.moodRating}/10</Text>
              </View>
            )}
            {journal.stressRating !== null && (
              <View style={styles.ratingCol}>
                <Text style={[styles.ratingLabel, { color: colors.textMuted }]}>STRESS</Text>
                <Text style={[styles.ratingVal, { color: colors.text }]}>{journal.stressRating}/10</Text>
              </View>
            )}
          </View>
        )}

        {/* Morning & Evening Notes */}
        {journal.morningEntry?.notes ? (
          <View style={styles.journalNoteBox}>
            <View style={styles.journalNoteHeader}>
              <Ionicons name="sunny-outline" size={13} color="#F59E0B" />
              <Text style={[styles.journalNoteType, { color: colors.textSecondary }]}>
                Morning Intentions
              </Text>
            </View>
            <Text style={[styles.journalNoteText, { color: colors.text }]}>
              "{journal.morningEntry.notes}"
            </Text>
          </View>
        ) : null}

        {journal.eveningEntry?.notes ? (
          <View style={styles.journalNoteBox}>
            <View style={styles.journalNoteHeader}>
              <Ionicons name="moon-outline" size={13} color="#818CF8" />
              <Text style={[styles.journalNoteType, { color: colors.textSecondary }]}>
                Evening Reflection
              </Text>
            </View>
            <Text style={[styles.journalNoteText, { color: colors.text }]}>
              "{journal.eveningEntry.notes}"
            </Text>
          </View>
        ) : null}

        {/* Sentiment tags */}
        {journal.sentimentTags.length > 0 && (
          <View style={styles.tagsRow}>
            {journal.sentimentTags.map((tag, idx) => (
              <View key={idx} style={[styles.tagPill, { backgroundColor: colors.cardElevated }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {!journal.hasJournal && (
          <View style={styles.emptyCardBox}>
            <Ionicons name="book-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>
              No journal reflections recorded on this date.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  dayHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  dayOfWeekText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  dateTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  volumeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  volumeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseItemBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exerciseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseMuscle: {
    fontSize: 10.5,
    marginTop: 1,
  },
  setsSummaryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  setsTable: {
    marginTop: 4,
  },
  setsTableHeader: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  setTh: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  setColNumber: {
    width: 34,
    fontSize: 11,
    fontWeight: '700',
  },
  setColWeight: {
    flex: 1,
    fontSize: 12,
  },
  setColReps: {
    width: 60,
    fontSize: 12,
    textAlign: 'center',
  },
  setColRir: {
    width: 44,
    fontSize: 11,
    textAlign: 'center',
  },
  postWorkoutNotesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  postWorkoutNotesLabel: {
    fontSize: 11,
  },
  postWorkoutNotesVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  waterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  waterText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  macroStrip: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  macroPillBox: {
    flex: 1,
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  macroPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  macroPillVal: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  macroProgressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  macroProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroSubText: {
    fontSize: 9,
  },
  mealsList: {
    gap: 6,
  },
  mealItemBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  mealItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  mealSlotLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mealCalText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mealRawText: {
    fontSize: 12,
    marginTop: 2,
  },
  mealSubItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  mealSubItemTag: {
    fontSize: 10.5,
  },
  ratingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.sm,
  },
  ratingCol: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  journalNoteBox: {
    marginTop: 6,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.sm,
  },
  journalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  journalNoteType: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  journalNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyCardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
  },
  emptyCardText: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: 4,
  },
  quickActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
