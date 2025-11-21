import { InvoiceDocumentHandler } from "@/main/reports/word.report";
import { DocumentHandler } from "./document-export-service";

/**
 * 📄 Manifeste de tous les gestionnaires (Handlers) de documents exportables.
 * Tout nouveau document doit être ajouté ici pour être enregistré par le service.
 */
export const DOCUMENT_HANDLERS_MANIFEST: DocumentHandler[] = [
  new InvoiceDocumentHandler(),
];
