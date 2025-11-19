import { DocumentExportService } from "./document-export-service";
import { appDataSystem } from "@/main/db/services";

export const documentExport = new DocumentExportService([], {
  dataSystem: appDataSystem,
});
