import z from "zod";
import { feeConfigurationRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeConfigurationBase,
  FeeConfigurationCreateSchema,
  FeeConfigurationFilterSchema,
  FeeConfigurationUpdateSchema,
  type FeeConfigurationFilter,
  type FeeConfigurationCreate,
  type FeeConfigurationUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { FeeConfigurationRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const FeeConfigIdSchema = FeeConfigurationBase.pick({ feeConfigId: true });
type FeeConfigId = z.infer<typeof FeeConfigIdSchema>;

export const FeeApplicableConfigurationSchema = FeeConfigurationBase.pick({
  optionId: true,
  section: true,
  schoolId: true,
  yearId: true,
})
  .required({ schoolId: true, yearId: true })
  .extend(
    z.object({
      classroomId: z.string().min(1, "L'identifiant de la classe est requis."),
    }).shape,
  );

type FeeApplicableConfiguration = z.infer<
  typeof FeeApplicableConfigurationSchema
>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for fee configuration management.
 */
export class FeeConfigurationController {
  /**
   * Retrieves all fee configurations based on standard lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching fee configurations.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.ALL, {
    params: FeeConfigurationFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, FeeConfigurationFilter>) {
    return feeConfigurationRepository.findMany(req.params);
  }

  /**
   * Creates a new fee configuration record with the provided body specification.
   * @param req - The IPC request object containing the raw initialization payload.
   * @returns A promise resolving to the newly initialized fee configuration instance.
   */
  @IpcServer.register(HttpMethod.POST, FeeConfigurationRoutes.ALL, {
    body: FeeConfigurationCreateSchema,
  })
  static async create(req: IpcRequest<FeeConfigurationCreate>) {
    return feeConfigurationRepository.create(req.body);
  }

  /**
   * Fetches a specific fee configuration details by its unique identifier.
   * @param req - The IPC request object containing target parameters.
   * @returns A promise resolving to the target fee configuration object or null.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.DETAIL, {
    params: FeeConfigIdSchema,
  })
  static async getById(req: IpcRequest<unknown, FeeConfigId>) {
    return feeConfigurationRepository.findById(req.params.feeConfigId);
  }

  /**
   * Resolves relevant fee configurations matching dynamic context parameters.
   * @param req - The IPC request object carrying target contextual properties.
   * @returns A promise resolving to the applicable configuration structures.
   */
  @IpcServer.register(HttpMethod.GET, FeeConfigurationRoutes.APPLICABLE, {
    params: FeeApplicableConfigurationSchema,
  })
  static async getApplicable(
    req: IpcRequest<unknown, FeeApplicableConfiguration>,
  ) {
    return feeConfigurationRepository.findApplicableConfigurations(req.params);
  }

  /**
   * Updates fields on an existing fee configuration designated by route parameters.
   * @param req - The IPC request object carrying the identification parameters and payload.
   * @returns A promise resolving to the mutated fee configuration object.
   */
  @IpcServer.register(HttpMethod.PUT, FeeConfigurationRoutes.DETAIL, {
    params: FeeConfigIdSchema,
    body: FeeConfigurationUpdateSchema,
  })
  static async update(req: IpcRequest<FeeConfigurationUpdate, FeeConfigId>) {
    return feeConfigurationRepository.updateById(
      req.params.feeConfigId,
      req.body,
    );
  }

  /**
   * Deletes a specific target fee configuration record.
   * @param req - The IPC request object holding target identification params.
   * @returns A promise resolving to the operation completion result.
   */
  @IpcServer.register(HttpMethod.DELETE, FeeConfigurationRoutes.DETAIL, {
    params: FeeConfigIdSchema,
  })
  static async delete(req: IpcRequest<unknown, FeeConfigId>) {
    return feeConfigurationRepository.delete(req.params.feeConfigId);
  }
}
