/**
 * @file constant.ts
 * @description Fichier de constantes pour les méthodes et les statuts HTTP.
 * Utilise des objets 'as const' pour garantir l'immutabilité et permettre l'inférence de types union stricts.
 */

// --- 1. Méthodes HTTP ---

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;

/** Type union représentant les méthodes HTTP valides. */
export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

// --- 2. Codes de Statut HTTP ---

export const HttpStatus = {
  // 2xx Success
  /** 200 OK: La requête a réussi. */
  OK: 200,
  /** 201 CREATED: La requête a réussi et une nouvelle ressource a été créée. */
  CREATED: 201,
  /** 202 ACCEPTED: La requête a été acceptée pour traitement. */
  ACCEPTED: 202,
  /** 204 NO CONTENT: La requête a réussi mais ne renvoie pas de contenu. */
  NO_CONTENT: 204,

  // 4xx Client Errors
  /** 400 BAD REQUEST: Le serveur ne peut pas comprendre la requête. */
  BAD_REQUEST: 400,
  /** 401 UNAUTHORIZED: Authentification requise. */
  UNAUTHORIZED: 401,
  /** 403 FORBIDDEN: Le client n'a pas les droits d'accès. */
  FORBIDDEN: 403,
  /** 404 NOT FOUND: La ressource est introuvable. */
  NOT_FOUND: 404,
  /** 405 METHOD NOT ALLOWED: Méthode non autorisée. */
  METHOD_NOT_ALLOWED: 405,
  /** 409 CONFLICT: Conflit (ex: doublon). */
  CONFLICT: 409,
  /** 422 UNPROCESSABLE ENTITY: Erreurs de validation sémantique. */
  UNPROCESSABLE_ENTITY: 422,
  /** 429 TOO MANY REQUESTS: Trop de requêtes. */
  TOO_MANY_REQUESTS: 429,
  /** 499 CLIENT CLOSED REQUEST: (Non-standard Nginx). Le client a fermé la connexion. */
  CLIENT_CLOSED_REQUEST: 499,

  // 5xx Server Errors
  /** 500 INTERNAL SERVER ERROR: Erreur générique du serveur. */
  INTERNAL_SERVER_ERROR: 500,
  /** 502 BAD GATEWAY: Réponse invalide d'un serveur en amont. */
  BAD_GATEWAY: 502,
  /** 503 SERVICE UNAVAILABLE: Service temporairement indisponible. */
  SERVICE_UNAVAILABLE: 503,
  /** 504 GATEWAY TIMEOUT: Le serveur n'a pas reçu de réponse à temps. */
  GATEWAY_TIMEOUT: 504,
} as const;

/** Type union représentant les codes de statut HTTP valides. */
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

// --- 3. Helpers ---

/**
 * Vérifie si un code de statut HTTP indique un succès (plage 2xx).
 * @param status Le code de statut à vérifier.
 */
export function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}
