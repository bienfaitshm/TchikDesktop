import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
  FeeAssignmentFilter,
  UpdateAmountByAssignments,
  UpdateAmountByClassrooms,
  ExemptFromFee,
  MarkAsPaid,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeAssignment } from "@/packages/@core/data-access/db/schemas";
import type {
  FeeAssignmentDTO,
  SelectOption,
} from "@/packages/@core/data-access/db/queries";
import { FeeAssignmentRoutes } from "../routes-constant";

/**
 * Interface defining the IPC client operations for fee assignment management.
 */
export type FeeAssignmentApi = Readonly<{
  /**
   * Fetches a filtered list of fee assignments.
   * @param params - Query parameters to filter the fee assignments.
   * @returns Array of fee assignment DTOs.
   */
  fetchFeeAssignments(
    params?: FeeAssignmentFilter,
  ): Promise<FeeAssignmentDTO[]>;

  /**
   * Fetches fee assignments formatted as select options.
   * @param params - Query parameters to filter the fee assignment options.
   * @returns Array of options extending fee assignment DTOs.
   */
  fetchFeeAssignmentsAsOptions(
    params?: FeeAssignmentFilter,
  ): Promise<(SelectOption & FeeAssignmentDTO)[]>;

  /**
   * Fetches a single fee assignment by its identifier.
   * @param assignmentId - The unique identifier of the fee assignment.
   * @returns The fee assignment DTO.
   */
  fetchFeeAssignmentById(assignmentId: string): Promise<FeeAssignmentDTO>;

  /**
   * Creates a single fee assignment.
   * @param data - Payload for creating a fee assignment.
   * @returns The created fee assignment entity.
   */
  createFeeAssignment(data: FeeAssignmentCreate): Promise<FeeAssignment>;

  /**
   * Updates an existing fee assignment by ID.
   * @param assignmentId - The unique identifier of the fee assignment.
   * @param data - Payload containing the update fields.
   * @returns The updated fee assignment entity.
   */
  updateFeeAssignment(
    assignmentId: string,
    data: FeeAssignmentUpdate,
  ): Promise<FeeAssignment>;

  /**
   * Updates the total amount for specified assignments.
   * @param payload - Payload containing assignment IDs and new amount data.
   * @returns Array of updated fee assignment entities.
   */
  updateAmountByAssignments(
    payload: UpdateAmountByAssignments,
  ): Promise<FeeAssignment[]>;

  /**
   * Updates the total amount for assignments grouped by classrooms.
   * @param payload - Payload containing classroom IDs and amount details.
   * @returns Array of updated fee assignment entities.
   */
  updateAmountByClassrooms(
    payload: UpdateAmountByClassrooms,
  ): Promise<FeeAssignment[]>;

  /**
   * Applies an exemption from fees for specified targets.
   * @param payload - Exemption details and targeted assignments.
   * @returns Array of updated fee assignment entities.
   */
  exemptFromFee(payload: ExemptFromFee): Promise<FeeAssignment[]>;

  /**
   * Marks specified fee assignments as paid.
   * @param payload - Payload identifying assignments to be marked as paid.
   * @returns Array of updated fee assignment entities.
   */
  markAsPaid(payload: MarkAsPaid): Promise<FeeAssignment[]>;

  /**
   * Creates multiple fee assignments in a single request.
   * @param data - Array of fee assignment creation payloads.
   * @returns Array of created fee assignment entities.
   */
  bulkCreateFeeAssignment(
    data: FeeAssignmentCreate[],
  ): Promise<FeeAssignment[]>;

  /**
   * Removes a fee assignment by its identifier.
   * @param assignmentId - The unique identifier of the fee assignment to delete.
   */
  deleteFeeAssignment(assignmentId: string): Promise<void>;
}>;

/**
 * Factory function creating the API handler for fee assignment IPC requests.
 * @param ipcClient - The IPC client instance used for communication.
 * @returns An object implementing the FeeAssignmentApi interface.
 */
export function createFeeAssignmentApi(ipcClient: IpcClient): FeeAssignmentApi {
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
    markAsPaid(payload) {
      return ipcClient.post(FeeAssignmentRoutes.MARK_AS_PAID, payload);
    },
    updateAmountByAssignments(payload) {
      return ipcClient.post(
        FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_ASSIGNMENT,
        payload,
      );
    },
    updateAmountByClassrooms(payload) {
      return ipcClient.post(
        FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_CLASSROOM,
        payload,
      );
    },
    deleteFeeAssignment(assignmentId) {
      return ipcClient.delete(FeeAssignmentRoutes.DETAIL, {
        params: { assignmentId },
      });
    },
  };
}
