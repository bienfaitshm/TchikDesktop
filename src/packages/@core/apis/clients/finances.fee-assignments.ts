import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
  FeeAssignmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeAssignment } from "@/packages/@core/data-access/db/schemas";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { FeeAssignmentRoutes } from "../routes-constant";

export type FeeAssignmentApi = Readonly<{
  fetchFeeAssignments(params?: FeeAssignmentFilter): Promise<FeeAssignment[]>;
  fetchFeeAssignmentsAsOptions(
    params?: FeeAssignmentFilter,
  ): Promise<(SelectOption & FeeAssignment)[]>;
  fetchFeeAssignmentById(assignmentId: string): Promise<FeeAssignment>;
  createFeeAssignment(data: FeeAssignmentCreate): Promise<FeeAssignment>;
  updateFeeAssignment(
    assignmentId: string,
    data: FeeAssignmentUpdate,
  ): Promise<FeeAssignment>;
  bulkCreateFeeAssignment(
    data: FeeAssignmentCreate[],
  ): Promise<FeeAssignment[]>;
  deleteFeeAssignment(assignmentId: string): Promise<void>;
}>;

export function createFeeAssignmentApis(
  ipcClient: IpcClient,
): FeeAssignmentApi {
  return {
    fetchFeeAssignments(params) {
      return ipcClient.get(FeeAssignmentRoutes.ALL, { params });
    },
    fetchFeeAssignmentsAsOptions(params) {
      return ipcClient.get(FeeAssignmentRoutes.SEARCH, { params });
    },
    fetchFeeAssignmentById(assignmentId) {
      return ipcClient.get(FeeAssignmentRoutes.DETAIL, {
        params: { assignmentId },
      });
    },
    createFeeAssignment(data) {
      return ipcClient.post(FeeAssignmentRoutes.ALL, data);
    },
    bulkCreateFeeAssignment(data) {
      return ipcClient.post(FeeAssignmentRoutes.BULK, data);
    },
    updateFeeAssignment(assignmentId, data) {
      return ipcClient.put(FeeAssignmentRoutes.DETAIL, data, {
        params: { assignmentId },
      });
    },
    deleteFeeAssignment(assignmentId) {
      return ipcClient.delete(FeeAssignmentRoutes.DETAIL, {
        params: { assignmentId },
      });
    },
  };
}
