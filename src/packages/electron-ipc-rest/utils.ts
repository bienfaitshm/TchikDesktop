import { HttpStatus, isSuccess } from "./constant";

export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message);
    this.name = "HttpException";
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export interface IResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    code: string | number;
    details?: unknown;
  } | null;
  status: number;
  timestamp: string;
}

/**
 * Version mise à jour : Le pattern Gateway utilise "method:path" (ex: "get:/users").
 * On standardise les séparateurs pour éviter les surprises entre Windows/Mac/Linux.
 */
export function formatChannelName(resource: string, method: string): string {
  const cleanResource = resource.replace(/^\/+|\/+$/g, "");
  return `${method.toUpperCase()}:${cleanResource}`.toLowerCase();
}

/**
 * Factory function pour créer une réponse de succès standardisée.
 */
export function createResponse<T>(
  data: T,
  status: number = HttpStatus.OK,
): IResponse<T> {
  return {
    data,
    error: null,
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Factory function pour créer une réponse d'erreur standardisée.
 */
export function createErrorResponse(
  message: string,
  status: number,
  details?: unknown,
): IResponse<null> {
  let codeName: string | number = "UNKNOWN_ERROR";
  try {
    const lookup = HttpStatus[status as unknown as keyof typeof HttpStatus];
    if (lookup) codeName = lookup;
  } catch {
    codeName = status;
  }

  return {
    data: null,
    error: {
      message,
      code: codeName,
      details,
    },
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Consomme une Promise de réponse (côté Client/Renderer).
 */
export async function unwrapResult<T>(
  responsePromise: Promise<IResponse<T>>,
): Promise<T> {
  const response = await responsePromise;

  if (isSuccess(response.status)) {
    if (response.data === null || response.data === undefined) {
      throw new HttpException(
        "Response parsed successfully but returned empty data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return response.data;
  }

  const errorMsg = response.error?.message || "IPC Communication Error";
  const errorDetails = response.error?.details;

  throw new HttpException(errorMsg, response.status, errorDetails);
}
