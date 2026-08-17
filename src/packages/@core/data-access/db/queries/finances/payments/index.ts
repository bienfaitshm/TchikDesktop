import { db } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeAssignmentRepository,
  feeConfigurationRepository,
  studentPaymentRepository,
  walletRepository,
} from "@/packages/@core/data-access/db/queries/finances";
import { dailyExchangeRateService } from "../services";
import { classroomRepository } from "@/packages/@core/data-access/db/queries/classrooms";
import { enrollmentRepository } from "@/packages/@core/data-access/db/queries/enrollments";

import {
  type StudentPaymentTable,
  type EnrollmentPayment,
  FeeManagementService,
} from "./use-cases/sync-classroom-fees";
import { GetClassroomPaymentTable } from "./use-cases/get-classroom-payment-table";

import {
  ProcessStudentPayment,
  type ProcessPaymentPayload,
  type ProcessPaymentResult,
} from "./use-cases/process-student-payment";

import { OnSyncMessage } from "./types";

const logger = getLogger("PaymentService");

const feeManagementService = new FeeManagementService(
  classroomRepository,
  enrollmentRepository,
  feeConfigurationRepository,
  feeAssignmentRepository,
  db,
  logger,
);

const getClassroomPaymentTableUseCase = new GetClassroomPaymentTable(
  feeManagementService,
  feeAssignmentRepository,
  logger,
);

const processStudentPaymentUseCase = new ProcessStudentPayment(
  feeConfigurationRepository,
  feeAssignmentRepository,
  studentPaymentRepository,
  dailyExchangeRateService,
  walletRepository,
  db,
  logger,
);

/**
 * Service facade providing entry points for financial and payment management workflows.
 */
export const paymentService = {
  /**
   * Retrieves student payment summary and schedule details by enrollment ID.
   * @param enrollmentId - Unique identifier of the student enrollment.
   * @returns Structured payment overview data.
   */
  getStudentPaymentOverview(enrollmentId: string): StudentPaymentTable {
    return feeManagementService.getStudentPaymentOverview(enrollmentId);
  },

  /**
   * Synchronizes fee assignments across all active students in a classroom.
   * @param ctx - Context object containing school, academic year, and classroom IDs.
   * @param onSyncMessage - Optional callback invoked during progress updates.
   * @returns The sync execution result.
   */
  syncClassroomFeeAssignments(
    ctx: {
      schoolId: string;
      yearId: string;
      classId: string;
    },
    onSyncMessage?: OnSyncMessage,
  ) {
    return feeManagementService.syncClassroomFeeAssignments(ctx, onSyncMessage);
  },

  /**
   * Retrieves the payment matrix for a classroom in a structured grid format.
   * @param filters - Filter criteria specifying school, academic year, and classroom IDs.
   * @param onSyncMessage - Optional callback invoked during sync operations.
   * @returns Array of classroom payment assignments.
   */
  getClassroomPaymentTable(
    filters: {
      schoolId: string;
      yearId: string;
      classId: string;
    },
    onSyncMessage?: OnSyncMessage,
  ) {
    return getClassroomPaymentTableUseCase.getClassroomPaymentTable(
      filters,
      onSyncMessage,
    );
  },

  /**
   * Processes a student payment, handling currency conversion and wallet updates.
   * @param payload - Details of the payment transaction.
   * @returns Resulting updated fee assignment and payment details.
   */
  processStudentPayment(payload: ProcessPaymentPayload): ProcessPaymentResult {
    return processStudentPaymentUseCase.execute(payload);
  },
};

export * from "./types";
export { type StudentPaymentTable, EnrollmentPayment };
