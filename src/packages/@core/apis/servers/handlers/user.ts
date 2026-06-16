import z from "zod";
import {
  userRepository,
  userService,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  type IpcRequest,
  type ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  type UserFilter,
  type UserCreate,
  type UserUpdate,
  UserSchema,
  UserFilterSchema,
  UserCreateSchema,
  UserUpdateSchema,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";
import type {
  InsertUser,
  UpdateUser as UpUser,
} from "@/packages/@core/data-access/db/schemas";
import { AbstractEndpoint } from "../abstract";
import { UserRoutes } from "../../routes-constant";
import type { SelectOption } from "@/packages/@core/data-access/db/queries/select-option.transformer";
import type { UserDTO } from "@/packages/@core/data-access/db/queries/users";

const UserIdSchema = UserSchema.pick({ userId: true }).required();
type UserId = z.infer<typeof UserIdSchema>;

export const searchUserOptionsSchema =
  createSearchOptionsSchema(UserFilterSchema);
export type SearchUserOptionsParams = z.infer<typeof searchUserOptionsSchema>;

/**
 * Récupère la liste brute des utilisateurs filtrés.
 */
export class GetUsers extends AbstractEndpoint<any> {
  route = UserRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: UserFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, UserFilter>): Promise<UserDTO[]> {
    return userRepository.findMany(params as any);
  }
}

/**
 * Endpoint dédié aux composants UI Select / Combobox avec recherche intégrée.
 */
export class GetSearchUsers extends AbstractEndpoint<any> {
  route = UserRoutes.SEARCH;
  method = HttpMethod.GET;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: searchUserOptionsSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, SearchUserOptionsParams>): Promise<SelectOption[]> {
    return userService.getOptions(params as any);
  }
}

/**
 * Création d'un nouvel utilisateur.
 */
export class PostUser extends AbstractEndpoint<any> {
  route = UserRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    body: UserCreateSchema,
  };

  protected handle({ body }: IpcRequest<UserCreate, unknown>) {
    return userRepository.create(body as InsertUser);
  }
}

/**
 * Récupère le détail complet d'un utilisateur par son ID.
 */
export class GetUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, UserId>): Promise<UserDTO | null> {
    return userRepository.findById(params.userId);
  }
}

/**
 * Met à jour les informations d'un utilisateur.
 */
export class UpdateUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
    body: UserUpdateSchema,
  };

  protected handle({ params, body }: IpcRequest<UserUpdate, UserId>) {
    return userRepository.update(params.userId, body as UpUser);
  }
}

/**
 * Supprime un utilisateur par son ID.
 */
export class DeleteUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
  };

  protected handle({ params }: IpcRequest<any, UserId>) {
    return userRepository.delete(params.userId);
  }
}
