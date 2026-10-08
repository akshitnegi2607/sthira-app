import { create } from 'zustand';
import { UserProfile, Goals } from '@/types/database';
import { ProfileRepository } from '@/database/repositories/profileRepository';
import { INITIAL_USER_PROFILE, INITIAL_GOALS } from '@/constants/initialProfile';

interface ProfileState {
  profile: UserProfile;
  goals: Goals;
  isLoading: boolean;
  loadProfile: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateGoals: (updates: Partial<Goals>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: INITIAL_USER_PROFILE,
  goals: INITIAL_GOALS,
  isLoading: false,

  loadProfile: () => {
    try {
      const p = ProfileRepository.getProfile();
      const g = ProfileRepository.getGoals();
      set({
        profile: p || INITIAL_USER_PROFILE,
        goals: g || INITIAL_GOALS,
      });
    } catch (e) {
      console.warn('Failed to load profile from SQLite, using initial defaults', e);
      set({ profile: INITIAL_USER_PROFILE, goals: INITIAL_GOALS });
    }
  },

  updateProfile: (updates) => {
    try {
      ProfileRepository.updateProfile(updates);
      const p = ProfileRepository.getProfile();
      if (p) set({ profile: p });
    } catch (e) {
      console.error('Failed to update profile', e);
      set((state) => ({ profile: { ...state.profile, ...updates } }));
    }
  },

  updateGoals: (updates) => {
    try {
      ProfileRepository.updateGoals(updates);
      const g = ProfileRepository.getGoals();
      if (g) set({ goals: g });
    } catch (e) {
      console.error('Failed to update goals', e);
      set((state) => ({ goals: { ...state.goals, ...updates } }));
    }
  },
}));
