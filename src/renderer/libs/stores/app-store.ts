"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";
import type { SystemPrinter } from "@/packages/pos-printer";
const logger = console;

export type ThemeMode = "light" | "dark" | "system";

export interface PosPrintConfig extends SystemPrinter {}

export interface AppConfiguration {
  posPrint: PosPrintConfig;
  theme: ThemeMode;
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
}

declare global {
  interface Window {
    electron: {
      store: {
        getCurrentConfig: () => Promise<AppConfiguration>;
        setCurrentSchool: (school: School | null) => Promise<School | null>;
        setCurrentStudyYear: (
          year: StudyYear | null,
        ) => Promise<StudyYear | null>;
        setSchoolAndYear: (
          school: School | null,
          year: StudyYear | null,
        ) => Promise<{ school: School | null; year: StudyYear | null }>;
        setTheme: (theme: ThemeMode) => Promise<ThemeMode>;
        setPosPrintConfig: (
          config: Partial<PosPrintConfig>,
        ) => Promise<PosPrintConfig>;
        syncSchoolAndYearWithDb: () => Promise<{
          school: School | null;
          year: StudyYear | null;
        }>;
        resetSchoolAndYear: () => Promise<boolean>;
      };
    };
  }
}

interface ConfigurationState {
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
  theme: ThemeMode;
  posPrintConfig: PosPrintConfig | null;
  hasHydrated: boolean;
  isSyncing: boolean;
}

interface ConfigurationActions {
  /**
   * Initializes the frontend store with persisted data from the main process electron-store.
   */
  initStore: () => Promise<void>;
  /**
   * Updates and persists the current active school.
   * @param school - The target school entity or null.
   */
  setCurrentSchool: (school: School | null) => Promise<void>;
  /**
   * Updates and persists the current active study year.
   * @param year - The target study year entity or null.
   */
  setCurrentStudyYear: (year: StudyYear | null) => Promise<void>;
  /**
   * Simultaneously updates and persists both current school and study year entities.
   * @param school - The target school entity or null.
   * @param year - The target study year entity or null.
   */
  setSchoolAndYear: (
    school: School | null,
    year: StudyYear | null,
  ) => Promise<void>;
  /**
   * Sets and applies the global application theme mode.
   * @param theme - Target theme mode.
   */
  setTheme: (theme: ThemeMode) => Promise<void>;
  /**
   * Updates POS printer network configuration parameters.
   * @param config - Partial POS print configuration settings.
   */
  setPosPrintConfig: (config: Partial<PosPrintConfig>) => Promise<void>;
  /**
   * Resets stored school and study year selections back to null.
   */
  resetConfiguration: () => Promise<void>;
  /**
   * Verifies and synchronizes local configuration against database state in the main process.
   */
  syncFreshData: () => Promise<void>;
}

type ConfigurationStore = ConfigurationState & {
  actions: ConfigurationActions;
};

/**
 * Zustand store managing client-side configuration state synchronized with Electron IPC and logged execution.
 */
export const useConfigStore = create<ConfigurationStore>()((set) => ({
  currentSchool: null,
  currentStudyYear: null,
  theme: "system",
  posPrintConfig: null,
  hasHydrated: false,
  isSyncing: false,

  actions: {
    initStore: async (): Promise<void> => {
      try {
        logger.info("Initializing configuration store from IPC...");
        const config = await window.electron.store.getCurrentConfig();
        set({
          currentSchool: config.currentSchool,
          currentStudyYear: config.currentStudyYear,
          theme: config.theme,
          posPrintConfig: config.posPrint,
          hasHydrated: true,
        });
        logger.info("Configuration store hydrated successfully.");
      } catch (error) {
        logger.error(
          "Failed to initialize configuration store from IPC:",
          error,
        );
        set({ hasHydrated: true });
      }
    },

    setCurrentSchool: async (school: School | null): Promise<void> => {
      try {
        logger.info("Updating current school via IPC...", {
          schoolId: school?.schoolId,
        });
        const updatedSchool =
          await window.electron.store.setCurrentSchool(school);
        set({ currentSchool: updatedSchool });
        logger.info("Current school updated successfully.");
      } catch (error) {
        logger.error("Failed to update current school:", error);
      }
    },

    setCurrentStudyYear: async (studyYear: StudyYear | null): Promise<void> => {
      try {
        logger.info("Updating current study year via IPC...", {
          yearId: studyYear?.yearId,
        });
        const updatedYear =
          await window.electron.store.setCurrentStudyYear(studyYear);
        set({ currentStudyYear: updatedYear });
        logger.info("Current study year updated successfully.");
      } catch (error) {
        logger.error("Failed to update current study year:", error);
      }
    },

    setSchoolAndYear: async (
      school: School | null,
      studyYear: StudyYear | null,
    ): Promise<void> => {
      try {
        logger.info(
          "Updating school and study year simultaneously via IPC...",
          {
            schoolId: school?.schoolId,
            yearId: studyYear?.yearId,
          },
        );
        const result = await window.electron.store.setSchoolAndYear(
          school,
          studyYear,
        );
        set({ currentSchool: result.school, currentStudyYear: result.year });
        logger.info("School and study year updated successfully.");
      } catch (error) {
        logger.error("Failed to update school and study year:", error);
      }
    },

    setTheme: async (theme: ThemeMode): Promise<void> => {
      try {
        logger.info(`Setting application theme mode to: ${theme}`);
        const appliedTheme = await window.electron.store.setTheme(theme);
        set({ theme: appliedTheme });
        logger.info(`Application theme mode set to: ${appliedTheme}`);
      } catch (error) {
        logger.error("Failed to update application theme:", error);
      }
    },

    setPosPrintConfig: async (
      config: Partial<PosPrintConfig>,
    ): Promise<void> => {
      try {
        logger.info("Updating POS printer configuration...", config);
        const updated = await window.electron.store.setPosPrintConfig(config);
        set({ posPrintConfig: updated });
        logger.info("POS printer configuration updated successfully.");
      } catch (error) {
        logger.error("Failed to update POS printer configuration:", error);
      }
    },

    resetConfiguration: async (): Promise<void> => {
      try {
        logger.info("Resetting school and study year configuration...");
        await window.electron.store.resetSchoolAndYear();
        set({ currentSchool: null, currentStudyYear: null });
        logger.info("School and study year configuration reset successfully.");
      } catch (error) {
        logger.error("Failed to reset configuration:", error);
      }
    },

    syncFreshData: async (): Promise<void> => {
      logger.info("Starting database configuration synchronization...");
      set({ isSyncing: true });
      try {
        const result = await window.electron.store.syncSchoolAndYearWithDb();
        set({
          currentSchool: result.school,
          currentStudyYear: result.year,
        });
        logger.info("Database configuration synchronized successfully.");
      } catch (error) {
        logger.error("Failed to synchronize database configuration:", error);
        set({ currentSchool: null, currentStudyYear: null });
      } finally {
        set({ isSyncing: false });
      }
    },
  },
}));

/* ---------------- HELPER HOOKS ---------------- */

/**
 * Hook indicating if persistent store hydration has completed.
 * @returns Boolean hydration status.
 */
export const useIsConfigHydrated = (): boolean =>
  useConfigStore((s) => s.hasHydrated);

/**
 * Hook indicating if database synchronization is in progress.
 * @returns Boolean synchronization status.
 */
export const useIsConfigSyncing = (): boolean =>
  useConfigStore((s) => s.isSyncing);

/**
 * Hook providing access to store mutation actions.
 * @returns ConfigurationActions interface.
 */
export const useConfigActions = (): ConfigurationActions =>
  useConfigStore((s) => s.actions);

/**
 * Hook extracting flattened current configuration with shallow equality checks.
 * @returns Selection of active store properties and derived state.
 */
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

/**
 * Synchronous non-React getter retrieving immediate configuration snapshot.
 * @returns Configuration properties object.
 */
export const getConfig = (): {
  schoolId: string | undefined;
  yearId: string | undefined;
  theme: ThemeMode;
  posPrint: PosPrintConfig | null;
} => {
  const state = useConfigStore.getState();
  return {
    schoolId: state.currentSchool?.schoolId,
    yearId: state.currentStudyYear?.yearId,
    theme: state.theme,
    posPrint: state.posPrintConfig,
  };
};
