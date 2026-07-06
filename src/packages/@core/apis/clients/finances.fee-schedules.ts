import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeScheduleCreate,
  FeeScheduleUpdate,
  FeeScheduleFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeSchedule } from "@/packages/@core/data-access/db/schemas";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { FeeScheduleRoutes } from "../routes-constant";

export type FeeScheduleApi = Readonly<{
  fetchFeeSchedules(params?: FeeScheduleFilter): Promise<FeeSchedule[]>;
  fetchFeeSchedulesAsOptions(
    params?: FeeScheduleFilter,
  ): Promise<(SelectOption & FeeSchedule)[]>;
  fetchFeeScheduleById(scheduleId: string): Promise<FeeSchedule>;
  fetchFeeSchedulesByFeeType(feeTypeId: string): Promise<FeeSchedule[]>;
  createFeeSchedule(data: FeeScheduleCreate): Promise<FeeSchedule>;
  updateFeeSchedule(
    scheduleId: string,
    data: FeeScheduleUpdate,
  ): Promise<FeeSchedule>;
  deleteFeeSchedule(scheduleId: string): Promise<void>;
}>;

export function createFeeScheduleApis(ipcClient: IpcClient): FeeScheduleApi {
  return {
    fetchFeeSchedules(params) {
      return ipcClient.get(FeeScheduleRoutes.ALL, { params });
    },
    fetchFeeSchedulesAsOptions(params) {
      return ipcClient.get(FeeScheduleRoutes.SEARCH, { params });
    },
    fetchFeeScheduleById(scheduleId) {
      return ipcClient.get(FeeScheduleRoutes.DETAIL, {
        params: { scheduleId },
      });
    },
    fetchFeeSchedulesByFeeType(feeTypeId) {
      return ipcClient.get(FeeScheduleRoutes.BY_FEE_TYPE, {
        params: { feeTypeId },
      });
    },
    createFeeSchedule(data) {
      return ipcClient.post(FeeScheduleRoutes.ALL, data);
    },
    updateFeeSchedule(scheduleId, data) {
      return ipcClient.put(FeeScheduleRoutes.DETAIL, data, {
        params: { scheduleId },
      });
    },
    deleteFeeSchedule(scheduleId) {
      return ipcClient.delete(FeeScheduleRoutes.DETAIL, {
        params: { scheduleId },
      });
    },
  };
}
