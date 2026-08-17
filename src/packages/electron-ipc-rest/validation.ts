/**
 * @file validation.ts
 * @description Middleware de validation de schéma utilisant Zod.
 * Assure l'intégrité des données entrant dans les handlers IPC.
 */
import { z } from "zod";
import { HttpStatus } from "./constant";
import type { IpcRequest, RequestHandler } from "./type";
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

interface ValidationErrorDetail {
  location: "body" | "params" | "headers";
  path: string;
  message: string;
}

function getMessageError(
  errors: ValidationErrorDetail[],
  defaultMessage: string,
): string {
  const message = errors
    .map((error) => `${error.location}/${error.path}: ${error.message}`)
    .join(" ");
  return `${defaultMessage} : ${message}`;
}

/**
 * Wraps an IPC request handler with Zod schema validation logic.
 * @param handler - The next request handler to execute upon successful validation.
 * @param schemas - An object containing Zod schemas mapped to request properties.
 * @returns A new request handler that enforces validation before execution.
 */
export function wrapSchemaValidation(
  handler: RequestHandler,
  schemas?: ValidationSchemas,
): RequestHandler {
  return (req: IpcRequest) => {
    const errors: ValidationErrorDetail[] = [];
    const defaultErrorMessage = "Validation Failed";
    const safeData: Partial<IpcRequest> = {};

    if (!schemas) return req;

    const keys = Object.keys(schemas) as (keyof ValidationSchemas &
      keyof IpcRequest)[];

    for (const key of keys) {
      const schema = schemas[key];
      if (schema) {
        safeData[key as string] = validateSchema(
          schema,
          req[key],
          key as ValidationErrorDetail["location"],
          (error) => errors.push(error),
        );
      }
    }

    if (errors.length > 0) {
      throw new HttpException(
        getMessageError(errors, defaultErrorMessage),
        HttpStatus.BAD_REQUEST,
        {
          issues: errors,
        },
      );
    }

    const safeReq: IpcRequest = {
      ...req,
      ...safeData,
    };

    return handler(safeReq);
  };
}

/**
 * Validates data against a Zod schema and reports errors through a callback.
 * @param schema - The Zod schema used to validate the data.
 * @param data - The raw data to be validated.
 * @param location - The origin location of the data (e.g., body, headers).
 * @param callback - Optional function triggered for each validation error discovered.
 * @returns The validated and parsed data, or the original data if validation fails or no schema is provided.
 */
export function validateSchema<Data>(
  schema: z.ZodTypeAny | undefined,
  data: Data,
  location: ValidationErrorDetail["location"],
  callback?: (error: ValidationErrorDetail) => void,
): Data {
  if (!schema) return data;

  const result = schema.safeParse(data);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const safeMessage =
        location === "headers"
          ? "Invalid header value or format"
          : issue.message;

      callback?.({
        location,
        path: issue.path.join("."),
        message: safeMessage,
      });
    });
    return data;
  }
  return result.data as Data;
}
