import {
  feeConfigurationRepository,
  feeConfigurationService,
} from "@/packages/@core/data-access/db/queries";
import {
  feeApplicableConfigurationSchema,
  feeConfigIdSchema,
  FeeConfigurationCreateSchema,
  FeeConfigurationFilterSchema,
  FeeConfigurationUpdateSchema,
  finClassroomApplicableConfigParamsSchema,
  type FeeApplicableConfiguration,
  type FeeConfigId,
  type FeeConfigurationCreate,
  type FeeConfigurationFilter,
  type FeeConfigurationUpdate,
  type FinClassroomApplicableConfigParams,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { FeeConfigurationRoutes } from "../../routes-constant";

/**
 * Controller handling Inter-Process Communication (IPC) requests for fee configuration operations.
 */
export class FeeConfigurationController {
  /**
   * Retrieves all fee configurations matching the provided filter parameters.
   * @param req - The IPC request containing filtering query parameters.
   * @returns A promise resolving to an array of fee configuration records.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.ALL, {
    params: FeeConfigurationFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, FeeConfigurationFilter>) {
    return feeConfigurationRepository.findMany(req.params);
  }

  /**
   * Creates a new fee configuration record.
   * @param req - The IPC request containing the creation payload in its body.
   * @returns A promise resolving to the created fee configuration instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeConfigurationRoutes.ALL, {
    body: FeeConfigurationCreateSchema,
  })
  static async create(req: IpcRequest<FeeConfigurationCreate>) {
    return feeConfigurationRepository.create(req.body);
  }

  /**
   * Fetches a specific fee configuration by its unique identifier.
   * @param req - The IPC request containing the target fee configuration identifier.
   * @returns A promise resolving to the target fee configuration or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.DETAIL, {
    params: feeConfigIdSchema,
  })
  static async getById(req: IpcRequest<unknown, FeeConfigId>) {
    return feeConfigurationRepository.findById(req.params.feeConfigId);
  }

  /**
   * Resolves applicable fee configurations matching general contextual properties.
   * @param req - The IPC request containing applicable configuration parameters.
   * @returns A promise resolving to the matching applicable configurations.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.APPLICABLE, {
    params: feeApplicableConfigurationSchema,
  })
  static async getApplicable(
    req: IpcRequest<unknown, FeeApplicableConfiguration>,
  ) {
    return feeConfigurationRepository.findApplicableConfigurations(req.params);
  }

  /**
   * Resolves applicable fee configurations specific to a classroom context.
   * @param req - The IPC request containing classroom contextual parameters.
   * @returns A promise resolving to the classroom applicable configurations.
   */
  @IpcServer.register(
    HttpMethod.GET,
    FeeConfigurationRoutes.APPLICABLE_CLASSROOM,
    {
      params: finClassroomApplicableConfigParamsSchema,
    },
  )
  static async getClassroomFeeConfigApplicable(
    req: IpcRequest<unknown, FinClassroomApplicableConfigParams>,
  ) {
    return feeConfigurationService.getApplicableOfClassroom(req.params);
  }

  /**
   * Updates an existing fee configuration by its unique identifier.
   * @param req - The IPC request containing the target identifier and update payload.
   * @returns A promise resolving to the updated fee configuration instance.
   */
  @IpcServer.register(HttpMethod.PUT, FeeConfigurationRoutes.DETAIL, {
    params: feeConfigIdSchema,
    body: FeeConfigurationUpdateSchema,
  })
  static async update(req: IpcRequest<FeeConfigurationUpdate, FeeConfigId>) {
    return feeConfigurationRepository.updateById(
      req.params.feeConfigId,
      req.body,
    );
  }

  /**
   * Deletes a specific fee configuration record.
   * @param req - The IPC request containing the target fee configuration identifier.
   * @returns A promise resolving to the deletion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeConfigurationRoutes.DETAIL, {
    params: feeConfigIdSchema,
  })
  static async delete(req: IpcRequest<unknown, FeeConfigId>) {
    return feeConfigurationRepository.delete(req.params.feeConfigId);
  }
}
