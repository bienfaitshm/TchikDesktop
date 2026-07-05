import z from "zod";
import { dailyExchangeRateRepository } from "@/packages/@core/data-access/db/queries";
import {
  DailyExchangeRateSchema,
  DailyExchangeRateCreateSchema,
  DailyExchangeRateUpdateSchema,
  DailyExchangeRateFilterSchema,
  DailyExchangeRateFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { DailyExchangeRateRoutes } from "../../routes-constant";

const RateIdSchema = DailyExchangeRateSchema.pick({ rateId: true });
type RateId = z.infer<typeof RateIdSchema>;

export class GetDailyExchangeRates extends AbstractEndpoint<any> {
  route = DailyExchangeRateRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: DailyExchangeRateFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, DailyExchangeRateFilter>): Promise<unknown> {
    return dailyExchangeRateRepository.findMany(params);
  }
}

export class PostDailyExchangeRate extends AbstractEndpoint<any> {
  route = DailyExchangeRateRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: DailyExchangeRateCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<
    z.infer<typeof DailyExchangeRateCreateSchema>,
    any
  >): Promise<unknown> {
    return dailyExchangeRateRepository.create(body);
  }
}

export class GetDailyExchangeRate extends AbstractEndpoint<any> {
  route = DailyExchangeRateRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: RateIdSchema,
  };

  protected handle({ params }: IpcRequest<any, RateId>): Promise<unknown> {
    return dailyExchangeRateRepository.findById(params.rateId);
  }
}

export class UpdateDailyExchangeRate extends AbstractEndpoint<any> {
  route = DailyExchangeRateRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: RateIdSchema,
    body: DailyExchangeRateUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof DailyExchangeRateUpdateSchema>,
    RateId
  >): Promise<unknown> {
    return dailyExchangeRateRepository.update(params.rateId, body);
  }
}

export class DeleteDailyExchangeRate extends AbstractEndpoint<any> {
  route = DailyExchangeRateRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: RateIdSchema,
  };

  protected handle({ params }: IpcRequest<any, RateId>): Promise<unknown> {
    return dailyExchangeRateRepository.delete(params.rateId);
  }
}
