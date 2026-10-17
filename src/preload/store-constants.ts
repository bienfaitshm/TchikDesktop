import { ipcRenderer } from "electron";
import type { School, StudyYear } from "@/packages/@core/data-access/db";
import { StoreAPI } from "./types";
import type {
  PosPrintConfig,
  ThemeMode,
} from "@/packages/@core/data-access/stores";

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

export const storeApi: StoreAPI = {
  getCurrentConfig: () =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.GET_CURRENT_CONFIG),
  getPosPrintConfig: () =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.GET_POS_PRINT_CONFIG),
  setCurrentSchool: (school: School | null) =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SET_CURRENT_SCHOOL, school),
  setCurrentStudyYear: (year: StudyYear | null) =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SET_CURRENT_STUDY_YEAR, year),
  setSchoolAndYear: (school: School | null, year: StudyYear | null) =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SET_SCHOOL_AND_YEAR, school, year),
  setTheme: (theme: ThemeMode) =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SET_THEME, theme),
  setPosPrintConfig: (config: Partial<PosPrintConfig>) =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SET_POS_PRINT_CONFIG, config),
  syncSchoolAndYearWithDb: () =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.SYNC_SCHOOL_AND_YEAR_WITH_DB),
  resetSchoolAndYear: () =>
    ipcRenderer.invoke(STORE_IPC_CHANNELS.RESET_SCHOOL_AND_YEAR),
};
