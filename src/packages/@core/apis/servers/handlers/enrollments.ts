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
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { EnrollmentRoutes } from "../../routes-constant";

const EnrollmentIdSchema = EnrollmentSchema.pick({
  enrollmentId: true,
});

export const SearchEnrollmentSchema = createSearchOptionsSchema(
  EnrollmentFilterSchema,
);
export type SearchEnrollmentParams = z.infer<typeof SearchEnrollmentSchema>;

type EnrollmentId = z.infer<typeof EnrollmentIdSchema>;
export class GetEnrollments extends AbstractEndpoint<any> {
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

export class GetSearchEnrollments extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.SEARCH;
  method = HttpMethod.GET;
  validationErrorMessage? = undefined;
  schemas: ValidationSchemas = {
    params: SearchEnrollmentSchema,
  };

  protected handle({ params }: IpcRequest<unknown, SearchEnrollmentParams>) {
    return enrollmentRepository.findForSelect(params);
  }
}

export class PostEnrollment extends AbstractEndpoint<any> {
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

export class PostQuickEnrollment extends AbstractEndpoint<any> {
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

export class GetEnrollment extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: EnrollmentIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollmentId>): Promise<unknown> {
    return enrollmentRepository.findById(params.enrollmentId);
  }
}

export class UpdateEnrollment extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: EnrollmentIdSchema,
    body: EnrollmentUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<EnrollmentUpdate, EnrollmentId>): Promise<unknown> {
    return enrollmentRepository.update(params.enrollmentId, body);
  }
}

export class DeleteEnrollment extends AbstractEndpoint<any> {
  route = EnrollmentRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: EnrollmentIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<unknown, EnrollmentId>): Promise<unknown> {
    return enrollmentRepository.delete(params.enrollmentId);
  }
}
