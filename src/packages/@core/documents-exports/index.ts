/**
 * @file index.ts
 * @description Entry point for the document export module.
 * Initializes the export orchestrator with injected dependencies and event handlers.
 */

import { DataExport } from "@/packages/electron-data-exporter";
import { ElectronFileSystem } from "@/packages/electron-file-system";
import { openFile, notify } from "@/packages/electron-utility";
import { exportHistoryRepository } from "@/packages/@core/data-access/db/queries";
import { mainLogger } from "@/packages/logger";
import { registeredStrategies } from "./strategies";

/**
 * Payload structure for export notifications.
 */
export interface ExportNotificationPayload {
  success: boolean;
  data?: string | { message?: string };
}

/**
 * Payload structure for saving export history.
 */
export interface ExportHistoryPayload {
  exportKey: string;
  exportName: string;
  fileType: string;
  filePath: string;
  schoolId?: string;
  userId?: string;
}

/**
 * Handles native system notifications following an export attempt.
 * @param payload - Object containing export success status and payload/error data.
 */
export function handleExportNotification({
  success,
  data,
}: ExportNotificationPayload): void {
  try {
    const title = success ? "Export Successful" : "Export Failed";
    const body =
      typeof data === "string" ? data : data?.message || "An error occurred";
    notify({ title, body });
  } catch (error) {
    mainLogger.error("Failed to display export notification.", error);
  }
}

/**
 * Persists export records to the database history repository.
 * @param payload - Metadata including keys, names, file types, and IDs.
 */
export async function handleSaveExportHistory(
  payload: ExportHistoryPayload,
): Promise<void> {
  const { schoolId, ...exportData } = payload;
  if (!schoolId) {
    return;
  }

  try {
    await exportHistoryRepository.create({
      schoolId,
      ...exportData,
    });
  } catch (error) {
    mainLogger.error("Error occurred while saving export history.", error);
  }
}

/**
 * Creates and configures the document export orchestrator instance.
 * @param fileSystemInstance - File system provider implementation.
 * @returns Configured DataExport instance.
 */
export function createDocumentExport(
  fileSystemInstance = new ElectronFileSystem(),
) {
  return new DataExport(registeredStrategies, fileSystemInstance, {
    onOpenFile: openFile,
    notifyOnExport: handleExportNotification,
    saveHistoryExport: handleSaveExportHistory,
  });
}

export const documentExport = createDocumentExport();

export { DOCUMENT_EXPORT_ROUTES } from "./constants";
