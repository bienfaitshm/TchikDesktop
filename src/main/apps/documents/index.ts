import { server } from "@/commons/libs/electron-apis/server";
import { DocumentExportService } from "./document-export.service";
import { appQueryBus } from "@/main/db/services/data-system-initializer";
import { DocumentFilter } from "@/commons/types/services";
import { DOCUMENT_EXPORT_ROUTES } from "@/commons/constants/routes";

import { DOCUMENT_HANDLERS_MANIFEST } from "./strategies";
import { DataSystemAdapter } from "./data-system-adapter";

const dataFetchingServiceAdapter = new DataSystemAdapter(appQueryBus);

/**
 * 🚀 Instance Singleton du service d'exportation de documents.
 * Injecte la liste des Handlers et le DataSystem.
 */
export const documentExportService = new DocumentExportService(
  DOCUMENT_HANDLERS_MANIFEST,
  {
    dataFetchingService: dataFetchingServiceAdapter,
  }
);

// Route pour récupérer la liste des documents disponibles
server.get(
  DOCUMENT_EXPORT_ROUTES.GET_INFOS,
  documentExportService.getAvailableDocumentMetadata()
);

// Route pour exporter un document spécifique
server.post<unknown, DocumentFilter>(
  DOCUMENT_EXPORT_ROUTES.EXPORT_DOCUMENT,
  documentExportService.executeExportWorkflow()
);
