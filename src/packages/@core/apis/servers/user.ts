import z from "zod";
import { UserQuery } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  type TUserFilter,
  type TUserCreate,
  type TUserUpdate,
  UserAttributesSchema,
  UserFilterSchema,
  UserCreateSchema,
  UserUpdateSchema,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "./abstract";
import { UserRoutes } from "../routes-constant";

const UserIdSchema = UserAttributesSchema.pick({ userId: true }).required();
type UserId = z.infer<typeof UserIdSchema>;

export class GetUsers extends AbstractEndpoint<any> {
  route = UserRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: UserFilterSchema,
  };

  protected handle({ params }: IpcRequest<any, TUserFilter>): Promise<unknown> {
    return UserQuery.findMany(params);
  }
}

export class PostUser extends AbstractEndpoint<any> {
  route = UserRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: UserCreateSchema,
  };

  protected handle({ body }: IpcRequest<TUserCreate, any>): Promise<unknown> {
    return UserQuery.create(body);
  }
}

export class GetUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
  };

  protected handle({ params }: IpcRequest<any, UserId>): Promise<unknown> {
    return UserQuery.findById(params.userId);
  }
}

export class UpdateUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
    body: UserUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<TUserUpdate, UserId>): Promise<unknown> {
    return UserQuery.update(params.userId, body);
  }
}

export class DeleteUser extends AbstractEndpoint<any> {
  route = UserRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: UserIdSchema,
  };

  protected handle({ params }: IpcRequest<any, UserId>): Promise<unknown> {
    return UserQuery.delete(params.userId);
  }
}
