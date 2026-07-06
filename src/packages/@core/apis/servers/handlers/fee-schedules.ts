import z from "zod";
import { feeScheduleRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeScheduleSchema,
  FeeScheduleCreateSchema,
  FeeScheduleUpdateSchema,
  FeeScheduleFilterSchema,
  type FeeScheduleFilter,
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

/* =========================================================================
   1. GET ALL SCHEDULES (WITH FILTERS)
   ========================================================================= */
export class GetFeeSchedules extends AbstractEndpoint<any> {
  route = FeeScheduleRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeScheduleFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeScheduleFilter>): Promise<unknown> {
    return feeScheduleRepository.findMany(params);
  }
}

/* =========================================================================
   2. POST / CREATE SCHEDULE
   ========================================================================= */
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
    return feeScheduleRepository.create(body);
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
    return feeScheduleRepository.findById(params.scheduleId);
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
    return feeScheduleRepository.update(params.scheduleId, body);
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
    return feeScheduleRepository.delete(params.scheduleId);
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
    return feeScheduleRepository.findByFeeType(params.feeTypeId);
  }
}
