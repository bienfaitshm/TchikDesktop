import { BrowserWindow, nativeTheme } from "electron";
import Store, { Schema } from "electron-store";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";

import {
  schoolRepository,
  type SchoolRepository,
  studyYearRepository,
  type StudyYearRepository,
} from "@/packages/@core/data-access/db";
import { type CustomLogger, getLogger } from "@/packages/logger";

export interface TchikAppStoreConfig {
  schoolRepo: SchoolRepository;
  yearRepo: StudyYearRepository;
  logger: CustomLogger;
}

export type ThemeMode = "light" | "dark" | "system";

export interface PosPrintConfig {
  host: string;
  port: number;
}

export interface AppConfig {
  posPrint: PosPrintConfig;
  theme: ThemeMode;
  currentSchool: School | null;
  currentStudyYear: StudyYear | null;
}

export type StoreType = {
  config: AppConfig;
};

const DEFAULT_DARK_BG = "#181c1e";
const DEFAULT_LIGHT_BG = "#ffffff";

const schema: Schema<StoreType> = {
  config: {
    type: "object",
    default: {
      posPrint: {
        host: "localhost",
        port: 9100,
      },
      theme: "system",
      currentSchool: null,
      currentStudyYear: null,
    },
    properties: {
      posPrint: {
        type: "object",
        properties: {
          host: {
            type: "string",
            default: "localhost",
          },
          port: {
            type: "number",
            default: 9100,
          },
        },
      },
      theme: {
        type: "string",
        enum: ["light", "dark", "system"],
        default: "system",
      },
      currentSchool: {
        type: ["object", "null"],
        default: null,
      },
      currentStudyYear: {
        type: ["object", "null"],
        default: null,
      },
    },
  },
};

/**
 * Manages application persistent configuration and synchronization with core services.
 */
export class TchikAppStore {
  private window: BrowserWindow | null = null;

  /**
   * Initializes the application store with target persistent storage and dependencies.
   * @param store - Electron store instance handling storage IO.
   * @param dependencies - Core services required for logging and repository operations.
   */
  constructor(
    private readonly store: Store<StoreType>,
    private readonly dependencies: TchikAppStoreConfig,
  ) {}

  /**
   * Binds the primary application BrowserWindow to apply theme changes directly.
   * @param win - Target Electron BrowserWindow instance.
   */
  public setWindow(win: BrowserWindow): void {
    this.window = win;
  }

  /**
   * Computes the current window background hex color based on the active dark mode state.
   * @returns Color hex code as string.
   */
  public getBackgroundWindow(): string {
    return nativeTheme.shouldUseDarkColors ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG;
  }

  /**
   * Retrieves the full application configuration tree from persistent storage.
   * @returns Complete application configuration object.
   */
  public getCurrentConfig(): AppConfig {
    return this.store.get("config");
  }

  /* ---------------- POS PRINT CONFIG ---------------- */

  /**
   * Retrieves current POS printer host and port configuration.
   * @returns POS printing configuration settings.
   */
  public getPosPrintConfig(): PosPrintConfig {
    return this.store.get("config.posPrint");
  }

  /**
   * Updates partial POS printer parameters and persists the result.
   * @param config - Partial POS print configuration to update.
   * @returns Updated POS print configuration object.
   */
  public setPosPrintConfig(config: Partial<PosPrintConfig>): PosPrintConfig {
    const current = this.getPosPrintConfig();
    const updated = { ...current, ...config };
    this.store.set("config.posPrint", updated);
    this.dependencies.logger.info("POS Print configuration updated:", updated);
    return updated;
  }

  /* ---------------- THEME CONFIG ---------------- */

  /**
   * Retrieves the current UI theme mode selection.
   * @returns Active theme mode value.
   */
  public getTheme(): ThemeMode {
    return this.store.get("config.theme", "system");
  }

  /**
   * Applies and persists a new theme mode, updating native engine and window attributes.
   * @param theme - Target theme mode to set.
   */
  public setTheme(theme: ThemeMode): void {
    this.store.set("config.theme", theme);
    nativeTheme.themeSource = theme;

    if (this.window) {
      this.window.setBackgroundColor(this.getBackgroundWindow());
    }

    this.dependencies.logger.info(`Theme updated: ${theme}`);
  }

  /* ---------------- SCHOOL & STUDY YEAR CONFIG ---------------- */

  /**
   * Retrieves the currently selected school entity.
   * @returns Selected school object or null if unset.
   */
  public getCurrentSchool(): School | null {
    return this.store.get("config.currentSchool", null);
  }

  /**
   * Sets and persists the current active school entity.
   * @param school - Target school object or null to clear.
   */
  public setCurrentSchool(school: School | null): void {
    this.store.set("config.currentSchool", school);
    this.dependencies.logger.info(
      "Current school updated:",
      school ? `${school.name} (${school.schoolId})` : null,
    );
  }

  /**
   * Retrieves the currently active study year entity.
   * @returns Selected study year object or null if unset.
   */
  public getCurrentStudyYear(): StudyYear | null {
    return this.store.get("config.currentStudyYear", null);
  }

  /**
   * Sets and persists the current active study year entity.
   * @param studyYear - Target study year object or null to clear.
   */
  public setCurrentStudyYear(studyYear: StudyYear | null): void {
    this.store.set("config.currentStudyYear", studyYear);
    this.dependencies.logger.info(
      "Current study year updated:",
      studyYear ? `${studyYear.yearName ?? studyYear.yearId}` : null,
    );
  }

  /**
   * Simultaneously sets and persists both active school and study year entities.
   * @param school - Target school object or null.
   * @param studyYear - Target study year object or null.
   */
  public setSchoolAndYear(
    school: School | null,
    studyYear: StudyYear | null,
  ): void {
    this.store.set("config.currentSchool", school);
    this.store.set("config.currentStudyYear", studyYear);
    this.dependencies.logger.info(
      "School and study year updated simultaneously:",
      {
        schoolId: school?.schoolId ?? null,
        yearId: studyYear?.yearId ?? null,
      },
    );
  }

  /**
   * Synchronizes persisted school and study year data against database records.
   * Resets stored parameters to null if entities are invalid or missing in DB.
   * @returns Verified school and study year records or nulls.
   */
  public async syncSchoolAndYearWithDb(): Promise<{
    school: School | null;
    year: StudyYear | null;
  }> {
    const currentSchool = this.getCurrentSchool();
    const currentYear = this.getCurrentStudyYear();

    const schoolId = currentSchool?.schoolId;
    const yearId = currentYear?.yearId;

    if (!schoolId || !yearId) {
      this.dependencies.logger.warn(
        "Sync skipped: missing schoolId or yearId in persistent config.",
      );
      this.resetSchoolAndYear();
      return { school: null, year: null };
    }

    try {
      this.dependencies.logger.info(
        `Starting DB sync for schoolId: ${schoolId}, yearId: ${yearId}`,
      );

      const [freshSchool, freshStudyYear] = await Promise.all([
        this.dependencies.schoolRepo.findById(schoolId),
        this.dependencies.yearRepo.findById(yearId),
      ]);

      if (freshSchool && freshStudyYear) {
        this.setSchoolAndYear(freshSchool, freshStudyYear);
        this.dependencies.logger.info("DB sync completed successfully.");
        return { school: freshSchool, year: freshStudyYear };
      }

      this.dependencies.logger.warn(
        "Missing entity in DB during sync. Resetting configuration.",
      );
      this.resetSchoolAndYear();
      return { school: null, year: null };
    } catch (error) {
      this.dependencies.logger.error("DB sync operation failed:", error);
      this.resetSchoolAndYear();
      return { school: null, year: null };
    }
  }

  /**
   * Resets stored school and study year configurations back to null state.
   */
  public resetSchoolAndYear(): void {
    this.setSchoolAndYear(null, null);
    this.dependencies.logger.info("School and study year configuration reset.");
  }

  /**
   * Clears all stored application configuration data from persistent storage.
   */
  public resetConfig(): void {
    this.store.clear();
    this.dependencies.logger.info("Global store configuration reset.");
  }
}

/**
 * Creates and configures a TchikAppStore instance.
 * @param customStore - Optional custom Store instance for testing.
 * @param customConfig - Optional custom dependencies override.
 * @returns Instantiated TchikAppStore.
 */
export function createAppStore(
  customStore?: Store<StoreType>,
  customConfig?: TchikAppStoreConfig,
): TchikAppStore {
  const storeInstance = customStore ?? new Store<StoreType>({ schema });
  const configInstance = customConfig ?? {
    logger: getLogger("TchikAppStore"),
    schoolRepo: schoolRepository,
    yearRepo: studyYearRepository,
  };

  return new TchikAppStore(storeInstance, configInstance);
}

export const tchikAppStore = createAppStore();
