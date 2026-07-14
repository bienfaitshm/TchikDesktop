"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";

import { loadStudyYear } from "@/renderer/libs/queries/study-years";
import { loadSchool } from "@/renderer/libs/queries/schools";

const APP_STORE_NAME = "@app-configuration";

interface ConfigurationState {
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
  _hasHydrated: boolean;
  isSyncing: boolean;
}

interface ConfigurationActions {
  setCurrentSchool: (school: School | null) => void;
  setCurrentStudyYear: (year: StudyYear | null) => void;
  resetConfiguration: () => void;
  setHasHydrated: (state: boolean) => void;
  syncFreshData: () => Promise<void>;
}

type ConfigurationStore = ConfigurationState & {
  actions: ConfigurationActions;
};

export const useConfigStore = create<ConfigurationStore>()(
  persist(
    (set, get) => ({
      currentSchool: null,
      currentStudyYear: null,
      _hasHydrated: false,
      isSyncing: false,

      actions: {
        setCurrentSchool: (school) => set({ currentSchool: school }),
        setCurrentStudyYear: (studyYear) =>
          set({ currentStudyYear: studyYear }),
        resetConfiguration: () =>
          set({ currentSchool: null, currentStudyYear: null }),
        setHasHydrated: (state) => set({ _hasHydrated: state }),

        // ⚡ Synchronisation asynchrone non-bloquante
        syncFreshData: async () => {
          const state = get();
          const schoolId = state.currentSchool?.schoolId;
          const yearId = state.currentStudyYear?.yearId;

          if (!schoolId || !yearId) return;

          set({ isSyncing: true });
          try {
            const [freshSchool, freshStudyYear] = await Promise.all([
              loadSchool(schoolId),
              loadStudyYear(yearId),
            ]);

            if (freshSchool && freshStudyYear) {
              set({
                currentSchool: freshSchool,
                currentStudyYear: freshStudyYear,
              });
            } else {
              set({ currentSchool: null, currentStudyYear: null });
            }
          } catch (error) {
            console.error(
              "[ConfigStore] Échec de la synchronisation en tâche de fond:",
              error,
            );
            // Optionnel: Ne pas reset la config si c'est juste un problème réseau temporaire
          } finally {
            set({ isSyncing: false });
          }
        },
      },
    }),
    {
      name: APP_STORE_NAME,
      storage: createJSONStorage(() => localStorage),

      // ⏱️ L'hydratation du cache localStorage est désormais instantanée (< 2ms)
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.actions.setHasHydrated(true);
      },
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        currentStudyYear: state.currentStudyYear,
      }),
    },
  ),
);

// HOOKS
export const useIsConfigHydrated = () => useConfigStore((s) => s._hasHydrated);
export const useIsConfigSyncing = () => useConfigStore((s) => s.isSyncing); // Pour afficher un petit indicateur de synchro discret
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
