import type {
  AppConfig,
  PosPrintConfig,
  ThemeMode,
} from "@/packages/@core/data-access/stores";
import type { School, StudyYear } from "@/packages/@core/data-access/db";

/**
 * Application store API interface exposed to the renderer process via IPC.
 */
export interface StoreAPI {
  /**
   * Retrieves the current application configuration.
   * @returns A promise resolving to the global application configuration object.
   */
  getCurrentConfig: () => Promise<AppConfig>;

  /**
   * Retrieves the current POS printing configuration.
   * @returns A promise resolving to the POS print settings.
   */
  getPosPrintConfig: () => Promise<PosPrintConfig>;

  /**
   * Updates the active school entity in the application store.
   * @param school - The school entity to set, or null to clear.
   * @returns A promise resolving to the updated school entity or null.
   */
  setCurrentSchool: (school: School | null) => Promise<School | null>;

  /**
   * Updates the active study year in the application store.
   * @param year - The study year entity to set, or null to clear.
   * @returns A promise resolving to the updated study year entity or null.
   */
  setCurrentStudyYear: (year: StudyYear | null) => Promise<StudyYear | null>;

  /**
   * Atomically updates both the active school and study year in the store.
   * @param school - The school entity to set, or null to clear.
   * @param year - The study year entity to set, or null to clear.
   * @returns A promise resolving to the updated school and year context.
   */
  setSchoolAndYear: (
    school: School | null,
    year: StudyYear | null,
  ) => Promise<{
    school: School | null;
    year: StudyYear | null;
  }>;

  /**
   * Sets the active UI theme mode.
   * @param theme - The target theme mode.
   * @returns A promise resolving to the newly applied theme mode.
   */
  setTheme: (theme: ThemeMode) => Promise<ThemeMode>;

  /**
   * Updates the POS print configuration parameters.
   * @param config - Partial POS print configuration options to merge.
   * @returns A promise resolving to the updated POS print configuration.
   */
  setPosPrintConfig: (
    config: Partial<PosPrintConfig>,
  ) => Promise<PosPrintConfig>;

  /**
   * Synchronizes school and study year context with the persistent database state.
   * @returns A promise resolving to the synchronized school and study year.
   */
  syncSchoolAndYearWithDb: () => Promise<{
    school: School | null;
    year: StudyYear | null;
  }>;

  /**
   * Resets the current school and study year selection in the store.
   * @returns A promise resolving to true upon successful reset.
   */
  resetSchoolAndYear: () => Promise<boolean>;
}
