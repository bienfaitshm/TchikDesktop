import z from "zod";
import { paymentService } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { PaymentRoutes } from "../../routes-constant";
import {
  EnrollmentSchema,
  type ProcessPaymentPayload,
  schoolYearIdBaseSchema,
  ProcessPaymentSchema,
  StudentPaymentSchema,
} from "@/packages/@core/data-access/schema-validations";
import { notify } from "@/packages/electron-utility";

/* =========================================================================
   SCHEMAS & DEDICATED PARAMETER TYPES
   ========================================================================= */

const EnrollmentIdSchema = EnrollmentSchema.pick({ enrollmentId: true });
type EnrollmentId = z.infer<typeof EnrollmentIdSchema>;

const StudentPaymentIdSchema = StudentPaymentSchema.pick({ paymentId: true });
type StudentPaymentId = z.infer<typeof StudentPaymentIdSchema>;

const ClassroomFilterSchema = z
  .object({
    classId: z.string().min(1, "L'identifiant de la classe est requis."),
  })
  .extend(schoolYearIdBaseSchema.shape);

type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student payments and fee assignments.
 */
export class PaymentController {
  /**
   * Retrieves student payment overview and status summary.
   * @param req - The IPC request context carrying enrollment parameters.
   * @returns A promise resolving to the student payment overview dataset.
   */
  @IpcServer.register(HttpMethod.GET, PaymentRoutes.STUDENT_PAYMENT_OVERVIEW, {
    params: EnrollmentIdSchema,
  })
  static async getStudentPaymentOverview(
    req: IpcRequest<unknown, EnrollmentId>,
  ) {
    return paymentService.getStudentPaymentOverview(req.params.enrollmentId);
  }

  /**
   * Fetches the assignment and financial payment status matrix for a classroom.
   * @param req - The IPC request context carrying classroom filtering parameters.
   * @returns A promise resolving to the final classroom assignment table dataset.
   */
  @IpcServer.register(HttpMethod.GET, PaymentRoutes.CLASSROOM_TABLE, {
    params: ClassroomFilterSchema,
  })
  static async getClassroomTable(req: IpcRequest<unknown, ClassroomFilter>) {
    return paymentService.getClassroomPaymentTable(
      req.params,
      (progress: { message: string; pourcent: number }) => {
        req.context.sender.send(PaymentRoutes.CLASSROOM_TABLE, {
          message: progress.message,
          pourcent: progress.pourcent,
        });
      },
    );
  }

  /**
   * Validates financial intake variables and drives POS hardware receipt generation streams.
   * @param req - The IPC request context containing structured transactional payment configurations.
   * @returns A promise resolving to the successfully committed payment record entity.
   */
  @IpcServer.register(HttpMethod.POST, PaymentRoutes.PROCESS_PAYMENT, {
    body: ProcessPaymentSchema,
  })
  static async processPayment(req: IpcRequest<ProcessPaymentPayload>) {
    const payment = await paymentService.processStudentPayment(req.body);

    if (payment && req.context.window) {
      notifyPaymentSuccess({ transactionId: payment.assignmentId });
    }

    return payment;
  }

  /**
   * Cancels an existing student payment transaction.
   * @param req - The IPC request context containing the payment identifier body.
   * @returns A promise resolving to the cancelled payment record entity.
   */
  @IpcServer.register(HttpMethod.POST, PaymentRoutes.CANCEL_PAYMENT, {
    body: StudentPaymentIdSchema,
  })
  static async cancelPayment(req: IpcRequest<StudentPaymentId>) {
    const payment = await paymentService.cancelStudentPayment(
      req.body.paymentId,
    );

    if (payment && req.context.window) {
      notifyPaymentCancellation({ transactionId: payment.assignmentId });
    }

    return payment;
  }
}

/**
 * Interface defining the options for payment notification payload.
 */
interface PaymentNotificationOptions {
  /** Optional transaction identifier to display in the body. */
  transactionId?: string;
}

/**
 * Displays a success notification following a completed payment process.
 * @param options - Additional display options such as transaction ID.
 */
export function notifyPaymentSuccess(
  options?: PaymentNotificationOptions,
): void {
  const bodyText = options?.transactionId
    ? `Transaction #${options.transactionId} enregistrée avec succès.`
    : "La transaction a été enregistrée avec succès.";

  notify({
    title: "Paiement réussi !",
    body: bodyText,
  });
}

/**
 * Displays a cancellation notification following a cancelled payment process.
 * @param options - Additional display options such as transaction ID.
 */
export function notifyPaymentCancellation(
  options?: PaymentNotificationOptions,
): void {
  const bodyText = options?.transactionId
    ? `Transaction #${options.transactionId} annulée avec succès.`
    : "La transaction a été annulée avec succès.";

  notify({
    title: "Paiement annulé",
    body: bodyText,
  });
}
