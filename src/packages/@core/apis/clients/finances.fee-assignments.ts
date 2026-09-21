import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
  FeeAssignmentFilter,
  UpdateAmountByAssignments,
  UpdateAmountByClassrooms,
  ExemptFromFee,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeAssignment } from "@/packages/@core/data-access/db/schemas";
import type {
  FeeAssignmentDTO,
  SelectOption,
} from "@/packages/@core/data-access/db/queries";
import { FeeAssignmentRoutes } from "../routes-constant";

export type FeeAssignmentApi = Readonly<{
  fetchFeeAssignments(
    params?: FeeAssignmentFilter,
  ): Promise<FeeAssignmentDTO[]>;
  fetchFeeAssignmentsAsOptions(
    params?: FeeAssignmentFilter,
  ): Promise<(SelectOption & FeeAssignmentDTO)[]>;
  fetchFeeAssignmentById(assignmentId: string): Promise<FeeAssignmentDTO>;
  createFeeAssignment(data: FeeAssignmentCreate): Promise<FeeAssignment>;
  updateFeeAssignment(
    assignmentId: string,
    data: FeeAssignmentUpdate,
  ): Promise<FeeAssignment>;
  //
  updateAmountByAssignments(
    payload: UpdateAmountByAssignments,
  ): Promise<FeeAssignment[]>;
  updateAmountByClassroom(
    payload: UpdateAmountByClassrooms,
  ): Promise<FeeAssignment[]>;
  exemptFromFee(payload: ExemptFromFee): Promise<FeeAssignment[]>;
  //
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
    exemptFromFee(payload) {
      return ipcClient.post(FeeAssignmentRoutes.EXEMPT_FROM_FEE, payload);
    },
    updateAmountByAssignments(payload) {
      return ipcClient.post(
        FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_ASSIGNMENT,
        payload,
      );
    },
    updateAmountByClassroom(payload) {
      return ipcClient.post(
        FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_CLASSROOM,
        payload,
      );
    },
    //
    deleteFeeAssignment(assignmentId) {
      return ipcClient.delete(FeeAssignmentRoutes.DETAIL, {
        params: { assignmentId },
      });
    },
  };
}
