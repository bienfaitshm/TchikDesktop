import { localRoomService } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { LocalRoomRoutes } from "../../routes-constant";
import {
  LocalroomUpdateSchema,
  LocalroomFilterSchema,
  LocalroomCreateSchema,
  LocalroomSchema,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";

const LocalRoomIdSchema = LocalroomSchema.pick({
  localroomId: true,
}).required();

export const searchLocalRoomSchema = createSearchOptionsSchema(
  LocalroomFilterSchema,
);

/**
 * Handles Inter-Process Communication (IPC) inbound requests for physical school room management.
 */
export class LocalRoomController {
  /**
   * Retrieves all local rooms matching targeted lookup criteria filters.
   * @param req - The IPC request context containing standard filtering parameters.
   * @returns A promise resolving to an array of matching room records.
   */
  @IpcServer.register(HttpMethod.GET, LocalRoomRoutes.ALL, {
    params: LocalroomFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return localRoomService.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown components.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete selection choices.
   */
  @IpcServer.register(HttpMethod.GET, LocalRoomRoutes.SEARCH, {
    params: searchLocalRoomSchema,
  })
  static async getOptions(req: IpcRequest) {
    return localRoomService.getOptions(req.params);
  }

  /**
   * Fetches specific structural room details using a primary identification token.
   * @param req - The IPC request object carrying target identification parameters.
   * @returns A promise resolving to the matched room object, or null.
   */
  @IpcServer.register(HttpMethod.GET, LocalRoomRoutes.DETAIL, {
    params: LocalRoomIdSchema,
  })
  static async getById(req: IpcRequest) {
    return localRoomService.findById(req.params.localroomId);
  }

  /**
   * Provisions a new physical room entity record inside the core database structure.
   * @param req - The IPC request object containing the raw creation payload.
   * @returns A promise resolving to the newly created room record instance.
   */
  @IpcServer.register(HttpMethod.POST, LocalRoomRoutes.ALL, {
    body: LocalroomCreateSchema,
  })
  static async create(req: IpcRequest) {
    return localRoomService.create(req.body);
  }

  /**
   * Updates fields on an existing institutional room designated by parameters.
   * @param req - The IPC request object containing update body payload and identification parameters.
   * @returns A promise resolving to the mutated room object record.
   */
  @IpcServer.register(HttpMethod.PUT, LocalRoomRoutes.DETAIL, {
    params: LocalRoomIdSchema,
    body: LocalroomUpdateSchema,
  })
  static async update(req: IpcRequest) {
    return localRoomService.update(req.body, req.params);
  }

  /**
   * Removes a targeted physical room entry definitively from persistent data storage tables.
   * @param req - The IPC request object carrying target tracking keys.
   * @returns A promise resolving to the operation completion status results.
   */
  @IpcServer.register(HttpMethod.DELETE, LocalRoomRoutes.DETAIL, {
    params: LocalRoomIdSchema,
  })
  static async delete(req: IpcRequest) {
    return localRoomService.delete(req.params.localroomId);
  }
}
