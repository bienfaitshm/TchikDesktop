import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  DocxReportGeneratorService,
  defaultDocxReportGeneratorService,
} from "@/packages/document-template";

/**
 * Extension d'export spécialisée pour la génération de rapports au format DOCX.
 * * @template ReportPayload Structure typée des données attendues par le template.
 */
export class ExportDocxExtension<
  ReportPayload extends Record<string, unknown> = Record<string, unknown>,
> extends AbstractExportExtension<ReportPayload> {
  public readonly extension = DOCUMENT_EXTENSION.DOCX;

  public readonly description: string;
  private readonly templateName: string;
  private readonly reportGenerator: DocxReportGeneratorService;

  /**
   * @param templateName Nom ou chemin relatif du template à utiliser.
   * @param description Libellé affiché pour cette option d'export.
   * @param reportGenerator Moteur de génération de rapport injecté (permet le mocking en test unitaires).
   */
  constructor(
    templateName: string,
    description: string,
    reportGenerator: DocxReportGeneratorService = defaultDocxReportGeneratorService,
  ) {
    super();
    this.templateName = templateName;
    this.description = description;
    this.reportGenerator = reportGenerator;
  }

  /**
   * Traite les données du payload pour générer le binaire du document Word.
   * * @param payload Données dynamiques à injecter dans le template Word.
   * @returns Le contenu brut du fichier sous forme de Uint8Array compatible avec les buffers de fichiers.
   */
  public async process(payload: ReportPayload): Promise<RawFileContent> {
    return this.reportGenerator.generate({
      templateName: this.templateName,
      templateData: payload,
    });
  }
}
