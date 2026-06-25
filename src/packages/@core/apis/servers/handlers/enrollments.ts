import z from "zod";
import {
  enrollmentService,
  enrollmentRepository,
} from "@/packages/@core/data-access/db/queries";
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
import { EnrollmentRoutes } from "../../routes-constant";

const EnrollementIdSchema = EnrollmentSchema.pick({
  enrollmentId: true,
});
type EnrollementId = z.infer<typeof EnrollementIdSchema>;
export class GetEnrollements extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: EnrollmentFilterSchema,
  };
  protected handle({
    params,
  }: IpcRequest<unknown, EnrollmentFilter>): Promise<unknown> {
    return enrollmentRepository.findMany(params);
  }
}

export class PostEnrollement extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: EnrollmentCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<EnrollmentCreate, unknown>): Promise<unknown> {
    return enrollmentRepository.create(body);
  }
}

export class PostQuickEnrollement extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.QUICK_ENROLLMENT;
  method = HttpMethod.POST;
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
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollementId>): Promise<unknown> {
    return enrollmentRepository.findById(params.enrollmentId);
  }
}

export class UpdateEnrollement extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
    body: EnrollmentUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<EnrollmentUpdate, EnrollementId>): Promise<unknown> {
    return enrollmentRepository.update(params.enrollmentId, body);
  }
}

export class DeleteEnrollement extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: EnrollementIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollementId>): Promise<unknown> {
    return enrollmentRepository.delete(params.enrollmentId);
  }
}
