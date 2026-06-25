import { getLogger } from "@/packages/logger";
import {
  localrooms,
  type Localroom,
  type TableLocalroom,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { BaseRepository, type LibSqlClient } from "../base-repository";
import { createSQLiteSearchFilter } from "../drizzle-utility";
import { SearchOptions } from "../select-option.transformer";
import { applyQueryOptions, mergeQueryOptions } from "../drizzle-builder";

export type BaseLocalRoomFilters = Partial<FindManyOptions<TableLocalroom>>;

const DEFAULT_LIMIT_VALUE = 50;

const LOCAL_ROOM_SORT: FindManyOptions<TableLocalroom> = {
  orderBy: [{ column: "name", order: "asc" }],
};

/**
 * Repository de gestion des Salles de classe (LocalRoom).
 * Aligné sur l'interface de connexion globale LibSqlClient pour le support des transactions.
 */
export class LocalRoomRepository extends BaseRepository<
  TableLocalroom,
  LibSqlClient
> {
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: localrooms,
      idColumn: localrooms.localroomId,
      entityName: "LocalRoom",
      logger: getLogger,
      defaultSort: LOCAL_ROOM_SORT,
    });
  }

  /**
   * Récupère les utilisateurs pour les composants Select / Combobox.
   * Alterne intelligemment entre recherche textuelle filtrée et données par défaut.
   */
  async fetchOptions({
    filters,
    search,
  }: SearchOptions<BaseLocalRoomFilters> = {}): Promise<Localroom[]> {
    try {
      let query = this.getQuerySet();

      const searchFilter = createSQLiteSearchFilter([this.table.name], search);

      if (searchFilter) {
        const mergedOptions = mergeQueryOptions(filters, LOCAL_ROOM_SORT);
        query = query.where(searchFilter);

        return (await applyQueryOptions(
          query,
          this.table,
          mergedOptions,
        )) as unknown as Localroom[];
      }

      const defaultOptions = mergeQueryOptions(
        { limit: DEFAULT_LIMIT_VALUE, ...filters },
        LOCAL_ROOM_SORT,
      );

      return (await applyQueryOptions(
        query,
        this.table,
        defaultOptions,
      )) as unknown as Localroom[];
    } catch (error) {
      this.logError("fetchOptions", error, { filters, search });
      throw new Error("Erreur lors de la récupération des locaux ");
    }
  }
}
