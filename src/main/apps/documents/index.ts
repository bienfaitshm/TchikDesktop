import { server } from "@/commons/libs/electron-apis/server";
import { DocumentExportService } from "./document-export-service";
import { appDataSystem } from "@/main/db/services";
import { DocumentFilter } from "@/commons/types/services";
import { DOCUMENT_EXPORT_ROUTES } from "@/commons/constants/routes";
import { DOCUMENT_HANDLERS_MANIFEST } from "./handlers";

/**
 * 🚀 Instance Singleton du service d'exportation de documents.
 * Injecte la liste des Handlers et le DataSystem.
 */
export const documentExportService = new DocumentExportService(
  DOCUMENT_HANDLERS_MANIFEST,
  {
    dataSystem: appDataSystem,
  }
);

// Route pour récupérer la liste des documents disponibles
server.post<unknown, DocumentFilter>(
  DOCUMENT_EXPORT_ROUTES.GET_INFOS,
  documentExportService.getDocumentInfos
);

// Route pour exporter un document spécifique
server.post<unknown, DocumentFilter>(
  DOCUMENT_EXPORT_ROUTES.EXPORT_DOCUMENT,
  documentExportService.exportDocument
);
