import {
  IpcClient,
  ProgressPayload,
} from "@/packages/electron-ipc-rest/ipc.client";
import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import type { TableClassroomPaymentAssignment } from "@/packages/@core/data-access/db";
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
  currencyReceived?: CURRENCY_ENUM;
  paymentMethod?: PAYMENT_METHOD_ENUM;
  transactionReference?: string;
};

export type PaymentApi = Readonly<{
  /**
   * Récupère le tableau matriciel global des frais et paiements pour une salle de classe
   */
  fetchClassroomAssignmentTable(
    params: ClassroomPaymentFilterParams,
  ): Promise<TableClassroomPaymentAssignment[]>;

  /**
   * S'abonne aux notifications de progression de la synchronisation de la classe
   * @returns Une fonction pour se désabonner (nettoyage)
   */
  onClassroomSyncProgress(
    callback: (params: ProgressPayload) => void,
  ): () => void;

  /**
   * Assigne manuellement ou automatiquement la grille des frais initiaux à un étudiant
   */
  assignFeesToStudent(data: AssignFeesToStudentPayload): Promise<void>;

  /**
   * Enregistre et traite un encaissement au guichet (création du reçu, amortissement, wallet sync)
   */
  processStudentPayment(
    data: ProcessStudentPaymentPayload,
  ): Promise<StudentPayment>;
}>;

export function createPaymentApis(ipcClient: IpcClient): PaymentApi {
  return {
    fetchClassroomAssignmentTable(params) {
      return ipcClient.get(PaymentRoutes.CLASSROOM_TABLE, { params });
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
