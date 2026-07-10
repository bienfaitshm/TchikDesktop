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

/* =========================================================================
   Erreur racine (Base de données)
   ========================================================================= */

export class DatabaseError extends Error {
  public readonly originalError: unknown;
  public readonly code?: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = this.constructor.name;
    this.originalError = options?.cause;

    if (isErrorWithCode(options?.cause)) {
      this.code = options.cause.code;
    }
  }

  /**
   * Factory method : analyse l'erreur brute et retourne la sous-classe appropriée.
   * Désormais compatible SQLite, PostgreSQL, MySQL et autres.
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

    const errorString = `${code ?? ""} ${message}`.toUpperCase();

    // --- Verrous / accès concurrent (SQLite & autres) ---
    // SQLite : 5 = SQLITE_BUSY, 6 = SQLITE_LOCKED
    if (
      code === "5" ||
      code === "6" ||
      /^54[0-9]{2}$/i.test(code ?? "") || // PostgreSQL lock codes (ex: 54P1)
      errorString.includes("DATABASE IS LOCKED") ||
      errorString.includes("LOCKED") ||
      errorString.includes("BUSY")
    ) {
      return new DatabaseLockedError(
        "The database is currently locked or busy",
        { cause: error },
      );
    }

    // --- Corruption de la base ---
    // SQLite : 11 = SQLITE_CORRUPT
    if (
      code === "11" ||
      errorString.includes("CORRUPT") ||
      errorString.includes("MALFORMED")
    ) {
      return new DatabaseCorruptionError(
        "The database file appears to be corrupted",
        { cause: error },
      );
    }

    // --- Violation d'unicité (HTTP 409) ---
    // PostgreSQL : 23505, MySQL : ER_DUP_ENTRY, SQLite : message "UNIQUE constraint"
    if (
      code?.match(/23505|ER_DUP_ENTRY/i) ||
      errorString.includes("UNIQUE CONSTRAINT")
    ) {
      return new UniqueConstraintError("Unique constraint violation", {
        cause: error,
      });
    }

    // --- Violation de clé étrangère (HTTP 400/409) ---
    // PostgreSQL : 23503, MySQL : ER_NO_REFERENCED_ROW, SQLite : message "FOREIGN KEY"
    if (
      code?.match(/23503|ER_NO_REFERENCED_ROW/i) ||
      errorString.includes("FOREIGN KEY")
    ) {
      return new ForeignKeyConstraintError("Foreign key constraint violation", {
        cause: error,
      });
    }

    // --- Erreurs de syntaxe / données invalides (HTTP 400) ---
    // PostgreSQL : 22P02, 42601, SQLite : 1 (SQLITE_ERROR) avec message "syntax error"
    if (
      code === "1" ||
      code?.match(/22P02|42601/i) ||
      errorString.includes("SYNTAX ERROR") ||
      errorString.includes('NEAR "') // motif typique des erreurs SQLite
    ) {
      return new DataCorruptionError("Invalid data format or syntax error", {
        cause: error,
      });
    }

    // --- Disque plein / impossible d'ouvrir (peut être mappé selon besoins) ---
    if (code === "13" || code === "14" || errorString.includes("DISK FULL")) {
      return new DatabaseError("Disk full or unable to open database file", {
        cause: error,
      });
    }

    // Fallback
    return new DatabaseError(fallbackMessage, { cause: error });
  }
}

/* =========================================================================
   Sous-classes métier
   ========================================================================= */

export class UniqueConstraintError extends DatabaseError {
  constructor(
    message = "Record already exists",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class ForeignKeyConstraintError extends DatabaseError {
  constructor(
    message = "Referenced record does not exist",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class DataCorruptionError extends DatabaseError {
  constructor(
    message = "Data format rejected by database",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** Nouvelle classe : base verrouillée (concurrence, timeout) */
export class DatabaseLockedError extends DatabaseError {
  constructor(
    message = "Database is locked or busy",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** Nouvelle classe : fichier de base de données corrompu */
export class DatabaseCorruptionError extends DatabaseError {
  constructor(
    message = "Database file is corrupted",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/* =========================================================================
   Erreurs liées au Pattern Repository (inchangées)
   ========================================================================= */

export class RepositoryError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

export class RecordNotFoundError extends RepositoryError {
  constructor(entityName = "Record", options?: { cause?: unknown }) {
    super(`${entityName} not found`, options);
  }
}

export class TransactionError extends RepositoryError {
  constructor(
    message = "Transaction failed and was rolled back",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}
