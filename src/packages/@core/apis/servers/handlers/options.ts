import z from "zod";
import {
  optionRepository,
  optionService,
} from "@/packages/@core/data-access/db/queries";
import {
  OptionFilterSchema,
  OptionCreateSchema,
  OptionUpdateSchema,
  OptionSchema,
  type OptionFilter,
  type OptionCreate,
  type OptionUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { OptionRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const OptionIdSchema = OptionSchema.pick({ optionId: true });
type OptionId = z.infer<typeof OptionIdSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for core options management.
 */
export class OptionController {
  /**
   * Retrieves all options based on lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching options.
   */
  @IpcServer.register(HttpMethod.GET, OptionRoutes.ALL, {
    params: OptionFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, OptionFilter>) {
    return optionRepository.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown components.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete selection options.
   */
  @IpcServer.register(HttpMethod.GET, OptionRoutes.SEARCH, {
    params: OptionFilterSchema,
  })
  static async getOptions(req: IpcRequest<unknown, OptionFilter>) {
    return optionService.getOptions(req.params);
  }

  /**
   * Creates a new option record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized option instance.
   */
  @IpcServer.register(HttpMethod.POST, OptionRoutes.ALL, {
    body: OptionCreateSchema,
  })
  static async create(req: IpcRequest<OptionCreate>) {
    return optionRepository.create(req.body);
  }

  /**
   * Fetches a specific option details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target option object or null.
   */
  @IpcServer.register(HttpMethod.GET, OptionRoutes.DETAIL, {
    params: OptionIdSchema,
  })
  static async getById(req: IpcRequest<unknown, OptionId>) {
    return optionRepository.findById(req.params.optionId);
  }

  /**
   * Updates fields on an existing option designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated option object.
   */
  @IpcServer.register(HttpMethod.PUT, OptionRoutes.DETAIL, {
    params: OptionIdSchema,
    body: OptionUpdateSchema,
  })
  static async update(req: IpcRequest<OptionUpdate, OptionId>) {
    return optionRepository.updateById(req.params.optionId, req.body);
  }

  /**
   * Deletes a specific target option record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, OptionRoutes.DETAIL, {
    params: OptionIdSchema,
  })
  static async delete(req: IpcRequest<unknown, OptionId>) {
    return optionRepository.delete(req.params.optionId);
  }
}
