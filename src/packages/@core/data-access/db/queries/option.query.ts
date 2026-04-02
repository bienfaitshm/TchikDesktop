import { sql } from "drizzle-orm";
import { options } from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import type {
  FindManyOptions,
  TOption,
  TOptionInsert,
  TOptionUpdate,
} from "../schemas/types";

/**
 * Configuration du tri par défaut : Nom de l'option (Case-Insensitive)
 */
const OPTION_DEFAULT_SORT = {
  orderBy: [{ column: sql`lower(${options.optionName})`, order: "asc" }],
} as unknown as FindManyOptions<typeof options>;

/**
 * Service de gestion des Options Académiques.
 * Hérite de BaseRepository pour les opérations CRUD standards.
 */
export class OptionQuery extends BaseRepository<
  typeof options,
  TOption,
  TOptionInsert,
  TOptionUpdate
> {
  constructor() {
    super(options, options.optionId, "Option", OPTION_DEFAULT_SORT);
  }

  static instance = new OptionQuery();
}

// Export Singleton pour injection de dépendances ou utilisation directe
export const optionService = OptionQuery.instance;
