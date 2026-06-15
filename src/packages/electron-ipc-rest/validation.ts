/**
 * @file validation.ts
 * @description Middleware de validation de schéma utilisant Zod.
 * Assure l'intégrité des données entrant dans les handlers IPC.
 */
import { z } from "zod";
import { HttpStatus } from "./constant";
import type { IpcRequest, RequestHandler } from "./ipc";
import { HttpException } from "./utils";

export interface ValidationSchemas<
  TBody extends z.ZodTypeAny = z.ZodTypeAny,
  TParams extends z.ZodTypeAny = z.ZodTypeAny,
  THeaders extends z.ZodTypeAny = z.ZodTypeAny,
> {
  body?: TBody;
  params?: TParams;
  headers?: THeaders;
}

interface ValidatorOptions<
  TBody extends z.ZodTypeAny = z.ZodTypeAny,
  TParams extends z.ZodTypeAny = z.ZodTypeAny,
  THeaders extends z.ZodTypeAny = z.ZodTypeAny,
> {
  schemas: ValidationSchemas<TBody, TParams, THeaders>;
  errorMessage?: string;
}

interface ValidationErrorDetail {
  location: "body" | "params" | "headers";
  path: string;
  message: string;
}

// 2. createValidatedHandler devient le seul point d'entrée et extrait les types directement des schémas passés en option
export function createValidatedHandler<
  TBodySchema extends z.ZodTypeAny,
  TParamsSchema extends z.ZodTypeAny,
  THeadersSchema extends z.ZodTypeAny,
>(
  options: ValidatorOptions<TBodySchema, TParamsSchema, THeadersSchema>,
  handler: RequestHandler<
    any,
    z.output<TBodySchema>,
    z.output<TParamsSchema>,
    z.output<THeadersSchema>
  >,
): RequestHandler<any, any, any, any> {
  const { schemas, errorMessage = "Validation Failed" } = options;

  return async (req: IpcRequest) => {
    const errors: ValidationErrorDetail[] = [];

    const safeData = {
      body: req.body,
      params: req.params,
      headers: req.headers,
    };

    const validate = (
      schema: z.ZodTypeAny | undefined,
      data: unknown,
      location: ValidationErrorDetail["location"],
    ) => {
      if (!schema) return data;

      console.log("VALIDATION", JSON.stringify(data, null, 4));
      const result = schema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const safeMessage =
            location === "headers"
              ? "Invalid header value or format"
              : issue.message;

          errors.push({
            location,
            path: issue.path.join("."),
            message: safeMessage,
          });
        });
        return data;
      }
      return result.data;
    };

    safeData.body = validate(schemas.body, req.body, "body");
    safeData.params = validate(schemas.params, req.params, "params");
    safeData.headers = validate(schemas.headers, req.headers, "headers");

    if (errors.length > 0) {
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST, {
        issues: errors,
      });
    }

    // Ici, le typage est garanti par Zod et l'inférence de la fonction
    const safeReq: IpcRequest<
      z.output<TBodySchema>,
      z.output<TParamsSchema>,
      z.output<THeadersSchema>
    > = {
      ...req,
      body: safeData.body,
      params: safeData.params,
      headers: safeData.headers,
    };

    return handler(safeReq);
  };
}
