import z from "zod";
import { feeTypeRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeTypeSchema,
  FeeTypeCreateSchema,
  FeeTypeUpdateSchema,
  FeeTypeFilterSchema,
  type FeeTypeFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { FeeTypeRoutes } from "../../routes-constant";

const FeeTypeIdSchema = FeeTypeSchema.pick({ feeTypeId: true });
type FeeTypeId = z.infer<typeof FeeTypeIdSchema>;

export class GetFeeTypes extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeTypeFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeTypeFilter>): Promise<unknown> {
    return feeTypeRepository.findMany(params);
  }
}

export class PostFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeTypeCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<z.infer<typeof FeeTypeCreateSchema>, any>): Promise<unknown> {
    return feeTypeRepository.create(body);
  }
}

export class GetFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeTypeIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeTypeId>): Promise<unknown> {
    return feeTypeRepository.findById(params.feeTypeId);
  }
}

export class UpdateFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: FeeTypeIdSchema,
    body: FeeTypeUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof FeeTypeUpdateSchema>,
    FeeTypeId
  >): Promise<unknown> {
    return feeTypeRepository.update(params.feeTypeId, body);
  }
}

export class DeleteFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: FeeTypeIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeTypeId>): Promise<unknown> {
    return feeTypeRepository.delete(params.feeTypeId);
  }
}
