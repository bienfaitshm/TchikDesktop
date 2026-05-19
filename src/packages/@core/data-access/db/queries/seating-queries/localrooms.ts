import { sql } from "drizzle-orm";
import { BaseRepository } from "../base-repository";
import { localRooms } from "../../schemas/schema";
import { db, type TDataBase } from "../../config";
import type { FindManyOptions } from "../../schemas/types";
import { getLogger } from "@/packages/logger";

const LOCAL_ROOM_SORT = {
  orderBy: [{ column: sql`lower(${localRooms.name})`, order: "asc" }],
} as unknown as FindManyOptions<typeof localRooms>;

export class LocalRoomQuery extends BaseRepository<
  typeof localRooms,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: localRooms,
      idColumn: localRooms.localRoomId,
      entityName: "LocalRoom",
      logger: getLogger,
      defaultSort: LOCAL_ROOM_SORT,
    });
  }
  static instance = new LocalRoomQuery();
}

export const localRoomService = LocalRoomQuery.instance;
