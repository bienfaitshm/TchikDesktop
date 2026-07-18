import { walletService } from "@/packages/@core/data-access/db/queries";
import {
  WalletSchema,
  WalletCreateSchema,
  WalletUpdateSchema,
  WalletFilterSchema,
  WalletBulkCreateSchema,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { WalletRoutes } from "../../routes-constant";

const WalletIdSchema = WalletSchema.pick({ walletId: true });
export const searchWalletOptionsSchema =
  createSearchOptionsSchema(WalletFilterSchema);

/**
 * Handles Inter-Process Communication (IPC) inbound requests for financial wallet management.
 */
export class WalletController {
  /**
   * Retrieves all wallets based on standard lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching wallet records.
   */
  @IpcServer.register(HttpMethod.GET, WalletRoutes.ALL, {
    params: WalletFilterSchema,
  })
  static async getAll(req: IpcRequest) {
    return walletService.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown components.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete selection choices.
   */
  @IpcServer.register(HttpMethod.GET, WalletRoutes.SEARCH, {
    params: searchWalletOptionsSchema,
  })
  static async getOptions(req: IpcRequest) {
    return walletService.getOptions(req.params);
  }

  /**
   * Creates a new wallet record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized wallet instance.
   */
  @IpcServer.register(HttpMethod.POST, WalletRoutes.ALL, {
    body: WalletCreateSchema,
  })
  static async create(req: IpcRequest) {
    return walletService.create(req.body);
  }

  /**
   * Provisions multiple wallets at once using a collection of inputs.
   * @param req - The IPC request object containing an array of initialization items.
   * @returns A promise resolving to the batch creation execution result.
   */
  @IpcServer.register(HttpMethod.POST, WalletRoutes.BULK, {
    body: WalletBulkCreateSchema,
  })
  static async bulkCreate(req: IpcRequest) {
    return walletService.bulkCreate(req.body.items.map((item) => item.value));
  }

  /**
   * Fetches a specific wallet details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target wallet object or null.
   */
  @IpcServer.register(HttpMethod.GET, WalletRoutes.DETAIL, {
    params: WalletIdSchema,
  })
  static async getById(req: IpcRequest) {
    return walletService.findById(req.params.walletId);
  }

  /**
   * Updates fields on an existing wallet designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated wallet object.
   */
  @IpcServer.register(HttpMethod.PUT, WalletRoutes.DETAIL, {
    params: WalletIdSchema,
    body: WalletUpdateSchema,
  })
  static async update(req: IpcRequest) {
    return walletService.update(req.body, req.params);
  }

  /**
   * Deletes a specific target wallet record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, WalletRoutes.DETAIL, {
    params: WalletIdSchema,
  })
  static async delete(req: IpcRequest) {
    return walletService.delete(req.params.walletId);
  }
}
