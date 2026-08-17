import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeTypeCreate,
  FeeTypeBulkCreate,
  FeeTypeUpdate,
  FeeTypeFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeType, FeeTypeDTO } from "@/packages/@core/data-access/db";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { FeeTypeRoutes } from "../routes-constant";

export type FeeTypeSearchParams = FeeTypeFilter;

export type FeeTypeApi = Readonly<{
  fetchFeeTypes(params?: FeeTypeFilter): Promise<FeeTypeDTO[]>;
  fetchFeeTypesAsOptions(
    params?: FeeTypeSearchParams,
  ): Promise<(SelectOption & FeeTypeDTO)[]>;
  fetchFeeTypeById(feeTypeId: string): Promise<FeeTypeDTO>;
  createFeeType(data: FeeTypeCreate): Promise<FeeType>;
  bulkCreateFeeType(data: FeeTypeBulkCreate): Promise<FeeType[]>;
  updateFeeType(feeTypeId: string, data: FeeTypeUpdate): Promise<FeeType>;
  deleteFeeType(feeTypeId: string): Promise<void>;
}>;

export function createFeeTypeApis(ipcClient: IpcClient): FeeTypeApi {
  return {
    fetchFeeTypes(params) {
      return ipcClient.get(FeeTypeRoutes.ALL, { params });
    },
    fetchFeeTypesAsOptions(params) {
      return ipcClient.get(FeeTypeRoutes.SEARCH, { params });
    },
    fetchFeeTypeById(feeTypeId) {
      return ipcClient.get(FeeTypeRoutes.DETAIL, {
        params: { feeTypeId },
      });
    },
    createFeeType(data) {
      return ipcClient.post(FeeTypeRoutes.ALL, data);
    },
    bulkCreateFeeType(data) {
      return ipcClient.post(FeeTypeRoutes.BULK, data);
    },
    updateFeeType(feeTypeId, data) {
      return ipcClient.put(FeeTypeRoutes.DETAIL, data, {
        params: { feeTypeId },
      });
    },
    deleteFeeType(feeTypeId) {
      return ipcClient.delete(FeeTypeRoutes.DETAIL, {
        params: { feeTypeId },
      });
    },
  };
}
