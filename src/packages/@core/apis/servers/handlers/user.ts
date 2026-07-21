import z from "zod";
import {
  userRepository,
  userService,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import {
  UserSchema,
  UserFilterSchema,
  UserCreateSchema,
  UserUpdateSchema,
  type UserFilter,
  type UserCreate,
  type UserUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { UserRoutes } from "../../routes-constant";

/* =========================================================================
   SCHEMAS & TYPES DE PARAMÈTRES DÉDIÉS
   ========================================================================= */

const UserIdSchema = UserSchema.pick({ userId: true }).required();
type UserId = z.infer<typeof UserIdSchema>;

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Handles Inter-Process Communication (IPC) inbound requests for user identity and account management.
 */
export class UserController {
  /**
   * Retrieves all users based on optional lookup query filters.
   * @param req - The IPC request object containing filtering parameters.
   * @returns A promise resolving to an array of matching user records.
   */
  @IpcServer.register(HttpMethod.GET, UserRoutes.ALL, {
    params: UserFilterSchema,
  })
  static async getAll(req: IpcRequest<unknown, UserFilter>) {
    return userRepository.findMany(req.params);
  }

  /**
   * Retrieves selection data and simplified structures for search combobox elements.
   * @param req - The IPC request object containing search options parameters.
   * @returns A promise resolving to structured autocomplete user selection choices.
   */
  @IpcServer.register(HttpMethod.GET, UserRoutes.SEARCH, {
    params: UserFilterSchema,
  })
  static async getOptions(req: IpcRequest<unknown, UserFilter>) {
    return userService.getOptions(req.params);
  }

  /**
   * Creates a new user instance record inside the persistent engine.
   * @param req - The IPC request object carrying the initialization payload.
   * @returns A promise resolving to the newly initialized user instance.
   */
  @IpcServer.register(HttpMethod.POST, UserRoutes.ALL, {
    body: UserCreateSchema,
  })
  static async create(req: IpcRequest<UserCreate>) {
    return userRepository.create(req.body);
  }

  /**
   * Fetches full structural details of a single user matching its tracking identifier.
   * @param req - The IPC request object holding target parameters.
   * @returns A promise resolving to the target user record details or null.
   */
  @IpcServer.register(HttpMethod.GET, UserRoutes.DETAIL, {
    params: UserIdSchema,
  })
  static async getById(req: IpcRequest<unknown, UserId>) {
    return userRepository.findById(req.params.userId);
  }

  /**
   * Updates configuration fields on an existing user account profile.
   * @param req - The IPC request object carrying operational payloads and identifier parameters.
   * @returns A promise resolving to the modified user data object.
   */
  @IpcServer.register(HttpMethod.PUT, UserRoutes.DETAIL, {
    params: UserIdSchema,
    body: UserUpdateSchema,
  })
  static async update(req: IpcRequest<UserUpdate, UserId>) {
    return userRepository.updateById(req.params.userId, req.body);
  }

  /**
   * Purges a designated user account permanently from active infrastructure tables.
   * @param req - The IPC request object holding target identification keys.
   * @returns A promise resolving to the operational execution results.
   */
  @IpcServer.register(HttpMethod.DELETE, UserRoutes.DETAIL, {
    params: UserIdSchema,
  })
  static async delete(req: IpcRequest<unknown, UserId>) {
    return userRepository.delete(req.params.userId);
  }
}
