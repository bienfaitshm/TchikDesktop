import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  PdfReportGenerator,
  defaultPdfReportGenerator,
} from "@/packages/document-template";

/**
 * Extension d'export spécialisée pour la génération de rapports au format PDF.
 * @template ReportPayload Structure typée des données attendues par le template HTML.
 */
export class ExportPdfExtension<
  ReportPayload extends Record<string, unknown> = Record<string, unknown>,
> extends AbstractExportExtension<ReportPayload> {
  public readonly extension = DOCUMENT_EXTENSION.PDF;
  public readonly description: string;

  private readonly templateName: string;
  private readonly reportGenerator: PdfReportGenerator;

  /**
   * @param templateName Nom ou chemin relatif du template HTML à utiliser.
   * @param description Libellé affiché pour cette option d'export.
   * @param reportGenerator Moteur de génération PDF injecté (permet le mocking en test unitaires).
   */
  constructor(
    templateName: string,
    description: string,
    reportGenerator: PdfReportGenerator = defaultPdfReportGenerator,
  ) {
    super();
    this.templateName = templateName;
    this.description = description;
    this.reportGenerator = reportGenerator;
  }

  /**
   * Traite les données du payload pour générer le binaire du document PDF.
   * @param payload Données dynamiques à injecter dans le template.
   * @returns Le contenu brut du fichier sous forme de Buffer.
   */
  public async process(payload: ReportPayload): Promise<RawFileContent> {
    return this.reportGenerator.generate({
      templateName: this.templateName,
      templateData: payload,
    });
  }
}
