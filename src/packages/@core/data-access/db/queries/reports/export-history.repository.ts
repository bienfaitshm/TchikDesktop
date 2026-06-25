import { getLogger } from "@/packages/logger";
import { db } from "@/packages/@core/data-access/db/config";
import {
  exportHistories,
  type TableExportHistory,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository, type LibSqlClient } from "../base-repository";

const DEFAULT_SORT: FindManyOptions<TableExportHistory> = {
  orderBy: [{ column: "createdAt", order: "asc" }],
};

export class ExportHistoryRepository extends BaseRepository<
  TableExportHistory,
  LibSqlClient
> {
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: exportHistories,
      idColumn: exportHistories.exportId,
      entityName: "ExportHistory",
      logger: getLogger,
      defaultSort: DEFAULT_SORT,
    });
  }
}

export const exportHistoryRepository = new ExportHistoryRepository();
