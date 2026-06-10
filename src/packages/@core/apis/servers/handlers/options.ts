import z from "zod";
import { optionRepository } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  OptionFilterSchema,
  OptionCreateSchema,
  OptionUpdateSchema,
  OptionSchema,
  type OptionCreate,
  type OptionUpdate,
  type OptionFilter,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { OptionRoutes } from "../../routes-constant";

const OptionIdSchema = OptionSchema.pick({ optionId: true });

type OptionId = z.infer<typeof OptionIdSchema>;

export class GetOptions extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionFilterSchema,
  };

  protected handle({ params }: IpcRequest<any, OptionFilter>) {
    return optionRepository.findMany(params);
  }
}

export class PostOption extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: OptionCreateSchema,
  };

  protected handle({ body }: IpcRequest<OptionCreate, any>) {
    return optionRepository.create(body);
  }
}

export class GetOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionIdSchema,
  };

  protected handle({ params }: IpcRequest<any, OptionId>) {
    return optionRepository.findById(params.optionId);
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

  protected handle({ params, body }: IpcRequest<OptionUpdate, OptionId>) {
    return optionRepository.update(params.optionId, body);
  }
}

export class DeleteOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: OptionIdSchema,
  };

  protected handle({ params }: IpcRequest<any, OptionId>) {
    return optionRepository.delete(params.optionId);
  }
}
