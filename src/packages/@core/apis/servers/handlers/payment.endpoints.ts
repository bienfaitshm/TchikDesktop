import z from "zod";
import { paymentService } from "@/packages/@core/data-access/db/queries";
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
  AbstractEndpoint,
} from "@/packages/electron-ipc-rest";
import { PaymentRoutes } from "../../routes-constant";

const ClassroomFilterSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  classId: z.string().nonempty(),
});
type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

const AssignFeesToStudentSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  enrollmentId: z.string().nonempty(),
  classroomId: z.string().nonempty(),
});
type AssignFeesToStudentPayload = z.infer<typeof AssignFeesToStudentSchema>;

const ProcessPaymentSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  assignmentId: z.string().nonempty(),
  amountReceived: z.number().positive(),
  currencyReceived: z.nativeEnum(CURRENCY_ENUM),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD_ENUM),
  transactionReference: z.string().optional(),
});
type ProcessPaymentPayload = z.infer<typeof ProcessPaymentSchema>;

/**
 * Récupérer le tableau matriciel des assignations et des statuts de paiement d'une classe
 */
export class GetClassroomAssignmentTable extends AbstractEndpoint<any> {
  route = PaymentRoutes.CLASSROOM_TABLE;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: ClassroomFilterSchema,
  };

  protected handle({
    params,
    context,
  }: IpcRequest<any, ClassroomFilter>): Promise<unknown> {
    return paymentService.getAssignmentTableOfClassroom(
      params,
      ({ message, pourcent }) => {
        context.sender.send(this.route, { message, pourcent });
      },
    );
  }
}

/**
 * Déclencher manuellement ou automatiquement l'assignation de frais initiaux pour un étudiant
 */
export class PostAssignFeesToStudent extends AbstractEndpoint<any> {
  route = PaymentRoutes.ASSIGN_FEES;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: AssignFeesToStudentSchema,
  };

  protected handle({
    body,
  }: IpcRequest<AssignFeesToStudentPayload, any>): Promise<unknown> {
    return paymentService.assignFeesToStudent(body);
  }
}

/**
 * Encaisser un versement étudiant (gère les multi-devises et les écritures comptables au guichet)
 */
export class PostProcessStudentPayment extends AbstractEndpoint<any> {
  route = PaymentRoutes.PROCESS_PAYMENT;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: ProcessPaymentSchema,
  };

  protected handle({
    body,
  }: IpcRequest<ProcessPaymentPayload, any>): Promise<unknown> {
    return paymentService.processStudentPayment(body);
  }
}
