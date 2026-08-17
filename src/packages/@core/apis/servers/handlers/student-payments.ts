import z from "zod";
import { studentPaymentRepository } from "@/packages/@core/data-access/db/queries";
import {
  StudentPaymentSchema,
  StudentPaymentCreateSchema,
  StudentPaymentUpdateSchema,
  StudentPaymentFilterSchema,
  type StudentPaymentFilter,
  type StudentPaymentCreate,
  type StudentPaymentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { StudentPaymentRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const PaymentIdSchema = StudentPaymentSchema.pick({ paymentId: true });
type PaymentId = z.infer<typeof PaymentIdSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student payment records.
 */
export class StudentPaymentController {
  /**
   * Retrieves all student payments based on lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching student payment records.
   */
  @IpcServer.register(HttpMethod.GET, StudentPaymentRoutes.ALL, {
    params: StudentPaymentFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, StudentPaymentFilter>) {
    return studentPaymentRepository.findMany(req.params);
  }

  /**
   * Creates a new student payment record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized student payment instance.
   */
  @IpcServer.register(HttpMethod.POST, StudentPaymentRoutes.ALL, {
    body: StudentPaymentCreateSchema,
  })
  static async create(req: IpcRequest<StudentPaymentCreate>) {
    return studentPaymentRepository.create(req.body);
  }

  /**
   * Fetches a specific student payment details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target student payment object or null.
   */
  @IpcServer.register(HttpMethod.GET, StudentPaymentRoutes.DETAIL, {
    params: PaymentIdSchema,
  })
  static async getById(req: IpcRequest<unknown, PaymentId>) {
    return studentPaymentRepository.findById(req.params.paymentId);
  }

  /**
   * Updates fields on an existing student payment designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated student payment object.
   */
  @IpcServer.register(HttpMethod.PUT, StudentPaymentRoutes.DETAIL, {
    params: PaymentIdSchema,
    body: StudentPaymentUpdateSchema,
  })
  static async update(req: IpcRequest<StudentPaymentUpdate, PaymentId>) {
    return studentPaymentRepository.updateById(req.params.paymentId, req.body);
  }

  /**
   * Deletes a specific target student payment record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, StudentPaymentRoutes.DETAIL, {
    params: PaymentIdSchema,
  })
  static async delete(req: IpcRequest<unknown, PaymentId>) {
    return studentPaymentRepository.delete(req.params.paymentId);
  }
}
