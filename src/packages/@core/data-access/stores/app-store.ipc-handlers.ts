import { ipcMain } from "electron";
import { TchikAppStore, tchikAppStore } from "./app-store";

/**
 * Registers Electron IPC main handlers to expose store mutations and queries to the renderer process.
 * @param store - Optional TchikAppStore instance to bind handlers against (defaults to global singleton).
 */
export function registerStoreIpcHandlers(
  store: TchikAppStore = tchikAppStore,
): void {
  ipcMain.handle("store:getCurrentConfig", () => store.getCurrentConfig());

  ipcMain.handle("store:setCurrentSchool", (_, school) => {
    store.setCurrentSchool(school);
    return store.getCurrentSchool();
  });

  ipcMain.handle("store:setCurrentStudyYear", (_, year) => {
    store.setCurrentStudyYear(year);
    return store.getCurrentStudyYear();
  });

  ipcMain.handle("store:setSchoolAndYear", (_, school, year) => {
    store.setSchoolAndYear(school, year);
    return {
      school: store.getCurrentSchool(),
      year: store.getCurrentStudyYear(),
    };
  });

  ipcMain.handle("store:setTheme", (_, theme) => {
    store.setTheme(theme);
    return store.getTheme();
  });

  ipcMain.handle("store:setPosPrintConfig", (_, config) =>
    store.setPosPrintConfig(config),
  );

  ipcMain.handle(
    "store:syncSchoolAndYearWithDb",
    async () => await store.syncSchoolAndYearWithDb(),
  );

  ipcMain.handle("store:resetSchoolAndYear", () => {
    store.resetSchoolAndYear();
    return true;
  });
}
