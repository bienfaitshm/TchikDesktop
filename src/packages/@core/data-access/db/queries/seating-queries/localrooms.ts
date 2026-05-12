import { sql } from "drizzle-orm";
import { BaseRepository } from "../base-repository";
import { localRooms } from "../../schemas/schema";
import type {
  TLocalRoom,
  TLocalRoomInsert,
  TLocalRoomUpdate,
  FindManyOptions,
} from "../../schemas/types";

const LOCAL_ROOM_SORT = {
  orderBy: [{ column: sql`lower(${localRooms.name})`, order: "asc" }],
} as unknown as FindManyOptions<typeof localRooms>;

export class LocalRoomQuery extends BaseRepository<
  typeof localRooms,
  TLocalRoom,
  TLocalRoomInsert,
  TLocalRoomUpdate
> {
  constructor() {
    super(localRooms, localRooms.localRoomId, "LocalRoom", LOCAL_ROOM_SORT);
  }
  static instance = new LocalRoomQuery();
}

export const localRoomService = LocalRoomQuery.instance;
