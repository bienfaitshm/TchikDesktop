import { z, ZodTypeAny } from "zod";
import { HttpStatus } from "./constant";
import { RouteHandler, ServerRequest } from "./ipc";
import { HttpException } from "./utils";

/**
 * Interface définissant les schémas de validation Zod pour une route spécifique.
 */
export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  headers?: ZodTypeAny;
}

/**
 * Type du handler final qui reçoit des données garanties d'être valides et typées.
 * TBody est le type inféré du schéma body.
 * TParams est le type inféré du schéma params.
 * TRes est le type de la réponse du handler.
 */
export type ValidatedHandler<TRes, TBody, TParams> = (
  req: ServerRequest<TBody, TParams>
) => Promise<TRes> | TRes;

// ... (Imports, ValidationSchemas, ValidatedHandler restent inchangés)

/**
 * Options de configuration pour la fonction createRouteHandler.
 */
interface HandlerOptions {
  schemas?: ValidationSchemas;
  /** * Message d'erreur personnalisé à utiliser lorsque la validation Zod échoue (HTTP 400).
   * Par défaut: "Échec de la validation de la requête."
   */
  validationErrorMessage?: string;
}

/**
 * @function createRouteHandler
 * @description Fonction wrapper qui prend des schémas Zod, valide les données IPC entrantes, et exécute le handler final.
 * Si la validation échoue, lève une HttpException (400 BAD_REQUEST) contenant les détails de l'erreur.
 *
 * @param handler Le handler de logique métier qui sera exécuté avec des données garanties d'être valides.
 * @param options Configuration, incluant les schémas Zod et un message d'erreur de validation personnalisé.
 * @returns Le RouteHandler prêt à être passé à IpcServer.get/post/etc.
 */
export function createRouteHandler<
  S extends ValidationSchemas,
  TBody = S["body"] extends ZodTypeAny ? z.infer<S["body"]> : unknown,
  TParams = S["params"] extends ZodTypeAny
    ? z.infer<S["params"]>
    : Record<string, unknown>,
  TRes = unknown,
>(
  handler: ValidatedHandler<TRes, TBody, TParams>,
  options: HandlerOptions = {}
): RouteHandler<TRes, TBody, TParams> {
  const schemas = options.schemas; // Extraction des schémas pour la logique interne

  // Message d'erreur par défaut
  const errorMessage =
    options.validationErrorMessage || "Échec de la validation de la requête.";

  return async (req) => {
    const errors: { path: string[]; message: string }[] = [];

    // --- 1. Validation du Body ---
    if (schemas?.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["body", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Mise à jour de req.body avec la version validée
        (req.body as TBody) = result.data;
      }
    }

    // --- 2. Validation des Params ---
    if (schemas?.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["params", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Mise à jour de req.params avec la version validée
        (req.params as TParams) = result.data;
      }
    }

    // --- 3. Validation des Headers ---
    if (schemas?.headers) {
      const result = schemas.headers.safeParse(req.headers);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["headers", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Mise à jour de req.headers avec la version validée
        (req.headers as any) = result.data;
      }
    }

    // --- 4. Gestion des Erreurs (400 BAD REQUEST) ---
    if (errors.length > 0) {
      throw new HttpException(
        // Utilisation du message customisé
        errorMessage,
        HttpStatus.BAD_REQUEST, // 400
        errors // Les détails structurés restent pour le débogage client
      );
    }

    // --- 5. Exécution du Handler Final ---
    return handler(req as ServerRequest<TBody, TParams>);
  };
}
