import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeConfigurationCreate,
  FeeConfigurationUpdate,
  FeeConfigurationFilter,
} from "@/packages/@core/data-access/schema-validations";
import type {
  FeeConfigurationDTO,
  FeeApplicableConfiguration,
} from "@/packages/@core/data-access/db";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type { FeeApplicableConfiguration as ApplicableParams } from "@/packages/@core/apis/servers/handlers/fee-configurations";
import { FeeConfigurationRoutes } from "../routes-constant";

export type FeeConfigurationApi = Readonly<{
  fetchFeeConfigurations(
    params?: FeeConfigurationFilter,
  ): Promise<FeeConfigurationDTO[]>;
  fetchFeeApplicableConfigurations(
    params?: ApplicableParams,
  ): Promise<FeeApplicableConfiguration[]>;
  fetchFeeConfigurationsAsOptions(
    params?: FeeConfigurationFilter,
  ): Promise<(SelectOption & FeeConfigurationDTO)[]>;
  fetchFeeConfigurationById(feeConfigId: string): Promise<FeeConfigurationDTO>;
  createFeeConfiguration(
    data: FeeConfigurationCreate,
  ): Promise<FeeConfigurationDTO>;
  updateFeeConfiguration(
    feeConfigId: string,
    data: FeeConfigurationUpdate,
  ): Promise<FeeConfigurationDTO>;
  deleteFeeConfiguration(feeConfigId: string): Promise<void>;
}>;

export function createFeeConfigurationApis(
  ipcClient: IpcClient,
): FeeConfigurationApi {
  return {
    fetchFeeConfigurations(params) {
      return ipcClient.get(FeeConfigurationRoutes.ALL, { params });
    },
    fetchFeeApplicableConfigurations(params) {
      return ipcClient.get(FeeConfigurationRoutes.APPLICABLE, { params });
    },
    fetchFeeConfigurationsAsOptions(params) {
      return ipcClient.get(FeeConfigurationRoutes.SEARCH, { params });
    },
    fetchFeeConfigurationById(feeConfigId) {
      return ipcClient.get(FeeConfigurationRoutes.DETAIL, {
        params: { feeConfigId },
      });
    },
    createFeeConfiguration(data) {
      return ipcClient.post(FeeConfigurationRoutes.ALL, data);
    },
    updateFeeConfiguration(feeConfigId, data) {
      return ipcClient.put(FeeConfigurationRoutes.DETAIL, data, {
        params: { feeConfigId },
      });
    },
    deleteFeeConfiguration(feeConfigId) {
      return ipcClient.delete(FeeConfigurationRoutes.DETAIL, {
        params: { feeConfigId },
      });
    },
  };
}
