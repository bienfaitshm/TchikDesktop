import z from "zod";
import { studentPaymentRepository } from "@/packages/@core/data-access/db/queries";
import {
  StudentPaymentSchema,
  StudentPaymentCreateSchema,
  StudentPaymentUpdateSchema,
  StudentPaymentFilterSchema,
  type StudentPaymentFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { StudentPaymentRoutes } from "../../routes-constant";

const PaymentIdSchema = StudentPaymentSchema.pick({ paymentId: true });
type PaymentId = z.infer<typeof PaymentIdSchema>;

export class GetStudentPayments extends AbstractEndpoint<any> {
  route = StudentPaymentRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: StudentPaymentFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, StudentPaymentFilter>): Promise<unknown> {
    return studentPaymentRepository.findMany(params);
  }
}

export class PostStudentPayment extends AbstractEndpoint<any> {
  route = StudentPaymentRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: StudentPaymentCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<
    z.infer<typeof StudentPaymentCreateSchema>,
    any
  >): Promise<unknown> {
    return studentPaymentRepository.create(body);
  }
}

export class GetStudentPayment extends AbstractEndpoint<any> {
  route = StudentPaymentRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: PaymentIdSchema,
  };

  protected handle({ params }: IpcRequest<any, PaymentId>): Promise<unknown> {
    return studentPaymentRepository.findById(params.paymentId);
  }
}

export class UpdateStudentPayment extends AbstractEndpoint<any> {
  route = StudentPaymentRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: PaymentIdSchema,
    body: StudentPaymentUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof StudentPaymentUpdateSchema>,
    PaymentId
  >): Promise<unknown> {
    return studentPaymentRepository.update(params.paymentId, body);
  }
}

export class DeleteStudentPayment extends AbstractEndpoint<any> {
  route = StudentPaymentRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: PaymentIdSchema,
  };

  protected handle({ params }: IpcRequest<any, PaymentId>): Promise<unknown> {
    return studentPaymentRepository.delete(params.paymentId);
  }
}
