import { DocumentFilter } from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { documentExport } from "./initialiser";

server.post<any, DocumentFilter>(
  "export/documents/infos",
  documentExport.getDocumentInfos
);

server.post<any, DocumentFilter>(
  "export/documents",
  documentExport.exportDocument
);
