import { sql } from "drizzle-orm";
import { options } from "../schemas/schema";
import { db, type TDataBase } from "../config";
import { getLogger } from "@/packages/logger";
import { BaseRepository } from "./base-repository";
import type { FindManyOptions } from "../schemas/types";

/**
 * Configuration du tri par défaut : Nom de l'option (Case-Insensitive)
 */
const OPTION_DEFAULT_SORT = {
  orderBy: [{ column: sql`lower(${options.optionName})`, order: "asc" }],
} as unknown as FindManyOptions<typeof options>;

/**
 * Service de gestion des Options Académiques.
 */
export class OptionQuery extends BaseRepository<typeof options, TDataBase> {
  constructor() {
    super({
      db,
      table: options,
      idColumn: options.optionId,
      entityName: "Option",
      logger: getLogger,
      defaultSort: OPTION_DEFAULT_SORT,
    });
  }

  static instance = new OptionQuery();
}

export const optionService = OptionQuery.instance;
