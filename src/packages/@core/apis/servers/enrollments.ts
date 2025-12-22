import z from "zod";
import { EnrolementQuery } from "@/packages/@core/data-access/data-queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  EnrolementCreateSchema,
  EnrolementFilterSchema,
  EnrolementUpdateSchema,
  EnrolementQuickCreateSchema,
  EnrolementAttributesSchema,
  type TEnrolementUpdate,
  type TEnrolementCreate,
  type TEnrolementFilter,
  type TEnrolementQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "./abstract";
import { EnrollementRoutes } from "../routes-constant";

const EnrollementIdSchema = EnrolementAttributesSchema.pick({
  enrolementId: true,
});
type EnrollementId = z.infer<typeof EnrollementIdSchema>;
export class GetEnrollements extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrolementFilterSchema,
  };
  protected handle({
    params,
  }: IpcRequest<unknown, TEnrolementFilter>): Promise<unknown> {
    return EnrolementQuery.findMany(params);
  }
}

export class PostEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: EnrolementCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<TEnrolementCreate, unknown>): Promise<unknown> {
    return EnrolementQuery.create(body);
  }
}

export class PostQuickEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.QUICK_ENROLLEMENT;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: EnrolementQuickCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<TEnrolementQuickCreate, unknown>): Promise<unknown> {
    return EnrolementQuery.quickCreate(body);
  }
}

export class GetEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollementId>): Promise<unknown> {
    return EnrolementQuery.findById(params.enrolementId);
  }
}

export class UpdateEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.PUT;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
    body: EnrolementUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<TEnrolementUpdate, EnrollementId>): Promise<unknown> {
    return EnrolementQuery.update(params.enrolementId, body);
  }
}

export class DeleteEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.DELETE;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollementId>): Promise<unknown> {
    return EnrolementQuery.delete(params.enrolementId);
  }
}
