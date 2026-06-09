import { sql } from "drizzle-orm";
import { BaseRepository } from "../base-repository";
import { localrooms } from "../../schemas/schema";
import { db, type TDataBase } from "../../config";
import type { FindManyOptions } from "../../schemas/types";
import { getLogger } from "@/packages/logger";

const LOCAL_ROOM_SORT = {
  orderBy: [{ column: sql`lower(${localrooms.name})`, order: "asc" }],
} as unknown as FindManyOptions<typeof localrooms>;

export class LocalRoomQuery extends BaseRepository<
  typeof localrooms,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: localrooms,
      idColumn: localrooms.localRoomId,
      entityName: "LocalRoom",
      logger: getLogger,
      defaultSort: LOCAL_ROOM_SORT,
    });
  }
  static instance = new LocalRoomQuery();
}

export const localroomService = LocalRoomQuery.instance;
