/**
 * @file validation.ts
 * @description Middleware de validation de schéma utilisant Zod.
 * Assure l'intégrité des données entrant dans les handlers IPC.
 */

import { z, type ZodTypeAny } from "zod";
import { HttpStatus } from "./constant";
import type { IpcRequest, RequestHandler } from "./ipc"; // Assurez-vous que RequestHandler est exporté de ipc.ts
import { HttpException } from "./utils";

// --- Types & Interfaces ---

export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  headers?: ZodTypeAny;
}

/**
 * Options de configuration pour le validateur.
 */
interface ValidatorOptions {
  schemas: ValidationSchemas;
  /** Message d'erreur global si la validation échoue. */
  errorMessage?: string;
}

/**
 * Helper interne pour standardiser les erreurs de validation.
 */
interface ValidationErrorDetail {
  location: "body" | "params" | "headers";
  path: string;
  message: string;
}

// --- Implementation ---

/**
 * Valide une section spécifique de la requête (Body, Params ou Headers).
 * @param schema Le schéma Zod.
 * @param data Les données à valider.
 * @param location L'emplacement des données (pour le rapport d'erreur).
 * @param errors Le tableau mutable où accumuler les erreurs.
 * @returns Les données validées (transformées) ou undefined.
 */
function validateSection(
  schema: ZodTypeAny | undefined,
  data: unknown,
  location: ValidationErrorDetail["location"],
  errors: ValidationErrorDetail[]
): any {
  if (!schema) return data;

  const result = schema.safeParse(data);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push({
        location,
        path: issue.path.join("."), // Format "user.address.street"
        message: issue.message,
      });
    });
    return undefined;
  }

  return result.data;
}

/**
 * @function createValidatedHandler
 * @description Higher-Order Function (HOF) qui enveloppe un handler IPC avec une couche de validation Zod.
 * Applique strictement les schémas et rejette la requête avant même qu'elle n'atteigne la logique métier.
 *
 * @example
 * const createUser = createValidatedHandler(
 * async (req) => { return db.save(req.body); },
 * { schemas: { body: UserSchema } }
 * );
 */
export function createValidatedHandler<
  S extends ValidationSchemas,
  TBody = S["body"] extends ZodTypeAny ? z.infer<S["body"]> : unknown,
  TParams = S["params"] extends ZodTypeAny
    ? z.infer<S["params"]>
    : Record<string, unknown>,
>(
  handler: RequestHandler<any, TBody, TParams>,
  options: ValidatorOptions
): RequestHandler<any, any, any> {
  // Retourne un handler générique pour l'enregistrement

  const { schemas, errorMessage = "Validation Failed" } = options;

  return async (req: IpcRequest) => {
    const errors: ValidationErrorDetail[] = [];

    // 1. Validation & Transformation (sans mutation de req original)
    const validatedBody = validateSection(
      schemas.body,
      req.body,
      "body",
      errors
    );
    const validatedParams = validateSection(
      schemas.params,
      req.params,
      "params",
      errors
    );
    const validatedHeaders = validateSection(
      schemas.headers,
      req.headers,
      "headers",
      errors
    );

    // 2. Gestion des erreurs agrégées
    if (errors.length > 0) {
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST, {
        issues: errors,
      });
    }

    // 3. Création d'un contexte de requête sécurisé (Immuabilité)
    // On remplace les données brutes par les données typées/transformées par Zod
    const safeReq: IpcRequest<TBody, TParams> = {
      ...req,
      body: validatedBody,
      params: validatedParams,
      headers: validatedHeaders ?? req.headers,
    };

    // 4. Exécution du handler métier
    return handler(safeReq);
  };
}
