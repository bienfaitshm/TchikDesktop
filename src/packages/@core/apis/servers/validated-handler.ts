/**
 * @file validated-handler.ts
 * @description Middleware de validation de schéma utilisant Zod.
 * Assure l'intégrité des données entrant dans les handlers IPC.
 */

import { z, type ZodTypeAny } from "zod";
import {
  IpcRequest,
  RequestHandler,
  HttpStatus,
  HttpException,
} from "@/packages/electron-ipc-rest";

import { getLogger } from "@/packages/logger";

export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  headers?: ZodTypeAny;
}

/**
 * Options de configuration rendues génériques pour capturer la structure exacte des schémas.
 */
interface ValidatorOptions<S extends ValidationSchemas> {
  schemas: S;
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

// --- Helpers de Type ---

/**
 * Extrait le type TypeScript du Body à partir du schéma Zod fourni (ou unknown si absent).
 */
export type InferBody<S extends ValidationSchemas> =
  S["body"] extends ZodTypeAny ? z.infer<S["body"]> : unknown;

/**
 * Extrait le type TypeScript des Params à partir du schéma Zod fourni (ou Record générique si absent).
 */
export type InferParams<S extends ValidationSchemas> =
  S["params"] extends ZodTypeAny
    ? z.infer<S["params"]>
    : Record<string, unknown>;

const logger = getLogger("Validation");
/**
 * Valide une section spécifique de la requête (Body, Params ou Headers).
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
 *
 * @param options Configuration contenant les schémas Zod (Placé en premier pour l'inférence de type).
 * @param handler La fonction métier qui recevra une requête typée et sécurisée.
 *
 * @example
 * // req.body est automatiquement typé comme { username: string }
 * const createUser = createValidatedHandler(
 * { schemas: { body: z.object({ username: z.string() }) } },
 * async (req) => {
 * console.log(req.body.username); // Autocomplétion active !
 * return db.save(req.body);
 * }
 * );
 */
export function createValidatedHandler<S extends ValidationSchemas>(
  options: ValidatorOptions<S>,
  handler: RequestHandler<any, InferBody<S>, InferParams<S>>
): RequestHandler<any, any, any> {
  const { schemas, errorMessage = "Validation Failed" } = options;

  return async (req: IpcRequest) => {
    const errors: ValidationErrorDetail[] = [];
    // 1. Validation & Transformation
    const validatedBody = validateSection(
      schemas?.body,
      req?.body,
      "body",
      errors
    );
    const validatedParams = validateSection(
      schemas?.params,
      req?.params,
      "params",
      errors
    );
    const validatedHeaders = validateSection(
      schemas?.headers,
      req?.headers,
      "headers",
      errors
    );

    // 2. Gestion des erreurs agrégées
    if (errors.length > 0) {
      logger.error(
        `Erreur lors de la validation ${JSON.stringify(errors)}`,
        undefined,
        { issues: errors }
      );
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST, {
        issues: errors,
      });
    }

    // 3. Création du contexte sécurisé
    // On force le casting ici car on sait que la validation a réussi
    const safeReq = {
      ...req,
      body: validatedBody,
      params: validatedParams,
      headers: validatedHeaders ?? req.headers,
    } as IpcRequest<InferBody<S>, InferParams<S>>;

    // 4. Exécution du handler métier
    return handler(safeReq);
  };
}
