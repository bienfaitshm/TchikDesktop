import { DocumentExportService } from "./document-export-service";

export const documentExport = new DocumentExportService([], {
  dataSystem: {
    getData(_requestName, _params) {
      // Ce comportement doit être remplacé par une implémentation réelle
      return { success: false, errorMessage: "DataSystem non implémenté!" };
    },
  },
});
