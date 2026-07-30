"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";

export type ThemeMode = "light" | "dark" | "system";

export interface PosPrintConfig {
  host: string;
  port: number;
}

interface ConfigurationState {
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
  theme: ThemeMode;
  posPrintConfig: PosPrintConfig;
  _hasHydrated: boolean;
  isSyncing: boolean;
}

interface ConfigurationActions {
  setCurrentSchool: (school: School | null) => Promise<void>;
  setCurrentStudyYear: (year: StudyYear | null) => Promise<void>;
  setSchoolAndYear: (
    school: School | null,
    year: StudyYear | null,
  ) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setPosPrintConfig: (config: Partial<PosPrintConfig>) => Promise<void>;
  resetConfiguration: () => Promise<void>;
  syncFreshData: () => Promise<void>;
  initStore: () => Promise<void>;
}

type ConfigurationStore = ConfigurationState & {
  actions: ConfigurationActions;
};

export const useConfigStore = create<ConfigurationStore>()((set) => ({
  currentSchool: null,
  currentStudyYear: null,
  theme: "system",
  posPrintConfig: { host: "localhost", port: 9100 },
  _hasHydrated: false,
  isSyncing: false,

  actions: {
    /**
     * Initialise le store Frontend avec les données d'electron-store au lancement
     */
    initStore: async () => {
      try {
        const config = await window.electron.store.getCurrentConfig();
        console.log("current config", config);
        set({
          currentSchool: config.currentSchool,
          currentStudyYear: config.currentStudyYear,
          theme: config.theme,
          posPrintConfig: config.posPrint,
          _hasHydrated: true,
        });
      } catch (error) {
        console.error("[ConfigStore] Erreur d'initialisation:", error);
        set({ _hasHydrated: true });
      }
    },

    setCurrentSchool: async (school) => {
      set({ currentSchool: school });
      await window.electron.store.setCurrentSchool(school);
    },

    setCurrentStudyYear: async (studyYear) => {
      set({ currentStudyYear: studyYear });
      await window.electron.store.setCurrentStudyYear(studyYear);
    },

    setSchoolAndYear: async (school, studyYear) => {
      set({ currentSchool: school, currentStudyYear: studyYear });
      await window.electron.store.setSchoolAndYear(school, studyYear);
    },

    setTheme: async (theme) => {
      set({ theme });
      await window.electron.store.setTheme(theme);
    },

    setPosPrintConfig: async (config) => {
      const updated = await window.electron.store.setPosPrintConfig(config);
      set({ posPrintConfig: updated });
    },

    resetConfiguration: async () => {
      set({ currentSchool: null, currentStudyYear: null });
      await window.electron.store.resetSchoolAndYear();
    },

    /**
     * Exécute la vérification en BDD côté Main Process
     */
    syncFreshData: async () => {
      set({ isSyncing: true });
      try {
        const result = await window.electron.store.syncSchoolAndYearWithDb();
        set({
          currentSchool: result.school,
          currentStudyYear: result.year,
        });
      } catch (error) {
        console.error("[ConfigStore] Échec de la synchronisation BDD:", error);
        set({ currentSchool: null, currentStudyYear: null });
      } finally {
        set({ isSyncing: false });
      }
    },
  },
}));

/* ---------------- HOOKS HELPER (EXACTEMENT COMME TON CODE INITIAL) ---------------- */

export const useIsConfigHydrated = () => useConfigStore((s) => s._hasHydrated);
export const useIsConfigSyncing = () => useConfigStore((s) => s.isSyncing);
export const useConfigActions = () => useConfigStore((s) => s.actions);

export const useCurrentConfig = () => {
  return useConfigStore(
    useShallow((s) => ({
      school: s.currentSchool,
      year: s.currentStudyYear,
      schoolId: s.currentSchool?.schoolId,
      yearId: s.currentStudyYear?.yearId,
      theme: s.theme,
      posPrint: s.posPrintConfig,
      isConfigured: !!(s.currentSchool && s.currentStudyYear),
    })),
  );
};

export const getConfig = () => {
  const state = useConfigStore.getState();
  return {
    schoolId: state.currentSchool?.schoolId,
    yearId: state.currentStudyYear?.yearId,
    theme: state.theme,
    posPrint: state.posPrintConfig,
  };
};
