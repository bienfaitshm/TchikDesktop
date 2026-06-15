import { getLogger } from "@/packages/logger";
import {
  options,
  type TableOption,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { BaseRepository, type LibSqlClient } from "./base-repository";

const OPTION_DEFAULT_SORT: FindManyOptions<TableOption> = {
  orderBy: [{ column: "optionName", order: "asc" }],
};

export class OptionRepository extends BaseRepository<
  TableOption,
  LibSqlClient
> {
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
}

export const optionRepository = new OptionRepository();
