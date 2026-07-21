import { dailyExchangeRateRepository } from "@/packages/@core/data-access/db/queries";
import {
  DailyExchangeRateSchema,
  DailyExchangeRateCreateSchema,
  DailyExchangeRateUpdateSchema,
  DailyExchangeRateFilterSchema,
  type DailyExchangeRateCreate,
  type DailyExchangeRateUpdate,
  type DailyExchangeRateFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { DailyExchangeRateRoutes } from "../../routes-constant";
import z from "zod";

const RateIdSchema = DailyExchangeRateSchema.pick({ rateId: true });
type RateId = z.infer<typeof RateIdSchema>;

const SearchOptionsSchema = DailyExchangeRateFilterSchema;

/**
 * Handles Inter-Process Communication (IPC) inbound requests for daily exchange rates.
 */
export class DailyExchangeRateController {
  /**
   * Retrieves all daily exchange rates based on query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of exchange rates.
   */
  @IpcServer.register(HttpMethod.GET, DailyExchangeRateRoutes.ALL, {
    params: SearchOptionsSchema,
  })
  static async getAll(req: IpcRequest<unknown, DailyExchangeRateFilter>) {
    return dailyExchangeRateRepository.findMany(req.params);
  }

  /**
   * Retrieves the latest daily exchange rates matching specific criteria.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to the latest exchange rate records.
   */
  @IpcServer.register(HttpMethod.GET, DailyExchangeRateRoutes.LTS, {
    params: SearchOptionsSchema,
  })
  static async getLatest(req: IpcRequest<unknown, DailyExchangeRateFilter>) {
    return dailyExchangeRateRepository.getLatestExchangeRate(req.params);
  }

  /**
   * Creates a new daily exchange rate entry.
   * @param req - The IPC request object containing the raw creation payload.
   * @returns A promise resolving to the created exchange rate instance.
   */
  @IpcServer.register(HttpMethod.POST, DailyExchangeRateRoutes.ALL, {
    body: DailyExchangeRateCreateSchema,
  })
  static async create(req: IpcRequest<DailyExchangeRateCreate>) {
    return dailyExchangeRateRepository.create(req.body);
  }

  /**
   * Fetches a specific daily exchange rate by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target exchange rate object or null.
   */
  @IpcServer.register(HttpMethod.GET, DailyExchangeRateRoutes.DETAIL, {
    params: RateIdSchema,
  })
  static async getById(req: IpcRequest<unknown, RateId>) {
    return dailyExchangeRateRepository.findById(req.params.rateId);
  }

  /**
   * Updates fields on an existing exchange rate designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated exchange rate object.
   */
  @IpcServer.register(HttpMethod.PUT, DailyExchangeRateRoutes.DETAIL, {
    params: RateIdSchema,
    body: DailyExchangeRateUpdateSchema,
  })
  static async update(req: IpcRequest<DailyExchangeRateUpdate, RateId>) {
    return dailyExchangeRateRepository.updateById(req.params.rateId, req.body);
  }

  /**
   * Deletes a specific target daily exchange rate record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, DailyExchangeRateRoutes.DETAIL, {
    params: RateIdSchema,
  })
  static async delete(req: IpcRequest<unknown, RateId>) {
    return dailyExchangeRateRepository.delete(req.params.rateId);
  }
}
