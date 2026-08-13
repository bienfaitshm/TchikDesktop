import z from "zod";
import {
  tutorService,
  TutorService,
  tutorRepository,
  TutorRepository,
  type TutorDTO,
  type BaseTutorFilters,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import {
  TutorSchema,
  TutorFilterSchema,
  TutorCreateSchema,
  TutorQuickInputSchema,
  TutorUpdateSchema,
  type TutorQuickInput,
  type TutorFilter,
  type TutorCreate,
  type TutorUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { SelectOption } from "@/packages/drizzle-queries";
import { TutorRoutes } from "../../routes-constant";

/**
 * Zod schema for validating tutor ID parameters.
 */
const TutorIdSchema = TutorSchema.pick({ tutorId: true }).required();

/**
 * Type inferred from TutorIdSchema representing a tutor ID parameter payload.
 */
type TutorId = z.infer<typeof TutorIdSchema>;

/**
 * Inter-Process Communication (IPC) controller handling tutor management endpoints.
 */
export class TutorController {
  private static service: TutorService = tutorService;
  private static repository: TutorRepository = tutorRepository;

  /**
   * Sets a custom TutorService instance for testing or dependency injection.
   * @param customService - Alternative TutorService instance.
   */
  public static setService(customService: TutorService): void {
    TutorController.service = customService;
  }

  /**
   * Retrieves all tutors matching optional query filter parameters.
   * @param req - IPC request containing lookup filter parameters.
   * @returns A promise resolving to an array of matching tutor records.
   */
  @IpcServer.register(HttpMethod.GET, TutorRoutes.ALL, {
    params: TutorFilterSchema,
  })
  static async getAll(
    req: IpcRequest<unknown, TutorFilter>,
  ): Promise<TutorDTO[]> {
    return TutorController.repository.findMany(req.params as BaseTutorFilters);
  }

  /**
   * Retrieves formatted selection options for search combobox components.
   * @param req - IPC request containing selection search parameters.
   * @returns A promise resolving to formatted selection options.
   */
  @IpcServer.register(HttpMethod.GET, TutorRoutes.SEARCH, {
    params: TutorFilterSchema,
  })
  static async getOptions(
    req: IpcRequest<unknown, TutorFilter>,
  ): Promise<SelectOption[]> {
    return TutorController.service.getOptions(req.params as BaseTutorFilters);
  }

  /**
   * Creates a new tutor record and its associated user account.
   * @param req - IPC request containing tutor creation payload.
   * @returns A promise resolving to the created tutor record.
   */
  @IpcServer.register(HttpMethod.POST, TutorRoutes.ALL, {
    body: TutorCreateSchema,
  })
  static async create(req: IpcRequest<TutorCreate>): Promise<TutorDTO> {
    return TutorController.repository.create(req.body);
  }

  @IpcServer.register(HttpMethod.POST, TutorRoutes.QUICK, {
    body: TutorQuickInputSchema,
  })
  static async createTutor(
    req: IpcRequest<TutorQuickInput>,
  ): Promise<TutorDTO> {
    return TutorController.service.createTutor(req.body);
  }

  /**
   * Retrieves full details of a single tutor matching its identifier.
   * @param req - IPC request containing target tutor ID parameter.
   * @returns A promise resolving to the target tutor record or null.
   */
  @IpcServer.register(HttpMethod.GET, TutorRoutes.DETAIL, {
    params: TutorIdSchema,
  })
  static async getById(
    req: IpcRequest<unknown, TutorId>,
  ): Promise<TutorDTO | null> {
    return TutorController.repository.findById(req.params.tutorId);
  }

  /**
   * Updates configuration and personal fields on an existing tutor record.
   * @param req - IPC request containing target ID parameter and update payload.
   * @returns A promise resolving to the updated tutor record.
   */
  @IpcServer.register(HttpMethod.PUT, TutorRoutes.DETAIL, {
    params: TutorIdSchema,
    body: TutorUpdateSchema,
  })
  static async update(req: IpcRequest<TutorUpdate, TutorId>) {
    return TutorController.repository.updateById(req.params.tutorId, req.body);
  }

  /**
   * Deletes a designated tutor record permanently from database tables.
   * @param req - IPC request containing target tutor ID parameter.
   * @returns A promise resolving to the deleted tutor record.
   */
  @IpcServer.register(HttpMethod.DELETE, TutorRoutes.DETAIL, {
    params: TutorIdSchema,
  })
  static async delete(req: IpcRequest<unknown, TutorId>): Promise<unknown> {
    return TutorController.repository.delete(req.params.tutorId);
  }
}
