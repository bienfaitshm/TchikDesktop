import z from "zod";
import {
  seatingSessionService,
  seatingAssignmentRepository,
} from "@/packages/@core/data-access/db/queries/seatings";
import {
  SeatingGeneratorSchema,
  schoolYearIdBaseSchema,
  BulkSeatingAssignmentSchema,
  type BulkSeatingAssignment,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { SeatingAssignmentRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const GenerateBodySchema = SeatingGeneratorSchema.extend(
  schoolYearIdBaseSchema.shape,
);
type GenerateBody = z.infer<typeof GenerateBodySchema>;

const RoomLayoutParamSchema = z.object({
  sessionId: z.string().min(1, "L'identifiant de la session est requis."),
  localroomId: z.string().min(1, "L'identifiant du local est requis."),
});
type RoomLayoutParam = z.infer<typeof RoomLayoutParamSchema>;

const UnassignedParamSchema = z.object({
  sessionId: z.string().min(1, "L'identifiant de la session est requis."),
  yearId: z.string().min(1, "L'identifiant de l'année académique est requis."),
});
type UnassignedParam = z.infer<typeof UnassignedParamSchema>;

const FindStudentParamSchema = z.object({
  sessionId: z.string().min(1, "L'identifiant de la session est requis."),
  enrollmentId: z.string().min(1, "L'identifiant de l'inscription est requis."),
});
type FindStudentParam = z.infer<typeof FindStudentParamSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student seating arrangements and layouts.
 */
export class SeatingAssignmentController {
  /**
   * Automatically generates optimized seating assignments using institutional and academic rules.
   * @param req - The IPC request context containing setup configurations and calendar boundaries.
   * @returns A promise resolving to the generated layout operational results.
   */
  @IpcServer.register(HttpMethod.POST, SeatingAssignmentRoutes.GENERATING, {
    body: GenerateBodySchema,
  })
  static async generate(req: IpcRequest<GenerateBody>) {
    return seatingSessionService.generate(req.body);
  }

  /**
   * Fetches the complete structural grid blueprint layout filled with assigned student slots.
   * @param req - The IPC request context carrying tracking reference and structural room keys.
   * @returns A promise resolving to the computed visual configuration matrix layout.
   */
  @IpcServer.register(HttpMethod.GET, SeatingAssignmentRoutes.LAYOUT, {
    params: RoomLayoutParamSchema,
  })
  static async getRoomLayout({
    params: { localroomId, sessionId },
  }: IpcRequest<unknown, RoomLayoutParam>) {
    return seatingAssignmentRepository.getRoomLayout(sessionId, localroomId);
  }

  /**
   * Commits bulk insert operations to attach large datasets of student records to layout spaces.
   * @param req - The IPC request context carrying bulk allocation specifications body.
   * @returns A promise resolving to the batch transaction confirmation summary.
   */
  @IpcServer.register(HttpMethod.POST, SeatingAssignmentRoutes.BULK, {
    body: BulkSeatingAssignmentSchema,
  })
  static async bulkAssign({ body }: IpcRequest<BulkSeatingAssignment>) {
    return seatingAssignmentRepository.bulkAssign(body.assignments);
  }

  /**
   * Rewrites current assignment structures by resetting allocations under a tracking code.
   * @param req - The IPC request context carrying updated full layout specifications payload.
   * @returns A promise resolving to the transaction reconstruction confirmation results.
   */
  @IpcServer.register(HttpMethod.POST, SeatingAssignmentRoutes.RE_ASSIGNED, {
    body: BulkSeatingAssignmentSchema,
  })
  static async rebuildAssignments({
    body: { assignments, sessionId },
  }: IpcRequest<BulkSeatingAssignment>) {
    return seatingAssignmentRepository.rebuildAssignments(
      sessionId,
      assignments,
    );
  }

  /**
   * Retrieves registered student profiles lacking spatial room slot indices.
   * @param req - The IPC request context holding filter parameters.
   * @returns A promise resolving to an array of unassigned student profiles.
   */
  @IpcServer.register(HttpMethod.GET, SeatingAssignmentRoutes.UNASSIGNED, {
    params: UnassignedParamSchema,
  })
  static async getUnassignedStudents({
    params: { sessionId, yearId },
  }: IpcRequest<unknown, UnassignedParam>) {
    return seatingAssignmentRepository.getUnassignedStudents(sessionId, yearId);
  }

  /**
   * Clears out all allocated placement spaces inside a designated room record space.
   * @param req - The IPC request context containing target structure descriptors.
   * @returns A promise resolving to the operation execution success wrapper object.
   */
  @IpcServer.register(HttpMethod.DELETE, SeatingAssignmentRoutes.CLEAR_ROOM, {
    body: RoomLayoutParamSchema,
  })
  static async clearRoomAssignments({
    body: { localroomId, sessionId },
  }: IpcRequest<RoomLayoutParam>) {
    const success = await seatingAssignmentRepository.clearRoomAssignments(
      sessionId,
      localroomId,
    );
    return { success };
  }

  /**
   * Locates the precise room coordinate tracking cell mapped to an enrollment item key.
   * @param req - The IPC request context holding targeted search constraints.
   * @returns A promise resolving to the targeted student placement information or null.
   */
  @IpcServer.register(HttpMethod.GET, SeatingAssignmentRoutes.FIND_STUDENT, {
    params: FindStudentParamSchema,
  })
  static async findStudentSeat({
    params: { enrollmentId, sessionId },
  }: IpcRequest<unknown, FindStudentParam>) {
    return seatingAssignmentRepository.findStudentSeat(sessionId, enrollmentId);
  }
}
