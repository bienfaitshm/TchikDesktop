import { ExportDocxExtension } from "@/packages/@core/documents-exports/extensions";
import { DocxReportGeneratorService } from "@/packages/document-template";

/**
 * Extension spécialisée dans la génération des fiches de cotation par salle de classe.
 * Hérite du comportement sécurisé d'ExportDocxExtension en appliquant un typage strict sur le payload.
 */
export class CotationReportExportDocxExtension extends ExportDocxExtension {
  /**
   * @param reportGenerator Permet d'injecter un service alternatif (mock) pour les tests unitaires.
   */
  constructor(reportGenerator?: DocxReportGeneratorService) {
    super(
      "cotations-secondary.docx",
      "Génère les fiches de cotation par salle",
      reportGenerator,
    );
  }
}
