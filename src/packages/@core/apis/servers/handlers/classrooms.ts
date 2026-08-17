import {
  classroomRepository,
  classroomService,
} from "@/packages/@core/data-access/db/queries";
import {
  ClassroomSchema,
  ClassroomCreateSchema,
  type ClassroomCreate,
  ClassroomUpdateSchema,
  type ClassroomUpdate,
  ClassroomFilterSchema,
  type ClassroomFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { ClassroomRoutes } from "../../routes-constant";
import z from "zod";

const ClassIdSchema = ClassroomSchema.pick({ classId: true });
type ClassId = z.infer<typeof ClassIdSchema>;
/**
 * Handles Inter-Process Communication (IPC) inbound requests for classroom management.
 */
export class ClassroomController {
  /**
   * Retrieves all classrooms based on matching optional query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of filtered classrooms.
   */
  @IpcServer.register(HttpMethod.GET, ClassroomRoutes.ALL, {
    params: ClassroomFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, ClassroomFilter>) {
    return classroomRepository.findMany(req.params);
  }

  /**
   * Retrieves valid search metadata options for UI filtering builders.
   * @param req - The IPC request object containing query search options.
   * @returns A promise resolving to structured classroom search filter metadata.
   */
  @IpcServer.register(HttpMethod.GET, ClassroomRoutes.SEARCH, {
    params: ClassroomFilterSchema,
  })
  static async getOptions(req: IpcRequest<unknown, ClassroomFilter>) {
    return classroomService.getOptions(req.params);
  }

  /**
   * Retrieves classrooms paired with their corresponding active student enrollments.
   * @param req - The IPC request object containing operational boundaries.
   * @returns A promise resolving to classrooms mapped with student collections.
   */
  @IpcServer.register(HttpMethod.GET, ClassroomRoutes.ALL_ENROLLMENT, {
    params: ClassroomFilterSchema,
  })
  static async getWithEnrollments(req: IpcRequest<unknown, ClassroomFilter>) {
    return classroomRepository.findClassroomsWithStudents(req.params);
  }

  /**
   * Fetches a specific classroom details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target classroom object or null.
   */
  @IpcServer.register(HttpMethod.GET, ClassroomRoutes.DETAIL, {
    params: ClassIdSchema,
  })
  static async getById(req: IpcRequest<unknown, ClassId>) {
    return classroomRepository.findById(req.params.classId);
  }

  /**
   * Creates a new classroom record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized classroom instance.
   */
  @IpcServer.register(HttpMethod.POST, ClassroomRoutes.ALL, {
    body: ClassroomCreateSchema,
  })
  static async create(req: IpcRequest<ClassroomCreate>) {
    return classroomRepository.create(req.body);
  }

  /**
   * Updates fields on an existing classroom designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated classroom object.
   */
  @IpcServer.register(HttpMethod.PUT, ClassroomRoutes.DETAIL, {
    params: ClassIdSchema,
    body: ClassroomUpdateSchema,
  })
  static async update(req: IpcRequest<ClassroomUpdate, ClassId>) {
    return classroomRepository.updateById(req.params.classId, req.body);
  }

  /**
   * Deletes a specific target classroom record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, ClassroomRoutes.DETAIL, {
    params: ClassIdSchema,
  })
  static async delete(req: IpcRequest<unknown, ClassId>) {
    return classroomRepository.delete(req.params.classId);
  }
}
