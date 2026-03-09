/**
 * @file utils.ts
 * @description Utilitaires pour la gestion des exceptions, le formatage des canaux IPC et les DTOs de réponse.
 */

import { HttpStatus, isSuccess } from "./constant";

// --- 1. Exception Personnalisée (HttpException) ---

/**
 * @class HttpException
 * @extends Error
 * @description Exception structurée pour propager les erreurs IPC/HTTP du processus Main au Renderer.
 * Contient le code de statut et les détails pour une gestion d'erreur côté client prévisible.
 */
export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = "HttpException";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

// --- 2. Response DTO (IResponse) ---

/**
 * @interface IResponse
 * @description Data Transfer Object (DTO) pour une réponse IPC standardisée.
 * Garantit que le client reçoit toujours un objet prévisible, quel que soit le succès ou l'échec.
 */
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

// --- 3. Fonctions Utilitaires ---

/**
 * Formate le nom du canal IPC en utilisant une convention standard (ex: "users:get").
 * @param resource Le nom de la route ou de la ressource (ex: "users").
 * @param method La méthode HTTP (ex: "GET").
 * @returns Le nom du canal IPC formaté.
 */
export function formatChannelName(resource: string, method: string): string {
  return `${resource}:${method}`.toLowerCase();
}

/**
 * Factory function pour créer une réponse de succès standardisée.
 * @param data Les données à envoyer.
 * @param status Le code de statut de succès (défaut: 200 OK).
 */
export function createResponse<T>(
  data: T,
  status: number = HttpStatus.OK
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
 * @param message Message d'erreur.
 * @param status Code de statut d'erreur (4xx ou 5xx).
 * @param details Données supplémentaires à inclure dans l'erreur.
 */
export function createErrorResponse(
  message: string,
  status: number,
  details?: unknown
): IResponse<null> {
  return {
    data: null,
    error: {
      message,
      code: HttpStatus[status as unknown as keyof typeof HttpStatus] || 0,
      details,
    },
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * @function unwrapResult
 * @description Consomme une Promise de réponse (côté Client/Renderer).
 * Si le statut est en erreur (>= 400), elle rejette la promesse avec une HttpException.
 * @param responsePromise La promesse IResponse.
 * @returns Une Promise qui résout directement au type de données T.
 */
export async function unwrapResult<T>(
  responsePromise: Promise<IResponse<T>>
): Promise<T> {
  const response = await responsePromise;

  if (isSuccess(response.status)) {
    return response.data as T;
  } else {
    const errorMsg = response.error?.message || "Erreur IPC inconnue";
    // Propager l'erreur comme une exception pour une gestion try/catch propre.
    throw new HttpException(errorMsg, response.status, response.error?.details);
  }
}
