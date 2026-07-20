import {
  IpcClient,
  ProgressPayload,
} from "@/packages/electron-ipc-rest/ipc.client";
import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import type {
  TableClassroomPaymentAssignment,
  StudentPaymentTable,
} from "@/packages/@core/data-access/db";
import { PaymentRoutes } from "../routes-constant";
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

export type ClassroomPaymentFilterParams = {
  schoolId: string;
  yearId: string;
  classId: string;
};

export type AssignFeesToStudentPayload = {
  schoolId: string;
  yearId: string;
  enrollmentId: string;
  classroomId: string;
  optionId: string | null;
};

export type ProcessStudentPaymentPayload = {
  schoolId: string;
  yearId: string;
  assignmentId: string;
  amountReceived: number;
  currencyReceived: CURRENCY_ENUM;
  paymentMethod?: PAYMENT_METHOD_ENUM;
  transactionReference?: string;
};

export type PaymentApi = Readonly<{
  /**
   * Fetches the matrix payment grid and fee assignments for a classroom.
   * @param params - Filter context including school, year, and class identifiers.
   * @returns A promise resolving to an array of classroom payment assignments.
   */
  fetchClassroomAssignmentTable(
    params: ClassroomPaymentFilterParams,
  ): Promise<TableClassroomPaymentAssignment[]>;

  /**
   * Retrieves a student's payment overview and fee schedule progress.
   * @param enrollmentId - Unique identifier of the student enrollment.
   * @returns A promise resolving to the student payment table summary.
   */
  getStudentPaymentOverview(enrollmentId: string): Promise<StudentPaymentTable>;

  /**
   * Subscribes to classroom sync progress updates.
   * @param callback - Function invoked when progress payload events arrive.
   * @returns A cleanup function to unsubscribe from progress notifications.
   */
  onClassroomSyncProgress(
    callback: (params: ProgressPayload) => void,
  ): () => void;

  /**
   * Assigns initial fee schedules to a student enrollment.
   * @param data - Payload containing student enrollment and classroom data.
   * @returns A promise that resolves when fee assignment completes.
   */
  assignFeesToStudent(data: AssignFeesToStudentPayload): Promise<void>;

  /**
   * Processes a student payment transaction at the counter.
   * @param data - Payment transaction details including amount and currency.
   * @returns A promise resolving to the created student payment record.
   */
  processStudentPayment(
    data: ProcessStudentPaymentPayload,
  ): Promise<StudentPayment>;
}>;

/**
 * Creates and initializes the payment IPC API endpoints binding.
 * @param ipcClient - The electron IPC client instance.
 * @returns An implementation of the PaymentApi interface.
 */
export function createPaymentApis(ipcClient: IpcClient): PaymentApi {
  return {
    fetchClassroomAssignmentTable(params) {
      return ipcClient.get(PaymentRoutes.CLASSROOM_TABLE, { params });
    },
    getStudentPaymentOverview(enrollmentId) {
      return ipcClient.get(PaymentRoutes.STUDENT_PAYMENT_OVERVIEW, {
        params: { enrollmentId },
      });
    },
    onClassroomSyncProgress(callback) {
      return ipcClient.onSyncProgressMessage(
        PaymentRoutes.CLASSROOM_TABLE,
        callback,
      );
    },
    assignFeesToStudent(data) {
      return ipcClient.post(PaymentRoutes.ASSIGN_FEES, data);
    },
    processStudentPayment(data) {
      return ipcClient.post(PaymentRoutes.PROCESS_PAYMENT, data);
    },
  };
}
