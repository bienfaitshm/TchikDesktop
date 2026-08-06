import { ipcMain } from "electron";
import { TchikAppStore, tchikAppStore } from "./app-store";
import type {
  School,
  StudyYear,
} from "@/packages/@core/data-access/db/schemas";
import type { PosPrintConfig, ThemeMode } from "./app-store";

/**
 * Registry of IPC channel names reserved for store operations.
 */
export const STORE_IPC_CHANNELS = {
  GET_CURRENT_CONFIG: "store:getCurrentConfig",
  GET_POS_PRINT_CONFIG: "store:getPosPrintConfig",
  SET_CURRENT_SCHOOL: "store:setCurrentSchool",
  SET_CURRENT_STUDY_YEAR: "store:setCurrentStudyYear",
  SET_SCHOOL_AND_YEAR: "store:setSchoolAndYear",
  SET_THEME: "store:setTheme",
  SET_POS_PRINT_CONFIG: "store:setPosPrintConfig",
  SYNC_SCHOOL_AND_YEAR_WITH_DB: "store:syncSchoolAndYearWithDb",
  RESET_SCHOOL_AND_YEAR: "store:resetSchoolAndYear",
} as const;

/**
 * Registers Electron IPC main handlers to expose store mutations and queries to the renderer process.
 * @param store - Optional TchikAppStore instance to bind handlers against (defaults to global singleton).
 */
export function registerStoreIpcHandlers(
  store: TchikAppStore = tchikAppStore,
): void {
  ipcMain.handle(STORE_IPC_CHANNELS.GET_CURRENT_CONFIG, () => {
    return store.getCurrentConfig();
  });

  ipcMain.handle(STORE_IPC_CHANNELS.GET_POS_PRINT_CONFIG, () => {
    return store.getPosPrintConfig();
  });

  ipcMain.handle(
    STORE_IPC_CHANNELS.SET_CURRENT_SCHOOL,
    (_, school: School | null) => {
      store.setCurrentSchool(school);
      return store.getCurrentSchool();
    },
  );

  ipcMain.handle(
    STORE_IPC_CHANNELS.SET_CURRENT_STUDY_YEAR,
    (_, year: StudyYear | null) => {
      store.setCurrentStudyYear(year);
      return store.getCurrentStudyYear();
    },
  );

  ipcMain.handle(
    STORE_IPC_CHANNELS.SET_SCHOOL_AND_YEAR,
    (_, school: School | null, year: StudyYear | null) => {
      store.setSchoolAndYear(school, year);
      return {
        school: store.getCurrentSchool(),
        year: store.getCurrentStudyYear(),
      };
    },
  );

  ipcMain.handle(STORE_IPC_CHANNELS.SET_THEME, (_, theme: ThemeMode) => {
    store.setTheme(theme);
    return store.getTheme();
  });

  ipcMain.handle(
    STORE_IPC_CHANNELS.SET_POS_PRINT_CONFIG,
    (_, config: Partial<PosPrintConfig>) => {
      return store.setPosPrintConfig(config);
    },
  );

  ipcMain.handle(STORE_IPC_CHANNELS.SYNC_SCHOOL_AND_YEAR_WITH_DB, () => {
    return store.syncSchoolAndYearWithDb();
  });

  ipcMain.handle(STORE_IPC_CHANNELS.RESET_SCHOOL_AND_YEAR, () => {
    store.resetSchoolAndYear();
    return true;
  });
}
