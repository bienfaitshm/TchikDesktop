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
  ProcessPaymentSchema,
} from "@/packages/@core/data-access/schema-validations";
import { defaultPrinterManagementService } from "@/packages/electron-utility";
import { printReceipt } from "@/packages/pos-printer";

const ClassroomFilterSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  classId: z.string().nonempty(),
});

type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student payments and fee assignments.
 */
export class PaymentController {
  @IpcServer.register(HttpMethod.GET, PaymentRoutes.STUDENT_PAYMENT_OVERVIEW, {
    params: EnrollmentSchema.pick({ enrollmentId: true }),
  })
  static async getStudentPaymentOverview(
    req: IpcRequest<unknown, { enrollmentId: string }>,
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
  static async processPayment(req: IpcRequest<ProcessPaymentPayload, unknown>) {
    const payment = await paymentService.processStudentPayment(req.body);

    if (payment && req.context.window) {
      const printers = await defaultPrinterManagementService.getSystemPrinters(
        req.context.window,
      );
      console.log("System printers retrieved:", printers);

      try {
        printReceipt();
      } catch (error) {
        console.error("Hardware printing execution pipeline failed:", error);
      }
    }

    return payment;
  }
}
