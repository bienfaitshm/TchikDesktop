import { getLogger } from "@/packages/logger";
import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import {
  exportHistories,
  type TableExportHistory,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository } from "@/packages/drizzle-queries";

const DEFAULT_SORT: FindManyOptions<TableExportHistory> = {
  orderBy: [{ column: "createdAt", order: "asc" }],
};

export class ExportHistoryRepository extends BaseRepository<
  TableExportHistory,
  TDataBase
> {
  constructor(database: TDataBase = db) {
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
