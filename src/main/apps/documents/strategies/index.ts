import * as Words from "@/main/apps/documents/strategies/academic-docx.strategies";
import { EnrollmentCsvStrategy } from "@/main/apps/documents/strategies/enrollment-csv.strategy";
import { EnrollmentJsonStrategy } from "@/main/apps/documents/strategies/enrollment-json.strategy";
import { IDocumentExportStrategy } from "../document-export.service";

/**
 * 🛠️ Type d'un Constructeur de Query Handler.
 * Définit une classe qui peut être instanciée.
 */
type HandlerConstructor = new (...args: any[]) => IDocumentExportStrategy;

function registerHandlers(
  handlerClasses: HandlerConstructor[]
): IDocumentExportStrategy[] {
  return handlerClasses.map((HandlerClass) => new HandlerClass());
}

/**
 * 📦 Liste déclarative des classes de Data Handlers enregistrés.
 * C'est le manifeste qui référence les classes, et non les objets instanciés.
 */
const HANDLERS_CLASSES_MANIFEST: HandlerConstructor[] = [
  Words.CotationDocxStrategy,
  Words.EnrollementDocxStrategy,
  EnrollmentCsvStrategy,
  EnrollmentJsonStrategy,
];

/**
 * 📄 Manifeste de tous les gestionnaires (Handlers) de documents exportables.
 * Tout nouveau document doit être ajouté ici pour être enregistré par le service.
 */
export const DOCUMENT_HANDLERS_MANIFEST: IDocumentExportStrategy[] =
  registerHandlers(HANDLERS_CLASSES_MANIFEST);
