// Type guard utilitaire pour éviter le casting massif avec `any`
function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    error instanceof Error ||
    (typeof error === "object" && error !== null && "message" in error)
  );
}

/**
 * Erreur racine pour toutes les interactions Base de Données
 */
export class DatabaseError extends Error {
  public readonly originalError: unknown;
  public readonly code?: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    // Permet à toutes les classes enfants d'hériter dynamiquement de leur vrai nom de classe
    this.name = this.constructor.name;
    this.originalError = options?.cause;

    // Extraction propre du code sans `any`
    if (isErrorWithCode(options?.cause)) {
      this.code = options.cause.code;
    }
  }

  /**
   * Factory method : Analyse l'erreur brute de la DB et retourne la sous-classe appropriée.
   * C'est ici que la magie opère pour mapper les erreurs SQL vers des erreurs Métier.
   */
  static from(
    error: unknown,
    fallbackMessage = "A database error occurred",
  ): DatabaseError {
    if (error instanceof DatabaseError) return error;

    let code: string | undefined;
    let message = fallbackMessage;

    if (isErrorWithCode(error)) code = error.code;
    if (isErrorWithMessage(error)) message = error.message;

    const errorString = `${code} ${message}`.toUpperCase();

    // Mapping des erreurs d'unicité (HTTP 409 Conflict)
    if (
      code?.match(/23505|ER_DUP_ENTRY/i) ||
      errorString.includes("UNIQUE CONSTRAINT")
    ) {
      return new UniqueConstraintError("Unique constraint violation", {
        cause: error,
      });
    }

    // Mapping des erreurs de clés étrangères (HTTP 400 ou 409)
    if (
      code?.match(/23503|ER_NO_REFERENCED_ROW/i) ||
      errorString.includes("FOREIGN KEY")
    ) {
      return new ForeignKeyConstraintError("Foreign key constraint violation", {
        cause: error,
      });
    }

    // Mapping des erreurs de syntaxe ou de données invalides (HTTP 400)
    if (code?.match(/22P02|42601/i) || errorString.includes("SYNTAX ERROR")) {
      return new DataCorruptionError("Invalid data format or syntax error", {
        cause: error,
      });
    }

    return new DatabaseError(fallbackMessage, { cause: error });
  }
}

/* =========================================================================
   Sous-classes d'erreurs DB spécifiques (Pour un mapping HTTP facile)
   ========================================================================= */

/** Lancée quand une insertion créerait un doublon interdit (Ex: email déjà pris) */
export class UniqueConstraintError extends DatabaseError {
  constructor(
    message: string = "Record already exists",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** Lancée quand on pointe vers un ID qui n'existe pas dans une autre table */
export class ForeignKeyConstraintError extends DatabaseError {
  constructor(
    message: string = "Referenced record does not exist",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** Lancée quand la DB refuse le format de la donnée (ex: UUID invalide) */
export class DataCorruptionError extends DatabaseError {
  constructor(
    message: string = "Data format rejected by database",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/* =========================================================================
   Erreurs liées au Pattern Repository (Logique métier)
   ========================================================================= */

export class RepositoryError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

/** Lancée quand on cherche un élément par ID/Slug et qu'il n'existe pas (HTTP 404) */
export class RecordNotFoundError extends RepositoryError {
  constructor(entityName: string = "Record", options?: { cause?: unknown }) {
    super(`${entityName} not found`, options);
  }
}

/** Lancée quand une transaction métier échoue (rollback) */
export class TransactionError extends RepositoryError {
  constructor(
    message: string = "Transaction failed and was rolled back",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}
