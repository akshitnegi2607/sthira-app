import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useJournalStore } from '@/stores/useJournalStore';
import { ReadinessScoreCard } from '@/features/journal/components/ReadinessScoreCard';
import { MorningCheckInModal } from '@/features/journal/components/MorningCheckInModal';
import { EveningWindDownModal } from '@/features/journal/components/EveningWindDownModal';
import { DailyCoachSummaryCard } from '@/features/journal/components/DailyCoachSummaryCard';
import { JournalTimelineCard } from '@/features/journal/components/JournalTimelineCard';
import { getTodayDateString, shiftDateString } from '@/utils/date';

export default function JournalScreen() {
  const { colors, isDark } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const {
    selectedDate,
    dailyLog,
    morningEntry,
    eveningEntry,
    recentHistory,
    readiness,
    aiReview,
    isMorningModalOpen,
    isEveningModalOpen,
    isLoading,
    setSelectedDate,
    loadJournalData,
    saveMorningCheckIn,
    saveEveningReflection,
    generateAndSaveDailyReview,
    setMorningModalOpen,
    setEveningModalOpen,
  } = useJournalStore();

  useEffect(() => {
    loadJournalData();
  }, [loadJournalData]);

  useFocusEffect(
    useCallback(() => {
      loadJournalData(selectedDate);
    }, [loadJournalData, selectedDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    loadJournalData(selectedDate);
    setRefreshing(false);
  };

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    setSelectedDate(shiftDateString(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(shiftDateString(selectedDate, 1));
  };

  const isMorningDone = !!morningEntry;
  const isEveningDone = !!eveningEntry;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }>
        {/* Date Selector Header */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            onPress={handlePrevDay}
            style={[
              styles.dateNavBtn,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.dateInfo}>
            <Text style={[styles.dateTitle, { color: colors.text }]}>
              {isToday ? 'Today, ' : ''}
              {selectedDate}
            </Text>
            <Text style={[styles.dateSub, { color: colors.textMuted }]}>
              Daily Mindset & Recovery Log
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            disabled={isToday}
            style={[
              styles.dateNavBtn,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
              isToday && { opacity: 0.3 },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Check-In Action Cards */}
        <View style={styles.actionCardsRow}>
          {/* Morning Check-In Button */}
          <TouchableOpacity
            style={[
              styles.checkInCard,
              {
                backgroundColor: colors.cardElevated,
                borderColor: isMorningDone ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={() => setMorningModalOpen(true)}
            activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.cardIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.16)'
                      : 'rgba(217, 119, 6, 0.12)',
                  },
                ]}>
                <Ionicons name="sunny" size={16} color={colors.calories} />
              </View>
              {isMorningDone ? (
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              ) : null}
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Morning Readiness
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>
              {isMorningDone
                ? `Energy: ${dailyLog?.energy_rating ?? 8}/10`
                : 'Log sleep & freshness'}
            </Text>
          </TouchableOpacity>

          {/* Evening Wind-Down Button */}
          <TouchableOpacity
            style={[
              styles.checkInCard,
              {
                backgroundColor: colors.cardElevated,
                borderColor: isEveningDone ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={() => setEveningModalOpen(true)}
            activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.cardIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(79, 70, 229, 0.12)',
                  },
                ]}>
                <Ionicons name="moon" size={16} color="#818CF8" />
              </View>
              {isEveningDone ? (
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              ) : null}
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Evening Wind-Down
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>
              {isEveningDone
                ? `Hunger: ${dailyLog?.hunger_rating ?? 5}/10`
                : 'Review day & stress'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Readiness Score Card */}
        <ReadinessScoreCard
          readiness={readiness}
          onOpenCheckIn={() => setMorningModalOpen(true)}
        />

        {/* 2. Holistic AI Coach Summary */}
        <DailyCoachSummaryCard
          review={aiReview}
          onRegenerate={() => generateAndSaveDailyReview(selectedDate)}
          isLoading={isLoading}
        />

        {/* 3. Recent Reflections Timeline */}
        <JournalTimelineCard entries={recentHistory} />
      </ScrollView>

      {/* Morning Check-In Modal */}
      <MorningCheckInModal
        visible={isMorningModalOpen}
        onClose={() => setMorningModalOpen(false)}
        onSave={saveMorningCheckIn}
        initialSleep={dailyLog?.sleep_hours}
        initialEnergy={dailyLog?.energy_rating}
        initialMood={dailyLog?.mood_rating}
        initialSoreness={dailyLog?.soreness_rating}
        initialNotes={morningEntry?.notes}
      />

      {/* Evening Wind-Down Modal */}
      <EveningWindDownModal
        visible={isEveningModalOpen}
        onClose={() => setEveningModalOpen(false)}
        onSave={saveEveningReflection}
        initialHunger={dailyLog?.hunger_rating}
        initialStress={dailyLog?.stress_rating}
        initialNotes={eveningEntry?.notes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateNavBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateSub: {
    fontSize: 11,
    marginTop: 1,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  checkInCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  cardIconBox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
