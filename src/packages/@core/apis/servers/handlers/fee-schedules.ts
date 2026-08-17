import z from "zod";
import { feeScheduleService } from "@/packages/@core/data-access/db/queries";
import {
  FeeScheduleSchema,
  FeeScheduleCreateSchema,
  FeeScheduleUpdateSchema,
  FeeScheduleFilterSchema,
  FeeScheduleBulkCreateSchema,
  type FeeScheduleFilter,
  type FeeScheduleCreate,
  type FeeScheduleUpdate,
  type FeeScheduleBulkCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { FeeScheduleRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const FeeScheduleIdSchema = FeeScheduleSchema.pick({ scheduleId: true });
type FeeScheduleId = z.infer<typeof FeeScheduleIdSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for fee schedule management.
 */
export class FeeScheduleController {
  /**
   * Retrieves all fee schedules based on standard lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching fee schedules.
   */
  @IpcServer.register(HttpMethod.GET, FeeScheduleRoutes.ALL, {
    params: FeeScheduleFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, FeeScheduleFilter>) {
    return feeScheduleService.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown components.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete selection options.
   */
  @IpcServer.register(HttpMethod.GET, FeeScheduleRoutes.SEARCH, {
    params: FeeScheduleFilterSchema,
  })
  static async getOptions(req: IpcRequest<unknown, FeeScheduleFilter>) {
    return feeScheduleService.getOptions(req.params);
  }

  /**
   * Creates a new fee schedule record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized fee schedule instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeScheduleRoutes.ALL, {
    body: FeeScheduleCreateSchema,
  })
  static async create(req: IpcRequest<FeeScheduleCreate>) {
    return feeScheduleService.create(req.body);
  }

  /**
   * Provisions multiple fee schedules at once using a collection of inputs.
   * @param req - The IPC request object containing an array of initialization items.
   * @returns A promise resolving to the batch creation execution result.
   */
  @IpcServer.register(HttpMethod.POST, FeeScheduleRoutes.BULK, {
    body: FeeScheduleBulkCreateSchema,
  })
  static async bulkCreate(req: IpcRequest<FeeScheduleBulkCreate>) {
    return feeScheduleService.bulkCreate(
      req.body.items.map((item) => item.value),
    );
  }

  /**
   * Fetches a specific fee schedule details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target fee schedule object or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeScheduleRoutes.DETAIL, {
    params: FeeScheduleIdSchema,
  })
  static async getById(req: IpcRequest<unknown, FeeScheduleId>) {
    return feeScheduleService.findById(req.params.scheduleId);
  }

  /**
   * Updates fields on an existing fee schedule designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated fee schedule object.
   */
  @IpcServer.register(HttpMethod.PUT, FeeScheduleRoutes.DETAIL, {
    params: FeeScheduleIdSchema,
    body: FeeScheduleUpdateSchema,
  })
  static async update(req: IpcRequest<FeeScheduleUpdate, FeeScheduleId>) {
    return feeScheduleService.updateById(req.params.scheduleId, req.body);
  }

  /**
   * Deletes a specific target fee schedule record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeScheduleRoutes.DETAIL, {
    params: FeeScheduleIdSchema,
  })
  static async delete(req: IpcRequest<unknown, FeeScheduleId>) {
    return feeScheduleService.delete(req.params.scheduleId);
  }
}
