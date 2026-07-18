import { feeTypeService } from "@/packages/@core/data-access/db/queries";
import {
  FeeTypeSchema,
  FeeTypeCreateSchema,
  FeeTypeUpdateSchema,
  FeeTypeFilterSchema,
  FeeTypeBulkCreateSchema,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { FeeTypeRoutes } from "../../routes-constant";

const FeeTypeIdSchema = FeeTypeSchema.pick({ feeTypeId: true });
export const searchFeeTypeOptionsSchema =
  createSearchOptionsSchema(FeeTypeFilterSchema);

/**
 * Handles Inter-Process Communication (IPC) inbound requests for fee type configurations.
 */
export class FeeTypeController {
  /**
   * Retrieves all fee types based on lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching fee types.
   */
  @IpcServer.register(HttpMethod.GET, FeeTypeRoutes.ALL, {
    params: FeeTypeFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return feeTypeService.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown components.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete selection options.
   */
  @IpcServer.register(HttpMethod.GET, FeeTypeRoutes.SEARCH, {
    params: searchFeeTypeOptionsSchema,
  })
  static async getOptions(req: IpcRequest) {
    return feeTypeService.getOptions(req.params);
  }

  /**
   * Creates a new fee type record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized fee type instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeTypeRoutes.ALL, {
    body: FeeTypeCreateSchema,
  })
  static async create(req: IpcRequest) {
    return feeTypeService.create(req.body);
  }

  /**
   * Provisions multiple fee types at once using a collection of inputs.
   * @param req - The IPC request object containing an array of initialization items.
   * @returns A promise resolving to the batch creation execution result.
   */
  @IpcServer.register(HttpMethod.POST, FeeTypeRoutes.BULK, {
    body: FeeTypeBulkCreateSchema,
  })
  static async bulkCreate(req: IpcRequest) {
    return feeTypeService.bulkCreate(req.body.items.map((item) => item.value));
  }

  /**
   * Fetches a specific fee type details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target fee type object or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeTypeRoutes.DETAIL, {
    params: FeeTypeIdSchema,
  })
  static async getById(req: IpcRequest) {
    return feeTypeService.findById(req.params.feeTypeId);
  }

  /**
   * Updates fields on an existing fee type designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated fee type object.
   */
  @IpcServer.register(HttpMethod.PUT, FeeTypeRoutes.DETAIL, {
    params: FeeTypeIdSchema,
    body: FeeTypeUpdateSchema,
  })
  static async update(req: IpcRequest) {
    return feeTypeService.update(req.body, req.params);
  }

  /**
   * Deletes a specific target fee type record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeTypeRoutes.DETAIL, {
    params: FeeTypeIdSchema,
  })
  static async delete(req: IpcRequest) {
    return feeTypeService.delete(req.params.feeTypeId);
  }
}
