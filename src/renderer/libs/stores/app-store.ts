"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";

import { api } from "@/renderer/libs/apis";

const APP_STORE_NAME = "@app-configuration";

/**
 * Interface de l'état
 */
interface ConfigurationState {
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
  _hasHydrated: boolean;
}

/**
 * Interface des actions
 */
interface ConfigurationActions {
  setCurrentSchool: (school: School | null) => void;
  setCurrentStudyYear: (year: StudyYear | null) => void;
  resetConfiguration: () => void;
  setHasHydrated: (state: boolean) => void;
}

type ConfigurationStore = ConfigurationState & {
  actions: ConfigurationActions;
};

export const useConfigStore = create<ConfigurationStore>()(
  persist(
    (set) => ({
      currentSchool: null,
      currentStudyYear: null,
      _hasHydrated: false,

      actions: {
        setCurrentSchool: (school) => set({ currentSchool: school }),
        setCurrentStudyYear: (studyYear) =>
          set({ currentStudyYear: studyYear }),
        resetConfiguration: () =>
          set({ currentSchool: null, currentStudyYear: null }),
        setHasHydrated: (state) => set({ _hasHydrated: state }),
      },
    }),
    {
      name: APP_STORE_NAME,
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => async (state) => {
        if (!state) return;

        const schoolId = state.currentSchool?.schoolId;
        const yearId = state.currentStudyYear?.yearId;

        if (schoolId && yearId) {
          try {
            const [freshSchool, freshStudyYear] = await Promise.all([
              api.school.fetchSchoolById(schoolId),
              api.school.fetchStudyYearById(yearId),
            ]);

            if (freshSchool && freshStudyYear) {
              state.actions.setCurrentSchool(freshSchool);
              state.actions.setCurrentStudyYear(freshStudyYear);
            } else {
              state.actions.resetConfiguration();
            }
          } catch (error) {
            console.error(
              "Erreur lors de la réhydratation de la configuration via l'API:",
              error,
            );
            state.actions.resetConfiguration();
          }
        }

        // On signale que le processus de réhydratation (y compris l'API) est terminé
        state.actions.setHasHydrated(true);
      },
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        currentStudyYear: state.currentStudyYear,
      }),
    },
  ),
);

export const useIsConfigHydrated = () => useConfigStore((s) => s._hasHydrated);

export const useConfigActions = () => useConfigStore((s) => s.actions);

export const useCurrentConfig = () => {
  return useConfigStore(
    useShallow((s) => ({
      school: s.currentSchool,
      year: s.currentStudyYear,
      schoolId: s.currentSchool?.schoolId,
      yearId: s.currentStudyYear?.yearId,
      isConfigured: !!(s.currentSchool && s.currentStudyYear),
    })),
  );
};
