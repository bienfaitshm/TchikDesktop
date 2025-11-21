import { DocumentFilter } from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { DocumentExportService } from "./document-export-service";
import { appDataSystem } from "@/main/db/services";

export const documentExport = new DocumentExportService([], {
  dataSystem: appDataSystem,
});

server.post<any, DocumentFilter>(
  "export/documents/infos",
  documentExport.getDocumentInfos
);

server.post<any, DocumentFilter>(
  "export/documents",
  documentExport.exportDocument
);
