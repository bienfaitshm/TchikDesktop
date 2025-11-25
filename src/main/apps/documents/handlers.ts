import {
  InvoiceDocumentHandler,
  EnrollementDocumentHandler,
} from "@/main/reports/word.report";

import { EnrollmentCsvHandler } from "@/main/reports/csv.reports";
import { EnrollmentJsonHandler } from "@/main/reports/json.reports";
import { DocumentHandler } from "./document-export-service";

/**
 * 🛠️ Type d'un Constructeur de Query Handler.
 * Définit une classe qui peut être instanciée.
 */
type HandlerConstructor = new (...args: any[]) => DocumentHandler;

function registerHandlers(
  handlerClasses: HandlerConstructor[]
): DocumentHandler[] {
  return handlerClasses.map((HandlerClass) => new HandlerClass());
}

/**
 * 📦 Liste déclarative des classes de Data Handlers enregistrés.
 * C'est le manifeste qui référence les classes, et non les objets instanciés.
 */
const HANDLERS_CLASSES_MANIFEST: HandlerConstructor[] = [
  InvoiceDocumentHandler,
  EnrollementDocumentHandler,
  EnrollmentCsvHandler,
  EnrollmentJsonHandler,
];

/**
 * 📄 Manifeste de tous les gestionnaires (Handlers) de documents exportables.
 * Tout nouveau document doit être ajouté ici pour être enregistré par le service.
 */
export const DOCUMENT_HANDLERS_MANIFEST: DocumentHandler[] = registerHandlers(
  HANDLERS_CLASSES_MANIFEST
);
