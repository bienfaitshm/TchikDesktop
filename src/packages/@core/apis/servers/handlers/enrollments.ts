import {
  enrollmentRepository,
  enrollmentService,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import {
  EnrollmentCreateSchema,
  EnrollmentFilterSchema,
  EnrollmentUpdateSchema,
  EnrollmentQuickCreateSchema,
  EnrollmentSchema,
  type EnrollmentFilter,
  type EnrollmentCreate,
  type EnrollmentQuickCreate,
  type EnrollmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { EnrollmentRoutes } from "../../routes-constant";
import z from "zod";

const EnrollmentIdSchema = EnrollmentSchema.pick({ enrollmentId: true });
type EnrollmentId = z.infer<typeof EnrollmentIdSchema>;

/**
 * Handles Inter-Process Communication (IPC) inbound requests for student enrollment records.
 */
export class EnrollmentController {
  /**
   * Retrieves all enrollments based on standard lookup query filters.
   * @param req - The IPC request context containing filtering parameters.
   * @returns A promise resolving to an array of matching enrollment records.
   */
  @IpcServer.register(HttpMethod.GET, EnrollmentRoutes.ALL, {
    params: EnrollmentFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, EnrollmentFilter>) {
    return enrollmentRepository.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified search structures for dropdown populators.
   * @param req - The IPC request context containing search validation options.
   * @returns A promise resolving to structured autocomplete selection options.
   */
  @IpcServer.register(HttpMethod.GET, EnrollmentRoutes.SEARCH, {
    params: EnrollmentFilterSchema,
  })
  static async getOptions(req: IpcRequest<unknown, EnrollmentFilter>) {
    return enrollmentService.getOptions(req.params);
  }

  /**
   * Instantiates a comprehensive enrollment record following full data specifications.
   * @param req - The IPC request context carrying the complete creation payload.
   * @returns A promise resolving to the fully instantiated enrollment record.
   */
  @IpcServer.register(HttpMethod.POST, EnrollmentRoutes.ALL, {
    body: EnrollmentCreateSchema,
  })
  static async create(req: IpcRequest<EnrollmentCreate>) {
    return enrollmentRepository.create(req.body);
  }

  /**
   * Executes a high-speed creation workflow using minimalist enrollment parameters.
   * @param req - The IPC request context carrying basic initialization variables.
   * @returns A promise resolving to the quickly processed enrollment instance.
   */
  @IpcServer.register(HttpMethod.POST, EnrollmentRoutes.QUICK_ENROLLMENT, {
    body: EnrollmentQuickCreateSchema,
  })
  static async quickCreate(req: IpcRequest<EnrollmentQuickCreate, unknown>) {
    return enrollmentService.quickCreate(req.body);
  }

  /**
   * Locates a single granular enrollment entity tracking its primary lookup key.
   * @param req - The IPC request context holding the unique identifier parameter.
   * @returns A promise resolving to the requested enrollment file or null.
   */
  @IpcServer.register(HttpMethod.GET, EnrollmentRoutes.DETAIL, {
    params: EnrollmentIdSchema,
  })
  static async getById(req: IpcRequest<unknown, EnrollmentId>) {
    return enrollmentRepository.findById(req.params.enrollmentId);
  }

  /**
   * Updates tracking values on an active enrollment entry targeted by parameter keys.
   * @param req - The IPC request context containing update data body and identification params.
   * @returns A promise resolving to the modified enrollment entry structure.
   */
  @IpcServer.register(HttpMethod.PUT, EnrollmentRoutes.DETAIL, {
    params: EnrollmentIdSchema,
    body: EnrollmentUpdateSchema,
  })
  static async update(req: IpcRequest<EnrollmentUpdate, EnrollmentId>) {
    return enrollmentRepository.updateById(req.params.enrollmentId, req.body);
  }

  /**
   * Removes an independent enrollment instance completely from active tracking databases.
   * @param req - The IPC request context carrying targeted identification parameters.
   * @returns A promise resolving to the final deletion execution output payload.
   */
  @IpcServer.register(HttpMethod.DELETE, EnrollmentRoutes.DETAIL, {
    params: EnrollmentIdSchema,
  })
  static async delete(req: IpcRequest<unknown, EnrollmentId>) {
    return enrollmentRepository.delete(req.params.enrollmentId);
  }
}
