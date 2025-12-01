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

/**
 * @function createRouteHandler
 * @description Fonction wrapper qui prend des schémas Zod, valide les données IPC entrantes, et exécute le handler final.
 * Si la validation échoue, lève une HttpException (400 BAD_REQUEST) contenant les détails de l'erreur.
 *
 * @param schemas Les schémas Zod pour le corps, les paramètres et les en-têtes.
 * @param handler Le handler de logique métier qui sera exécuté avec des données garanties d'être valides.
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
  schemas: S,
  handler: ValidatedHandler<TRes, TBody, TParams>
): RouteHandler<TRes, TBody, TParams> {
  // L'objet retourné est le handler que IpcServer.get() attend.
  return async (req) => {
    const errors: { path: string[]; message: string }[] = [];

    // --- 1. Validation du Body ---
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["body", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Optionnel: Mettre à jour req.body avec la version 'coercée' et validée par Zod
        (req.body as TBody) = result.data;
      }
    }

    // --- 2. Validation des Params ---
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["params", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Mettre à jour req.params avec la version validée et typée
        (req.params as TParams) = result.data;
      }
    }

    // --- 3. Validation des Headers ---
    if (schemas.headers) {
      // Les headers IPC sont généralement passés en camelCase par convention
      const result = schemas.headers.safeParse(req.headers);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({
            path: ["headers", ...issue.path.map((p) => p.toString())],
            message: issue.message,
          })
        );
      } else {
        // Optionnel: Mettre à jour req.headers avec la version validée
        (req.headers as any) = result.data;
      }
    }

    // --- 4. Gestion des Erreurs ---
    if (errors.length > 0) {
      // Lève une exception qui sera capturée par le 'Error Boundary' de IpcServer
      throw new HttpException(
        "Échec de la validation de la requête.",
        HttpStatus.BAD_REQUEST, // 400
        errors // Les détails contiennent la liste structurée des erreurs
      );
    }

    // --- 5. Exécution du Handler Final ---
    // Si tout est valide, nous appelons le handler original avec les données validées.
    return handler(req as ServerRequest<TBody, TParams>);
  };
}
