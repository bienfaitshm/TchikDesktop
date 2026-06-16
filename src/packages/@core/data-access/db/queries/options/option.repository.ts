import { db } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  options,
  type TableOption,
  type Option,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";

import {
  applyQueryOptions,
  mergeQueryOptions,
} from "@/packages/@core/data-access/db/queries/drizzle-builder";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { createSQLiteSearchFilter } from "../drizzle-utility";

import { BaseRepository, type LibSqlClient } from "../base-repository";

export type BaseOptionFilters = Partial<FindManyOptions<TableOption>>;

const DEFAULT_LIMIT_VALUE = 50;

const OPTION_DEFAULT_SORT: BaseOptionFilters = {
  orderBy: [{ column: "optionName", order: "asc" }],
};

export class OptionRepository
  extends BaseRepository<TableOption, LibSqlClient>
  implements OptionProvider<Option>
{
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: options,
      idColumn: options.optionId,
      entityName: "Option",
      logger: getLogger,
      defaultSort: OPTION_DEFAULT_SORT,
    });
  }

  /**
   * Récupère les utilisateurs pour les composants Select / Combobox.
   * Alterne intelligemment entre recherche textuelle filtrée et données par défaut.
   */
  async fetchOptions({
    filters,
    search,
  }: SearchOptions<BaseOptionFilters> = {}): Promise<Option[]> {
    try {
      let query = this.getQuerySet();

      const searchFilter = createSQLiteSearchFilter(
        [this.table.optionName, this.table.optionShortName],
        search,
      );

      if (searchFilter) {
        const mergedOptions = mergeQueryOptions(filters, OPTION_DEFAULT_SORT);
        query = query.where(searchFilter);

        return (await applyQueryOptions(
          query,
          this.table,
          mergedOptions,
        )) as unknown as Option[];
      }

      const defaultOptions = mergeQueryOptions(
        { limit: DEFAULT_LIMIT_VALUE, ...filters },
        OPTION_DEFAULT_SORT,
      );

      return (await applyQueryOptions(
        query,
        this.table,
        defaultOptions,
      )) as unknown as Option[];
    } catch (error) {
      this.logError("fetchOptions", error, { filters, search });
      throw new Error(
        "Erreur lors de la récupération des options d'utilisateurs.",
      );
    }
  }
}
