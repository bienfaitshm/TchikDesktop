import z from "zod";
import { feeConfigurationRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeConfigurationBase,
  FeeConfigurationCreateSchema,
  FeeConfigurationFilter,
  FeeConfigurationFilterSchema,
  FeeConfigurationUpdateSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { FeeConfigurationRoutes } from "../../routes-constant";

const FeeConfigIdSchema = FeeConfigurationBase.pick({ feeConfigId: true });
type FeeConfigId = z.infer<typeof FeeConfigIdSchema>;

export class GetFeeConfigurations extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeConfigurationFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeConfigurationFilter>): Promise<unknown> {
    return feeConfigurationRepository.findMany(params);
  }
}

export class PostFeeConfiguration extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeConfigurationCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<
    z.infer<typeof FeeConfigurationCreateSchema>,
    any
  >): Promise<unknown> {
    return feeConfigurationRepository.create(body);
  }
}

export class GetFeeConfiguration extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeConfigIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeConfigId>): Promise<unknown> {
    return feeConfigurationRepository.findById(params.feeConfigId);
  }
}

export class UpdateFeeConfiguration extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: FeeConfigIdSchema,
    body: FeeConfigurationUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof FeeConfigurationUpdateSchema>,
    FeeConfigId
  >): Promise<unknown> {
    return feeConfigurationRepository.update(params.feeConfigId, body);
  }
}

export class DeleteFeeConfiguration extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: FeeConfigIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeConfigId>): Promise<unknown> {
    return feeConfigurationRepository.delete(params.feeConfigId);
  }
}
