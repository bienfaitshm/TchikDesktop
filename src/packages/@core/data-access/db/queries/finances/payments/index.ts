import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import { db } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeAssignmentRepository,
  feeConfigurationRepository,
  studentPaymentRepository,
  dailyExchangeRateRepository,
  walletRepository,
} from "@/packages/@core/data-access/db/queries/finances";

import { classroomRepository } from "@/packages/@core/data-access/db/queries/classrooms";
import { enrollmentRepository } from "@/packages/@core/data-access/db/queries/enrollments";

import { SyncClassroomFees } from "./use-cases/sync-classroom-fees";
import { GetClassroomPaymentTable } from "./use-cases/get-classroom-payment-table";
import { AssignInitialFees } from "./use-cases/assign-initial-fees";
import { ProcessStudentPayment } from "./use-cases/process-student-payment";

import { OnSyncMessage, TableClassroomPaymentAssignment } from "./types";

const logger = getLogger("PaymentService");

const syncClassroomFeesUseCase = new SyncClassroomFees(
  classroomRepository,
  enrollmentRepository,
  feeConfigurationRepository,
  feeAssignmentRepository,
  db,
  logger,
);

const getClassroomPaymentTableUseCase = new GetClassroomPaymentTable(
  syncClassroomFeesUseCase,
  feeAssignmentRepository,
  logger,
);

const assignInitialFeesUseCase = new AssignInitialFees(
  classroomRepository,
  feeConfigurationRepository,
  feeAssignmentRepository,
  db,
  logger,
);

const processStudentPaymentUseCase = new ProcessStudentPayment(
  feeConfigurationRepository,
  feeAssignmentRepository,
  studentPaymentRepository,
  dailyExchangeRateRepository,
  walletRepository,
  db,
  logger,
);

// =========================================================================
// FACADE EXPORTÉE (paymentService)
// =========================================================================

export const paymentService = {
  /**
   * Synchronise les échéances financières d'une classe en fonction des élèves actifs
   * et des configurations tarifaires applicables.
   */
  async syncClassroomFeeAssignments(
    ctx: {
      schoolId: string;
      yearId: string;
      classId: string;
    },
    onSyncMessage?: OnSyncMessage,
  ) {
    return syncClassroomFeesUseCase.execute(ctx, onSyncMessage);
  },

  /**
   * Récupère la table de suivi des paiements pour une classe donnée sous forme structurée.
   */
  async getAssignmentTableOfClassroom(
    filters: {
      schoolId: string;
      yearId: string;
      classId: string;
    },
    onSyncMessage?: OnSyncMessage,
  ): Promise<TableClassroomPaymentAssignment[]> {
    return getClassroomPaymentTableUseCase.execute(filters, onSyncMessage);
  },

  /**
   * ACTION AUTOMATIQUE : Assigne la dette de départ d'un élève lors de son inscription active.
   */
  async assignFeesToStudent(
    payload: {
      schoolId: string;
      yearId: string;
      enrollmentId: string;
      classroomId: string;
    },
    tx = db,
  ) {
    return assignInitialFeesUseCase.execute(payload, tx);
  },

  /**
   * ACTION CENTRALISÉE : Enregistre et traite un versement (gestion multi-devises et portefeuille).
   */
  async processStudentPayment(payload: {
    schoolId: string;
    yearId: string;
    assignmentId: string;
    amountReceived: number;
    currencyReceived: CURRENCY_ENUM;
    paymentMethod?: PAYMENT_METHOD_ENUM;
    transactionReference?: string;
  }) {
    return processStudentPaymentUseCase.execute(payload);
  },
};

export * from "./types";
