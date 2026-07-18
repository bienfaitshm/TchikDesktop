import { seatingSessionRepository } from "@/packages/@core/data-access/db/queries/seatings";
import {
  SeatingSessionSchema,
  SeatingSessionCreateSchema,
  SeatingSessionFilterSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { SeatingSessionRoutes } from "../../routes-constant";

const SeatingSessionIdSchema = SeatingSessionSchema.pick({
  sessionId: true,
});

/**
 * Handles Inter-Process Communication (IPC) inbound requests for academic seating session management.
 */
export class SeatingSessionController {
  /**
   * Retrieves all seating sessions matching targeted query filter criteria.
   * @param req - The IPC request context containing standard lookup parameters.
   * @returns A promise resolving to an array of matching seating session records.
   */
  @IpcServer.register(HttpMethod.GET, SeatingSessionRoutes.ALL, {
    params: SeatingSessionFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return seatingSessionRepository.findMany(req.params);
  }

  /**
   * Fetches fundamental specifications of a single seating session via its unique key identifier.
   * @param req - The IPC request context carrying target identification parameters.
   * @returns A promise resolving to the matched seating session object or null.
   */
  @IpcServer.register(HttpMethod.GET, SeatingSessionRoutes.DETAIL, {
    params: SeatingSessionIdSchema,
  })
  static async getById(req: IpcRequest) {
    return seatingSessionRepository.findById(req.params.sessionId);
  }

  /**
   * Retrieves a comprehensive session record combined with its relative layout slot assignments.
   * @param req - The IPC request context carrying target identification parameters.
   * @returns A promise resolving to the detailed structural seating session object.
   */
  @IpcServer.register(HttpMethod.GET, SeatingSessionRoutes.FULL_DETAILS, {
    params: SeatingSessionIdSchema,
  })
  static async getWithAssignments(req: IpcRequest) {
    return seatingSessionRepository.getSessionWithAssignments(
      req.params.sessionId,
    );
  }

  /**
   * Provisions a new seating session record entry inside the application datastore.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized seating session instance.
   */
  @IpcServer.register(HttpMethod.POST, SeatingSessionRoutes.ALL, {
    body: SeatingSessionCreateSchema,
  })
  static async create(req: IpcRequest) {
    return seatingSessionRepository.create(req.body);
  }

  /**
   * Updates attributes on an active institutional seating session designated by parameters.
   * @param req - The IPC request object containing update body payload and identification parameters.
   * @returns A promise resolving to the mutated seating session record instance.
   */
  @IpcServer.register(HttpMethod.PUT, SeatingSessionRoutes.DETAIL, {
    params: SeatingSessionIdSchema,
    body: SeatingSessionCreateSchema,
  })
  static async update(req: IpcRequest) {
    return seatingSessionRepository.update(req.body, req.params);
  }

  /**
   * Purges a targeted seating session and dependent allocations permanently from persistent storage.
   * @param req - The IPC request object carrying target tracking keys.
   * @returns A promise resolving to the terminal execution operational status results.
   */
  @IpcServer.register(HttpMethod.DELETE, SeatingSessionRoutes.DETAIL, {
    params: SeatingSessionIdSchema,
  })
  static async delete(req: IpcRequest) {
    return seatingSessionRepository.delete(req.params.sessionId);
  }

  /**
   * Resolves computational fill ratios and remaining volumetric capacities across session layout rooms.
   * @param req - The IPC request context holding specific session parameter bounds.
   * @returns A promise resolving to structured room occupancy balance metadata.
   */
  @IpcServer.register(HttpMethod.GET, SeatingSessionRoutes.STATUS, {
    params: SeatingSessionIdSchema,
  })
  static async getRoomsStatus(req: IpcRequest) {
    return seatingSessionRepository.getSessionRoomsStatus(req.params.sessionId);
  }
}
