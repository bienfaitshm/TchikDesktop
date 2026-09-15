import type {
  FeeApplicableConfiguration,
  FeeConfigurationCreate,
  FeeConfigurationFilter,
  FeeConfigurationUpdate,
  FinClassroomApplicableConfigParams,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeConfigurationDTO } from "@/packages/@core/data-access/db";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import { FeeConfigurationRoutes } from "../routes-constant";

/**
 * Interface contract defining API client methods for fee configuration management over IPC.
 */
export type FeeConfigurationApi = Readonly<{
  /**
   * Fetches all fee configurations matching optional filter parameters.
   */
  fetchFeeConfigurations(
    params?: FeeConfigurationFilter,
  ): Promise<FeeConfigurationDTO[]>;

  /**
   * Fetches applicable fee configurations matching global contextual parameters.
   */
  fetchFeeApplicableConfigurations(
    params?: FeeApplicableConfiguration,
  ): Promise<FeeApplicableConfiguration[]>;

  /**
   * Fetches applicable fee configurations for a specific classroom context.
   */
  fetchClassroomFeeConfigApplicable(
    params: FinClassroomApplicableConfigParams,
  ): Promise<FeeApplicableConfiguration[]>;

  /**
   * Fetches fee configurations formatted as options for UI selection components.
   */
  fetchFeeConfigurationsAsOptions(
    params?: FeeConfigurationFilter,
  ): Promise<(SelectOption & FeeConfigurationDTO)[]>;

  /**
   * Fetches a single fee configuration by its unique identifier.
   */
  fetchFeeConfigurationById(feeConfigId: string): Promise<FeeConfigurationDTO>;

  /**
   * Creates a new fee configuration record.
   */
  createFeeConfiguration(
    data: FeeConfigurationCreate,
  ): Promise<FeeConfigurationDTO>;

  /**
   * Updates an existing fee configuration record by its unique identifier.
   */
  updateFeeConfiguration(
    feeConfigId: string,
    data: FeeConfigurationUpdate,
  ): Promise<FeeConfigurationDTO>;

  /**
   * Deletes a fee configuration record by its unique identifier.
   */
  deleteFeeConfiguration(feeConfigId: string): Promise<void>;
}>;

/**
 * Factory function creating an instance of FeeConfigurationApi using the provided IPC client.
 * @param ipcClient - The IPC client instance used to dispatch network requests.
 * @returns An implementation of FeeConfigurationApi.
 */
export function createFeeConfigurationApis(
  ipcClient: IpcClient,
): FeeConfigurationApi {
  return {
    /**
     * Retrieves fee configurations list matching query parameters.
     * @param params - Optional query filters.
     * @returns Array of matching fee configuration DTOs.
     */
    fetchFeeConfigurations(params) {
      return ipcClient.get(FeeConfigurationRoutes.ALL, { params });
    },

    /**
     * Retrieves applicable fee configurations based on context parameters.
     * @param params - Contextual lookup parameters.
     * @returns Array of applicable fee configurations.
     */
    fetchFeeApplicableConfigurations(params) {
      return ipcClient.get(FeeConfigurationRoutes.APPLICABLE, { params });
    },

    /**
     * Retrieves applicable fee configurations for a specific classroom.
     * @param params - Classroom contextual lookup parameters.
     * @returns Array of applicable classroom fee configurations.
     */
    fetchClassroomFeeConfigApplicable(params) {
      return ipcClient.get(FeeConfigurationRoutes.APPLICABLE_CLASSROOM, {
        params,
      });
    },

    /**
     * Retrieves fee configurations formatted as UI select options.
     * @param params - Optional query filters.
     * @returns Array of select options merged with fee configuration DTOs.
     */
    fetchFeeConfigurationsAsOptions(params) {
      return ipcClient.get(FeeConfigurationRoutes.SEARCH, { params });
    },

    /**
     * Retrieves a fee configuration record by its unique ID.
     * @param feeConfigId - Unique identifier of the fee configuration.
     * @returns Target fee configuration DTO.
     */
    fetchFeeConfigurationById(feeConfigId) {
      return ipcClient.get(FeeConfigurationRoutes.DETAIL, {
        params: { feeConfigId },
      });
    },

    /**
     * Dispatches a request to create a new fee configuration.
     * @param data - Payload for creating a fee configuration.
     * @returns Newly created fee configuration DTO.
     */
    createFeeConfiguration(data) {
      return ipcClient.post(FeeConfigurationRoutes.ALL, data);
    },

    /**
     * Dispatches a request to update an existing fee configuration.
     * @param feeConfigId - Unique identifier of the target fee configuration.
     * @param data - Payload containing update mutations.
     * @returns Updated fee configuration DTO.
     */
    updateFeeConfiguration(feeConfigId, data) {
      return ipcClient.put(FeeConfigurationRoutes.DETAIL, data, {
        params: { feeConfigId },
      });
    },

    /**
     * Dispatches a request to delete a fee configuration.
     * @param feeConfigId - Unique identifier of the fee configuration to delete.
     * @returns Void promise upon completion.
     */
    deleteFeeConfiguration(feeConfigId) {
      return ipcClient.delete(FeeConfigurationRoutes.DETAIL, {
        params: { feeConfigId },
      });
    },
  };
}
