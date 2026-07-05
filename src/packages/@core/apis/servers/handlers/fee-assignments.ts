import z from "zod";
import { feeAssignmentRepository } from "@/packages/@core/data-access/db/queries";
import {
  FeeAssignmentSchema,
  FeeAssignmentCreateSchema,
  FeeAssignmentUpdateSchema,
  FeeAssignmentFilterSchema,
  FeeAssignmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { FeeAssignmentRoutes } from "../../routes-constant";

const AssignmentIdSchema = FeeAssignmentSchema.pick({ assignmentId: true });
type AssignmentId = z.infer<typeof AssignmentIdSchema>;

export class GetFeeAssignments extends AbstractEndpoint<any> {
  route = FeeAssignmentRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: FeeAssignmentFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, FeeAssignmentFilter>): Promise<unknown> {
    return feeAssignmentRepository.findMany(params);
  }
}

export class PostFeeAssignment extends AbstractEndpoint<any> {
  route = FeeAssignmentRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: FeeAssignmentCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<
    z.infer<typeof FeeAssignmentCreateSchema>,
    any
  >): Promise<unknown> {
    return feeAssignmentRepository.create(body);
  }
}

export class GetFeeAssignment extends AbstractEndpoint<any> {
  route = FeeAssignmentRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: AssignmentIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, AssignmentId>): Promise<unknown> {
    return feeAssignmentRepository.findById(params.assignmentId);
  }
}

export class UpdateFeeAssignment extends AbstractEndpoint<any> {
  route = FeeAssignmentRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: AssignmentIdSchema,
    body: FeeAssignmentUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof FeeAssignmentUpdateSchema>,
    AssignmentId
  >): Promise<unknown> {
    return feeAssignmentRepository.update(params.assignmentId, body);
  }
}

export class DeleteFeeAssignment extends AbstractEndpoint<any> {
  route = FeeAssignmentRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: AssignmentIdSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, AssignmentId>): Promise<unknown> {
    return feeAssignmentRepository.delete(params.assignmentId);
  }
}
