import { server } from "@/commons/libs/electron-apis/server";
import { DocumentFilter } from "@/commons/types/services";
import { DOCUMENT_EXPORT_ROUTES } from "@/commons/constants/routes";
import { documentExportService } from "@/main/services/documents-exports";

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
