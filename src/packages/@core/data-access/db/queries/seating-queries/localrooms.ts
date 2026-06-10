import { BaseRepository } from "../base-repository";
import { localrooms, type TableLocalroom } from "../../schemas/schema";
import { db, type TDataBase } from "../../config";
import type { FindManyOptions } from "../../schemas/types";
import { getLogger } from "@/packages/logger";

const LOCAL_ROOM_SORT: FindManyOptions<TableLocalroom> = {
  orderBy: [{ column: "name", order: "asc" }],
};

export class LocalRoomQuery extends BaseRepository<
  typeof localrooms,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: localrooms,
      idColumn: localrooms.localroomId,
      entityName: "LocalRoom",
      logger: getLogger,
      defaultSort: LOCAL_ROOM_SORT,
    });
  }
  static instance = new LocalRoomQuery();
}

export const localroomService = LocalRoomQuery.instance;
