import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  options,
  type TableOption,
  type Option,
} from "@/packages/@core/data-access/db/schemas";
import {
  betterSqlite,
  helpers,
  OptionProvider,
} from "@/packages/drizzle-queries";

const _optionJoinTables = {
  options,
} as const;

export type BaseOptionFilters = helpers.FindManyOptions<
  typeof _optionJoinTables
>;

const OPTION_DEFAULT_SORT: BaseOptionFilters = {
  orderBy: [{ table: "options", column: "optionName", order: "asc" }],
};

export class OptionRepository
  extends betterSqlite.BaseRepository<
    TableOption,
    TDataBase,
    Option,
    BaseOptionFilters
  >
  implements OptionProvider<Option>
{
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: options,
      idColumn: options.optionId,
      baseTableName: "options",
      logger: getLogger,
      defaultFilters: OPTION_DEFAULT_SORT,
      joinTables: _optionJoinTables,
    });
  }

  fetchOptions(filters?: BaseOptionFilters) {
    return this.findMany(filters);
  }
}
