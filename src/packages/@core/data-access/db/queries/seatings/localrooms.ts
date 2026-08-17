import { getLogger } from "@/packages/logger";
import {
  localrooms,
  type Localroom,
  type TableLocalroom,
} from "@/packages/@core/data-access/db/schemas";
import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";

const _localJoinTables = {
  localrooms,
} as const;

export type BaseLocalRoomFilters = helpers.FindManyOptions<
  typeof _localJoinTables
>;

const LOCAL_ROOM_SORT: BaseLocalRoomFilters = {
  orderBy: [{ table: "localrooms", column: "name", order: "asc" }],
  limit: 50,
};

/**
 * Repository for managing LocalRoom entities with support for global TDataBase transactions.
 */
export class LocalRoomRepository
  extends betterSqlite.BaseRepository<
    TableLocalroom,
    TDataBase,
    BaseLocalRoomFilters
  >
  implements OptionProvider<Localroom, BaseLocalRoomFilters>
{
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: localrooms,
      idColumn: localrooms.localroomId,
      baseTableName: "localrooms",
      logger: getLogger,
      defaultFilters: LOCAL_ROOM_SORT,
      joinTables: _localJoinTables,
    });
  }

  /**
   * Retrieves local rooms for select/combobox components using optional filters.
   * @param filters - Optional query parameters for filtering and pagination.
   * @returns Array of matching local room records.
   */
  fetchOptions(filters?: BaseLocalRoomFilters) {
    return this.findMany(filters);
  }
}
