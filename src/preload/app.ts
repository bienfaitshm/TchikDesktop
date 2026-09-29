import { ipcRenderer } from "electron";
import { registerListener } from "./utils";

/**
 * Defines the contract for the Application module, exposing IPC communication wrappers and system state listeners.
 */
export type ApplicationApi = {
  onDatabaseReady: (callback: () => void) => () => void;
  sendErrorLog: (error: Error) => void;
};

/**
 * Application module providing database readiness subscription and error logging through Electron IPC.
 */
export const applicationAPI: ApplicationApi = {
  /**
   * Registers a callback triggered when the database is fully initialized.
   * @param callback - Function to execute upon database readiness.
   * @returns A cleanup function to remove the event listener.
   */
  onDatabaseReady(callback) {
    return registerListener("database-ready", callback);
  },

  /**
   * Sends an error log message along with optional context to the main process via IPC.
   * @param error
   */
  sendErrorLog(error) {
    ipcRenderer.send("error-front-log", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
  },
};
