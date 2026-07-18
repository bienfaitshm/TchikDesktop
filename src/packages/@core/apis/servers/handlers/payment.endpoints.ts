import z from "zod";
import { paymentService } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { PaymentRoutes } from "../../routes-constant";
import {
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

const AssignFeesToStudentSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  enrollmentId: z.string().nonempty(),
  classroomId: z.string().nonempty(),
});

type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;
type AssignFeesToStudentPayload = z.infer<typeof AssignFeesToStudentSchema>;

const INVOICE_TEMPLATE_DATA = {
  company: {
    name: "TECH & CO BOUTIQUE",
    address: "45 Rue de la République, Lyon",
    phone: "04.72.00.11.22",
  },
  invoiceNumber: "FAC-2026-0412",
  date: "15/07/2026 11:15",
  cashier: "Marc K.",
  items: [
    { name: "Wireless RGB Mouse", quantity: 1, totalPrice: "25.00" },
    { name: "USB-C Cable 2m", quantity: 2, totalPrice: "12.00" },
    { name: "USB Drive 64GB", quantity: 1, totalPrice: "15.00", discount: 10 },
  ],
  grossTotal: "52.00",
  vat: {
    rate: "20",
    amount: "10.40",
  },
  netToPay: "52.00",
  paymentMode: "CREDIT CARD",
  softwareInfo: "POS System v2.1 - Secured",
};

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student payments and fee assignments.
 */
export class PaymentController {
  /**
   * Fetches the assignment and financial payment status matrix for a classroom.
   * @param req - The IPC request context carrying classroom filtering parameters.
   * @returns A promise resolving to the final classroom assignment table dataset.
   */
  @IpcServer.register(HttpMethod.GET, PaymentRoutes.CLASSROOM_TABLE, {
    params: ClassroomFilterSchema,
  })
  static async getClassroomTable(req: IpcRequest<unknown, ClassroomFilter>) {
    return paymentService.getAssignmentTableOfClassroom(
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
   * Provisions foundational initial school fees directly onto a designated student record.
   * @param req - The IPC request context carrying the assignment details payload body.
   * @returns A promise resolving to the generated fee assignment operational results.
   */
  @IpcServer.register(HttpMethod.POST, PaymentRoutes.ASSIGN_FEES, {
    body: AssignFeesToStudentSchema,
  })
  static async assignFees(
    req: IpcRequest<AssignFeesToStudentPayload, unknown>,
  ) {
    return paymentService.assignFeesToStudent(req.body);
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
