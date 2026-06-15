import { getLogger } from "@/packages/logger";
import {
  localrooms,
  type TableLocalroom,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { BaseRepository, type LibSqlClient } from "../base-repository";

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
}

export const localRoomRepository = new LocalRoomRepository();
