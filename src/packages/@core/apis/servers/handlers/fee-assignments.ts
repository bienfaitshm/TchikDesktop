import { feeAssignmentRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeAssignmentSchema,
  FeeAssignmentCreateSchema,
  FeeAssignmentUpdateSchema,
  FeeAssignmentFilterSchema,
  type FeeAssignmentFilter,
  type FeeAssignmentCreate,
  type FeeAssignmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { FeeAssignmentRoutes } from "../../routes-constant";
import z from "zod";

const AssignmentIdSchema = FeeAssignmentSchema.pick({ assignmentId: true });
type AssignmentId = z.infer<typeof AssignmentIdSchema>;

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student fee assignments.
 */
export class FeeAssignmentController {
  /**
   * Retrieves all fee assignments based on lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of fee assignments.
   */
  @IpcServer.register(HttpMethod.GET, FeeAssignmentRoutes.ALL, {
    params: FeeAssignmentFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, FeeAssignmentFilter>) {
    return feeAssignmentRepository.findMany(req.params);
  }

  /**
   * Creates a new fee assignment record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized fee assignment instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeAssignmentRoutes.ALL, {
    body: FeeAssignmentCreateSchema,
  })
  static async create(req: IpcRequest<FeeAssignmentCreate>) {
    return feeAssignmentRepository.create(req.body);
  }

  /**
   * Fetches a specific fee assignment details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target fee assignment object or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeAssignmentRoutes.DETAIL, {
    params: AssignmentIdSchema,
  })
  static async getById(req: IpcRequest<unknown, AssignmentId>) {
    return feeAssignmentRepository.findById(req.params.assignmentId);
  }

  /**
   * Updates fields on an existing fee assignment designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated fee assignment object.
   */
  @IpcServer.register(HttpMethod.PUT, FeeAssignmentRoutes.DETAIL, {
    params: AssignmentIdSchema,
    body: FeeAssignmentUpdateSchema,
  })
  static async update(req: IpcRequest<FeeAssignmentUpdate, AssignmentId>) {
    return feeAssignmentRepository.updateById(
      req.params.assignmentId,
      req.body,
    );
  }

  /**
   * Deletes a specific target fee assignment record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeAssignmentRoutes.DETAIL, {
    params: AssignmentIdSchema,
  })
  static async delete(req: IpcRequest<unknown, AssignmentId>) {
    return feeAssignmentRepository.delete(req.params.assignmentId);
  }
}
