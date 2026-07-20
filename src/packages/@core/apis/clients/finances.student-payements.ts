import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  StudentPaymentCreate,
  StudentPaymentUpdate,
  StudentPaymentFilter,
} from "@/packages/@core/data-access/schema-validations";
import type {
  StudentPaymentDTO,
  SelectOption,
} from "@/packages/@core/data-access/db";
import { StudentPaymentRoutes } from "../routes-constant";

export type StudentPaymentApi = Readonly<{
  fetchStudentPayments(
    params?: StudentPaymentFilter,
  ): Promise<StudentPaymentDTO[]>;
  fetchStudentPaymentsAsOptions(
    params?: StudentPaymentFilter,
  ): Promise<(SelectOption & StudentPaymentDTO)[]>;
  fetchStudentPaymentById(paymentId: string): Promise<StudentPaymentDTO>;
  createStudentPayment(data: StudentPaymentCreate): Promise<StudentPaymentDTO>;
  updateStudentPayment(
    paymentId: string,
    data: StudentPaymentUpdate,
  ): Promise<StudentPaymentDTO>;
  deleteStudentPayment(paymentId: string): Promise<void>;
}>;

export function createStudentPaymentApis(
  ipcClient: IpcClient,
): StudentPaymentApi {
  return {
    fetchStudentPayments(params) {
      return ipcClient.get(StudentPaymentRoutes.ALL, { params });
    },
    fetchStudentPaymentsAsOptions(params) {
      return ipcClient.get(StudentPaymentRoutes.SEARCH, { params });
    },
    fetchStudentPaymentById(paymentId) {
      return ipcClient.get(StudentPaymentRoutes.DETAIL, {
        params: { paymentId },
      });
    },
    createStudentPayment(data) {
      return ipcClient.post(StudentPaymentRoutes.ALL, data);
    },
    updateStudentPayment(paymentId, data) {
      return ipcClient.put(StudentPaymentRoutes.DETAIL, data, {
        params: { paymentId },
      });
    },
    deleteStudentPayment(paymentId) {
      return ipcClient.delete(StudentPaymentRoutes.DETAIL, {
        params: { paymentId },
      });
    },
  };
}
