import createReport from "docx-templates";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";
import { additionalJsContext } from "./additional-context";

/**
 * Options d'exécution pour la génération du rapport DOCX.
 */
export interface GenerateDocxReportOptions {
  templateName: string;
  templateData: Record<string, unknown>;
}

/**
 * Configuration optionnelle pour l'injection de dépendances (Mocks/Tests/Logger).
 */
export interface ReportGeneratorConfig {
  /**
   * Service d'accès aux fichiers templates. Permet de déléguer la sécurité et le I/O.
   */
  storageService?: TemplateStorageService;

  /**
   * Système de log injectable.
   */
  logger?: ILogger;
}

/**
 * Logger silencieux par défaut (Null Object Pattern).
 */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/**
 * @class DocxReportGeneratorService
 * Service d'entreprise responsable de la compilation et génération de rapports complexes au format DOCX.
 */
export class DocxReportGeneratorService {
  private readonly storageService: TemplateStorageService;
  private readonly logger: ILogger;

  constructor(config: ReportGeneratorConfig = {}) {
    this.storageService =
      config.storageService ?? defaultTemplateStorageService;
    this.logger = config.logger ?? NULL_LOGGER;
  }

  /**
   * Génère un rapport DOCX binaire à partir d'un template et de ses données d'injection.
   * * @param options Options contenant le nom du template et les données associées.
   * @returns Un tableau d'octets (Uint8Array) représentant le fichier DOCX généré.
   * @throws {Error} Si le template est inaccessible ou si la compilation par le moteur échoue.
   */
  public async generate(
    options: GenerateDocxReportOptions,
  ): Promise<Uint8Array> {
    const { templateName, templateData } = options;

    this.logger.warn(
      `Initiating DOCX generation for template: "${templateName}"`,
    );

    let templateBuffer: Buffer;
    try {
      templateBuffer =
        await this.storageService.readTemplateContent(templateName);
    } catch (storageError) {
      const errorMsg =
        storageError instanceof Error
          ? storageError.message
          : String(storageError);
      this.logger.error(
        `Aborting generation. Failed to retrieve template: ${errorMsg}`,
      );
      throw storageError;
    }

    try {
      const reportBytes = await createReport({
        template: templateBuffer,
        data: templateData,
        additionalJsContext,
      });

      this.logger.warn(
        `Successfully generated DOCX report for: "${templateName}"`,
      );
      return reportBytes;
    } catch (engineError) {
      const errorMsg =
        engineError instanceof Error
          ? engineError.message
          : String(engineError);
      const executionFailureMessage = `Failed to assemble DOCX report for template "${templateName}": ${errorMsg}`;

      this.logger.error(executionFailureMessage);
      throw new Error(executionFailureMessage, { cause: engineError });
    }
  }
}

/**
 * Instance Singleton par défaut pour l'application.
 */
export const defaultDocxReportGeneratorService =
  new DocxReportGeneratorService();

/**
 * @deprecated Préférez instancier ou utiliser `defaultDocxReportGeneratorService.generate()`
 * pour respecter les standards d'injection de dépendances.
 */
export async function generateDocxReport(
  options: GenerateDocxReportOptions,
  config?: ReportGeneratorConfig,
): Promise<Uint8Array> {
  const service = config
    ? new DocxReportGeneratorService(config)
    : defaultDocxReportGeneratorService;

  return service.generate(options);
}
