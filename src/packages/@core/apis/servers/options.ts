import z from "zod";
import { OptionQuery } from "@/packages/@core/data-access/data-queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  OptionFilterSchema,
  OptionCreateSchema,
  OptionUpdateSchema,
  OptionAttributesSchema,
  type TOptionCreate,
  type TOptionUpdate,
  type TOptionFilter,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "./abstract";
import { OptionRoutes } from "../routes-constant";

const OptionIdSchema = OptionAttributesSchema.pick({ optionId: true });

type OptionId = z.infer<typeof OptionIdSchema>;

export class GetOptions extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TOptionFilter>): Promise<unknown> {
    return OptionQuery.findMany(params);
  }
}

export class PostOption extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: OptionCreateSchema,
  };

  protected handle({ body }: IpcRequest<TOptionCreate, any>): Promise<unknown> {
    return OptionQuery.findMany(body);
  }
}

export class GetOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionIdSchema,
  };

  protected handle({ params }: IpcRequest<any, OptionId>): Promise<unknown> {
    return OptionQuery.findById(params.optionId);
  }
}

export class UpdateOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionIdSchema,
    body: OptionUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<TOptionUpdate, OptionId>): Promise<unknown> {
    return OptionQuery.update(params.optionId, body);
  }
}

export class DeleteOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionIdSchema,
  };

  protected handle({ params }: IpcRequest<any, OptionId>): Promise<unknown> {
    return OptionQuery.delete(params.optionId);
  }
}
