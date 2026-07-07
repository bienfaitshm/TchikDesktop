import z from "zod";
import { feeTypeService } from "@/packages/@core/data-access/db/queries";
import {
  FeeTypeSchema,
  FeeTypeCreateSchema,
  FeeTypeUpdateSchema,
  FeeTypeFilterSchema,
  type FeeTypeFilter,
  createSearchOptionsSchema,
  FeeTypeBulkCreateSchema,
  type FeeTypeBulkCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { FeeTypeRoutes } from "../../routes-constant";

const FeeTypeIdSchema = FeeTypeSchema.pick({ feeTypeId: true });
type FeeTypeId = z.infer<typeof FeeTypeIdSchema>;

export const searchFeeTypeOptionsSchema =
  createSearchOptionsSchema(FeeTypeFilterSchema);
export type SearchFeeTypeOptionsParams = z.infer<
  typeof searchFeeTypeOptionsSchema
>;

export class GetFeeTypes extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeTypeFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeTypeFilter>): Promise<unknown> {
    return feeTypeService.findMany(params);
  }
}

export class GetSearchFeeTypes extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.SEARCH;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: searchFeeTypeOptionsSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, SearchFeeTypeOptionsParams>): Promise<unknown> {
    return feeTypeService.findMany(params);
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
    return feeTypeService.create(body);
  }
}

export class BulkPostFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.BULK;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeTypeBulkCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<FeeTypeBulkCreate, any>): Promise<unknown> {
    return feeTypeService.bulkCreate(body.items.map((item) => item.value));
  }
}

export class GetFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeTypeIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeTypeId>): Promise<unknown> {
    return feeTypeService.findById(params.feeTypeId);
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
    return feeTypeService.update(params.feeTypeId, body);
  }
}

export class DeleteFeeType extends AbstractEndpoint<any> {
  route = FeeTypeRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: FeeTypeIdSchema,
  };

  protected handle({ params }: IpcRequest<any, FeeTypeId>): Promise<unknown> {
    return feeTypeService.delete(params.feeTypeId);
  }
}
