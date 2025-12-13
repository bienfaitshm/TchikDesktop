import type { Model } from "sequelize";
import {
  HttpException,
  HttpStatus,
  IpcRequest,
  RequestHandler,
} from "@/commons/libs/electron-ipc-rest";
import { resolveToPlain, resolveToPlainList } from "@/main/db/models/utils";

/**
 * Represents a function that performs a database operation.
 * It is agnostic of HTTP concerns (status codes, headers).
 */
export type RepositoryAction<TBody, TParams, TModel extends Model> = (
  request: IpcRequest<TBody, TParams>
) => Promise<TModel | TModel[] | null> | TModel | TModel[] | null;

/**
 * Configuration options for the persistence handler wrapper.
 */
export interface PersistenceHandlerOptions {
  /** Custom error message for 500 Internal Server Errors. */
  errorMessage?: string;
  /** Custom error message for 404 Not Found errors. */
  notFoundMessage?: string;
  /** Optional context string for logging (e.g., "UserController.getAll"). */
  context?: string;
}

const DEFAULT_ERROR_MSG = "Internal Persistence Error";
const DEFAULT_NOT_FOUND_MSG = "Resource not found";

/**
 * Wraps a repository action into a safe, validated HTTP handler.
 * * Features:
 * - Automatic serialization (Model -> Plain Object).
 * - Null safety (throws 404 if result is nullish).
 * - Error Boundary (catches crashes and normalizes to 500).
 * * @template TRes - Expected response type (DTO).
 * @template TBody - Request body type.
 * @template TParams - Request parameters type.
 * @template TModel - Sequelize Model type.
 * * @param action - The database logic function.
 * @param options - Configuration for error messages and logging.
 * @returns A validated handler ready for the router.
 */
export function createPersistenceHandler<
  TRes = unknown,
  TBody = unknown,
  TParams = undefined,
  TModel extends Model = Model,
>(
  action: RepositoryAction<TBody, TParams, TModel>,
  options: PersistenceHandlerOptions = {}
): RequestHandler<TRes, TBody, TParams> {
  // Pre-compute messages to avoid object creation on every request
  const notFoundMsg = options.notFoundMessage ?? DEFAULT_NOT_FOUND_MSG;
  const errorMsg = options.errorMessage ?? DEFAULT_ERROR_MSG;
  const context = options.context ?? "PersistenceHandler";

  return async (request) => {
    try {
      // 1. Execute Business Logic
      const result = await action(request);

      // 2. Null Safety Guard (404)
      if (result === null || result === undefined) {
        throw new HttpException(notFoundMsg, HttpStatus.NOT_FOUND);
      }

      // 3. Serialization Strategy (Model -> DTO)
      // We rely on the utility functions to handle the "Sequelize to JSON" transformation.
      const response = Array.isArray(result)
        ? await resolveToPlainList(result)
        : await resolveToPlain(result);

      // Type assertion is necessary here as generic inference between Model and DTO is complex
      return response as unknown as TRes;
    } catch (error) {
      // 4. Error Boundary

      // Pass-through for existing HttpExceptions (e.g. from validation or manual throws)
      if (error instanceof HttpException) {
        throw error;
      }

      // Structured Logging (Simulated)
      console.error(`[${context}] Transaction failed:`, {
        error: error instanceof Error ? error.message : error,
      });

      // Fail gracefully with a generic 500
      throw new HttpException(errorMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}
