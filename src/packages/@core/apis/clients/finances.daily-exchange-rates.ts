import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  DailyExchangeRateCreate,
  DailyExchangeRateUpdate,
  DailyExchangeRateFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { DailyExchangeRate } from "@/packages/@core/data-access/db/schemas";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { DailyExchangeRateRoutes } from "../routes-constant";

export type DailyExchangeRateApi = Readonly<{
  fetchDailyExchangeRates(
    params?: DailyExchangeRateFilter,
  ): Promise<DailyExchangeRate[]>;
  fetchDailyExchangeRatesAsOptions(
    params?: DailyExchangeRateFilter,
  ): Promise<(SelectOption & DailyExchangeRate)[]>;
  fetchDailyExchangeRateById(rateId: string): Promise<DailyExchangeRate>;
  createDailyExchangeRate(
    data: DailyExchangeRateCreate,
  ): Promise<DailyExchangeRate>;
  updateDailyExchangeRate(
    rateId: string,
    data: DailyExchangeRateUpdate,
  ): Promise<DailyExchangeRate>;
  deleteDailyExchangeRate(rateId: string): Promise<void>;
}>;

export function createDailyExchangeRateApis(
  ipcClient: IpcClient,
): DailyExchangeRateApi {
  return {
    fetchDailyExchangeRates(params) {
      return ipcClient.get(DailyExchangeRateRoutes.ALL, { params });
    },
    fetchDailyExchangeRatesAsOptions(params) {
      return ipcClient.get(DailyExchangeRateRoutes.SEARCH, { params });
    },
    fetchDailyExchangeRateById(rateId) {
      return ipcClient.get(DailyExchangeRateRoutes.DETAIL, {
        params: { rateId },
      });
    },
    createDailyExchangeRate(data) {
      return ipcClient.post(DailyExchangeRateRoutes.ALL, data);
    },
    updateDailyExchangeRate(rateId, data) {
      return ipcClient.put(DailyExchangeRateRoutes.DETAIL, data, {
        params: { rateId },
      });
    },
    deleteDailyExchangeRate(rateId) {
      return ipcClient.delete(DailyExchangeRateRoutes.DETAIL, {
        params: { rateId },
      });
    },
  };
}
