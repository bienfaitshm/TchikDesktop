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
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { FeeConfigurationRoutes } from "../../routes-constant";

const FeeConfigIdSchema = FeeConfigurationBase.pick({ feeConfigId: true });
type FeeConfigId = z.infer<typeof FeeConfigIdSchema>;

export const FeeApplicableConfigurationSchema = FeeConfigurationBase.pick({
  optionId: true,
  section: true,
  schoolId: true,
  yearId: true,
})
  .required({ schoolId: true, yearId: true })
  .merge(
    z.object({
      classroomId: z.string().nonempty(),
    }),
  );

export type FeeApplicableConfiguration = z.infer<
  typeof FeeApplicableConfigurationSchema
>;

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

export class GetApplicableFeeConfiguration extends AbstractEndpoint<any> {
  route = FeeConfigurationRoutes.APPLICABLE;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeApplicableConfigurationSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeApplicableConfiguration>): Promise<unknown> {
    return feeConfigurationRepository.findApplicableConfigurations(params);
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
