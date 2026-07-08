import z from "zod";
import { feeScheduleService } from "@/packages/@core/data-access/db/queries";
import {
  FeeScheduleSchema,
  FeeScheduleCreateSchema,
  FeeScheduleUpdateSchema,
  FeeScheduleFilterSchema,
  type FeeScheduleFilter,
  createSearchOptionsSchema,
  type FeeScheduleBulkCreate,
  FeeScheduleBulkCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { FeeScheduleRoutes } from "../../routes-constant";

const FeeScheduleIdSchema = FeeScheduleSchema.pick({ scheduleId: true });
type FeeScheduleId = z.infer<typeof FeeScheduleIdSchema>;

const FeeTypeIdFilterSchema = FeeScheduleSchema.pick({ feeTypeId: true });
type FeeTypeIdFilter = z.infer<typeof FeeTypeIdFilterSchema>;

export const searchFeeScheduleOptionsSchema = createSearchOptionsSchema(
  FeeScheduleFilterSchema,
);
export type SearchWalletOptionsParams = z.infer<
  typeof searchFeeScheduleOptionsSchema
>;

export class GetFeeSchedules extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeScheduleFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeScheduleFilter>): Promise<unknown> {
    return feeScheduleService.findMany(params);
  }
}

export class GetSearchFeeSchedules extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.SEARCH;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: searchFeeScheduleOptionsSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, SearchWalletOptionsParams>): Promise<unknown> {
    return feeScheduleService.getOptions(params);
  }
}

export class PostFeeSchedule extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeScheduleCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<
    z.infer<typeof FeeScheduleCreateSchema>,
    any
  >): Promise<unknown> {
    return feeScheduleService.create(body);
  }
}

export class BulkPostFeeSchedule extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.BULK;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeScheduleBulkCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<FeeScheduleBulkCreate, any>): Promise<unknown> {
    return feeScheduleService.bulkCreate(body.items.map((item) => item.value));
  }
}

/* =========================================================================
   3. GET SINGLE SCHEDULE DETAIL
   ========================================================================= */
export class GetFeeSchedule extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeScheduleIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeScheduleId>): Promise<unknown> {
    return feeScheduleService.findById(params.scheduleId);
  }
}

/* =========================================================================
   4. PUT / UPDATE SCHEDULE
   ========================================================================= */
export class UpdateFeeSchedule extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: FeeScheduleIdSchema,
    body: FeeScheduleUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof FeeScheduleUpdateSchema>,
    FeeScheduleId
  >): Promise<unknown> {
    return feeScheduleService.update(params.scheduleId, body);
  }
}

/* =========================================================================
   5. DELETE SCHEDULE
   ========================================================================= */
export class DeleteFeeSchedule extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: FeeScheduleIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeScheduleId>): Promise<unknown> {
    return feeScheduleService.delete(params.scheduleId);
  }
}

/* =========================================================================
   6. GET SCHEDULES BY FEE TYPE (Route custom optimisée)
   ========================================================================= */
export class GetFeeSchedulesByFeeType extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.BY_FEE_TYPE;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeTypeIdFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeTypeIdFilter>): Promise<unknown> {
    return feeScheduleService.findByFeeType(params.feeTypeId);
  }
}
