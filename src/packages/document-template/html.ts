import Handlebars from "handlebars";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";

/**
 * Un logger "No-Op" (Null Object Pattern) qui ignore tous les logs.
 * Permet d'éviter les vérifications répétitives de type "if (logger)" dans le code.
 */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/**
 * Options de configuration pour le moteur de rendu de templates.
 */
export interface TemplateRenderOptions {
  /**
   * Une instance personnalisée du service de stockage pour récupérer le template.
   */
  storageService?: TemplateStorageService;

  /**
   * Un système de log injectable (ex: Winston, Pino, ou console).
   * Si non fourni, un logger silencieux (Null Object) sera utilisé.
   */
  logger?: ILogger;
}

/**
 * Compile et rend un template Handlebars à partir d'un fichier source.
 * * @template T Context/Structure des données à injecter dans le template.
 * @param templateRelativePath Chemin relatif du fichier template (ex: "invoice.hbs").
 * @param context Données d'injection pour le template.
 * @param options Options de rendu (permet notamment l'injection du stockage et du logger).
 * @returns Le contenu du template rendu sous forme de chaîne de caractères.
 * @throws {Error} Si le fichier est introuvable ou si la compilation Handlebars échoue.
 */
export async function renderTemplate<T extends object>(
  templateRelativePath: string,
  context: T,
  options: TemplateRenderOptions = {},
): Promise<string> {
  const logger = options.logger ?? NULL_LOGGER;
  const storageService =
    options.storageService ?? defaultTemplateStorageService;

  logger.warn(
    `Starting template rendering pipeline for: "${templateRelativePath}"`,
  );

  let rawBuffer: Buffer;
  try {
    rawBuffer = await storageService.readTemplateContent(templateRelativePath, {
      encoding: null,
    });
  } catch (storageError) {
    const errorMsg =
      storageError instanceof Error
        ? storageError.message
        : String(storageError);
    logger.error(
      `Storage read failure for "${templateRelativePath}": ${errorMsg}`,
    );
    throw storageError;
  }

  const templateSource = rawBuffer.toString("utf8");

  try {
    const compile = Handlebars.compile(templateSource);
    const renderedResult = compile(context);

    logger.warn(`Successfully rendered template: "${templateRelativePath}"`);
    return renderedResult;
  } catch (compileError) {
    const errorMessage =
      compileError instanceof Error
        ? compileError.message
        : String(compileError);
    const runtimeExceptionMessage = `Failed to compile or render template "${templateRelativePath}": ${errorMessage}`;

    logger.error(runtimeExceptionMessage);
    throw new Error(runtimeExceptionMessage);
  }
}
