/**
 * Sthira — Calendar & History Modal Store
 * Global state for the Calendar history viewer and date selection.
 */

import { create } from 'zustand';
import { getTodayDateString } from '@/utils/date';

interface CalendarStoreState {
  isCalendarOpen: boolean;
  selectedDate: string;
  currentYear: number;
  currentMonth: number; // 1 to 12

  // Actions
  openCalendar: (initialDate?: string) => void;
  closeCalendar: () => void;
  setSelectedDate: (date: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;
}

const getInitialDateState = () => {
  const today = getTodayDateString();
  const [y, m] = today.split('-').map(Number);
  return {
    today,
    year: y,
    month: m,
  };
};

export const useCalendarStore = create<CalendarStoreState>((set, get) => {
  const init = getInitialDateState();

  return {
    isCalendarOpen: false,
    selectedDate: init.today,
    currentYear: init.year,
    currentMonth: init.month,

    openCalendar: (initialDate) => {
      const targetDate = initialDate || get().selectedDate || getTodayDateString();
      const [y, m] = targetDate.split('-').map(Number);
      set({
        isCalendarOpen: true,
        selectedDate: targetDate,
        currentYear: !isNaN(y) ? y : get().currentYear,
        currentMonth: !isNaN(m) ? m : get().currentMonth,
      });
    },

    closeCalendar: () => {
      set({ isCalendarOpen: false });
    },

    setSelectedDate: (date) => {
      const [y, m] = date.split('-').map(Number);
      set({
        selectedDate: date,
        currentYear: !isNaN(y) ? y : get().currentYear,
        currentMonth: !isNaN(m) ? m : get().currentMonth,
      });
    },

    prevMonth: () => {
      const { currentYear, currentMonth } = get();
      if (currentMonth === 1) {
        set({ currentYear: currentYear - 1, currentMonth: 12 });
      } else {
        set({ currentMonth: currentMonth - 1 });
      }
    },

    nextMonth: () => {
      const { currentYear, currentMonth } = get();
      if (currentMonth === 12) {
        set({ currentYear: currentYear + 1, currentMonth: 1 });
      } else {
        set({ currentMonth: currentMonth + 1 });
      }
    },

    goToToday: () => {
      const today = getTodayDateString();
      const [y, m] = today.split('-').map(Number);
      set({
        selectedDate: today,
        currentYear: y,
        currentMonth: m,
      });
    },
  };
});
