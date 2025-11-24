import {
  InvoiceDocumentHandler,
  EnrollementDocumentHandler,
} from "@/main/reports/word.report";

import { EnrollmentCsvHandler } from "@/main/reports/csv.reports";
import { EnrollmentJsonHandler } from "@/main/reports/json.reports";
import { DocumentHandler } from "./document-export-service";

/**
 * 📄 Manifeste de tous les gestionnaires (Handlers) de documents exportables.
 * Tout nouveau document doit être ajouté ici pour être enregistré par le service.
 */
export const DOCUMENT_HANDLERS_MANIFEST: DocumentHandler[] = [
  new InvoiceDocumentHandler(),
  new EnrollementDocumentHandler(),
  new EnrollmentCsvHandler(),
  new EnrollmentJsonHandler(),
];
