import {
  feeAssignmentService,
  FeeAssignmentService,
  FeeAssignmentRepository,
  feeAssignmentRepository,
} from "@/packages/@core/data-access/db";
import {
  FeeAssignmentSchema,
  FeeAssignmentCreateSchema,
  FeeAssignmentUpdateSchema,
  FeeAssignmentFilterSchema,
  UpdateAmountByAssignmentsSchema,
  UpdateAmountByClassroomsSchema,
  ExemptFromFeeSchema,
  MarkAsPaidSchema,
  type FeeAssignmentFilter,
  type FeeAssignmentCreate,
  type FeeAssignmentUpdate,
  type UpdateAmountByAssignments,
  type UpdateAmountByClassrooms,
  type ExemptFromFee,
  type MarkAsPaid,
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
  static feeAssignService: FeeAssignmentService = feeAssignmentService;
  static feeAssignRepo: FeeAssignmentRepository = feeAssignmentRepository;
  /**
   * Retrieves all fee assignments based on lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of fee assignments.
   */
  @IpcServer.register(HttpMethod.GET, FeeAssignmentRoutes.ALL, {
    params: FeeAssignmentFilterSchema,
  })
  static async getAll({ params }: IpcRequest<unknown, FeeAssignmentFilter>) {
    return FeeAssignmentController.feeAssignRepo.findMany(params);
  }

  /**
   * Searches fee assignments based on matching search criteria.
   * @param req - The IPC request object containing search filtering parameters.
   * @returns A promise resolving to matching fee assignments.
   */
  @IpcServer.register(HttpMethod.GET, FeeAssignmentRoutes.SEARCH, {
    params: FeeAssignmentFilterSchema,
  })
  static async getSearchFeeAssignment({
    params,
  }: IpcRequest<unknown, FeeAssignmentFilter>) {
    return FeeAssignmentController.feeAssignService.getOptions(params);
  }

  /**
   * Creates a new fee assignment record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized fee assignment instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeAssignmentRoutes.ALL, {
    body: FeeAssignmentCreateSchema,
  })
  static async create({ body }: IpcRequest<FeeAssignmentCreate>) {
    return FeeAssignmentController.feeAssignRepo.create(body);
  }

  /**
   * Fetches specific fee assignment details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target fee assignment object or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeAssignmentRoutes.DETAIL, {
    params: AssignmentIdSchema,
  })
  static async getById({ params }: IpcRequest<unknown, AssignmentId>) {
    return FeeAssignmentController.feeAssignRepo.findById(params.assignmentId);
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
  static async update({
    params,
    body,
  }: IpcRequest<FeeAssignmentUpdate, AssignmentId>) {
    return FeeAssignmentController.feeAssignRepo.updateById(
      params.assignmentId,
      body,
    );
  }

  /**
   * Exempts specified students from fee obligations for given assignments.
   * @param req - The IPC request object containing student enrollment and assignment IDs.
   * @returns A promise resolving to the result of the exemption operation.
   */
  @IpcServer.register(HttpMethod.POST, FeeAssignmentRoutes.EXEMPT_FROM_FEE, {
    body: ExemptFromFeeSchema,
  })
  static async exemptStudentsFromFee({ body }: IpcRequest<ExemptFromFee>) {
    return feeAssignmentService.exemptFromPayment(
      body.studentEnrollmentIds,
      body.assignmentIds,
    );
  }

  /**
   * Updates total fee amount and currency for targeted assignment identifiers.
   * @param req - The IPC request carrying target assignment IDs and new fee details.
   * @returns A promise resolving to the updated fee assignments result.
   */
  @IpcServer.register(
    HttpMethod.POST,
    FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_ASSIGNMENT,
    {
      body: UpdateAmountByAssignmentsSchema,
    },
  )
  static async updateAmountByAssignments({
    body,
  }: IpcRequest<UpdateAmountByAssignments>) {
    return feeAssignmentService.adjustAmount({
      newTotalAmount: body.newTotalAmount,
      currency: body.currency,
      assignmentIds: body.assignmentIds,
      scheduleIds: body.scheduleIds,
    });
  }

  @IpcServer.register(HttpMethod.POST, FeeAssignmentRoutes.MARK_AS_PAID, {
    body: MarkAsPaidSchema,
  })
  static async markAsPaid({ body }: IpcRequest<MarkAsPaid>) {
    return feeAssignmentService.markAsPaid(body);
  }

  /**
   * Updates total fee amount and currency for all students enrolled in specified classrooms.
   * @param req - The IPC request carrying classroom IDs and new fee details.
   * @returns A promise resolving to the updated classroom fee assignments result.
   */
  @IpcServer.register(
    HttpMethod.POST,
    FeeAssignmentRoutes.UPDATE_TOTAL_AMOUNT_CLASSROOM,
    {
      body: UpdateAmountByClassroomsSchema,
    },
  )
  static async updateAmountByClassrooms({
    body,
  }: IpcRequest<UpdateAmountByClassrooms>) {
    return feeAssignmentService.adjustAmount({
      newTotalAmount: body.newTotalAmount,
      currency: body.currency,
      classroomIds: body.classroomIds,
      scheduleIds: body.scheduleIds,
    });
  }

  /**
   * Deletes a specific target fee assignment record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeAssignmentRoutes.DETAIL, {
    params: AssignmentIdSchema,
  })
  static async delete({ params }: IpcRequest<unknown, AssignmentId>) {
    return FeeAssignmentController.feeAssignRepo.delete(params.assignmentId);
  }
}
