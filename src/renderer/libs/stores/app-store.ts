"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  TSchoolAttributes as TSchool,
  TStudyYearAttributes as TStudyYear,
} from "@/packages/@core/data-access/schema-validations";

const APP_STORE_NAME = "app-configuration";

/**
 * Interface de l'état
 */
interface ConfigurationState {
  currentSchool: TSchool | null;
  currentStudyYear: TStudyYear | null;
  _hasHydrated: boolean;
}

/**
 * Interface des actions
 */
interface ConfigurationActions {
  setCurrentSchool: (school: TSchool | null) => void;
  setCurrentStudyYear: (year: TStudyYear | null) => void;
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
      onRehydrateStorage: () => (state) => {
        state?.actions.setHasHydrated(true);
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
