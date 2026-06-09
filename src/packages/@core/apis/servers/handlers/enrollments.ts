import z from "zod";
import { enrollmentService } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  EnrollmentCreateSchema,
  EnrollmentFilterSchema,
  EnrollmentUpdateSchema,
  EnrollmentQuickCreateSchema,
  EnrollmentSchema,
  type EnrollmentUpdate,
  type EnrollmentCreate,
  type EnrollmentFilter,
  type EnrollmentQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { EnrollementRoutes } from "../../routes-constant";

const EnrollementIdSchema = EnrollmentSchema.pick({
  enrollmentId: true,
});
type EnrollementId = z.infer<typeof EnrollementIdSchema>;
export class GetEnrollements extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrollmentFilterSchema,
  };
  protected handle({
    params,
  }: IpcRequest<unknown, EnrollmentFilter>): Promise<unknown> {
    return enrollmentService.findMany(params);
  }
}

export class PostEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: EnrollmentCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<EnrollmentCreate, unknown>): Promise<unknown> {
    return enrollmentService.create(body);
  }
}

export class PostQuickEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.QUICK_ENROLLEMENT;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: EnrollmentQuickCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<EnrollmentQuickCreate, unknown>): Promise<unknown> {
    return enrollmentService.quickCreate(body);
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
    return enrollmentService.findById(params.enrollmentId);
  }
}

export class UpdateEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.PUT;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
    body: EnrollmentUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<EnrollmentUpdate, EnrollementId>): Promise<unknown> {
    return enrollmentService.update(params.enrollmentId, body);
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
    return enrollmentService.delete(params.enrollmentId);
  }
}
