import z from "zod";
import { classroomRepository } from "@/packages/@core/data-access/db/queries";
import {
  ClassroomSchema,
  ClassroomCreateSchema,
  ClassroomUpdateSchema,
  ClassroomFilterSchema,
  ClassroomFilter,
  ClassroomCreate,
  ClassroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { ClassroomRoutes } from "../../routes-constant";

const ClassIdSchema = ClassroomSchema.pick({ classId: true });

type ClassId = z.infer<typeof ClassIdSchema>;

export class GetClassrooms extends AbstractEndpoint<any> {
  route = ClassroomRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: ClassroomFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, ClassroomFilter>): Promise<unknown> {
    return classroomRepository.findMany(params);
  }
}

export class GetClassroomsWithEnrollments extends AbstractEndpoint<any> {
  route = ClassroomRoutes.ALL_ENROLLMENT;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: ClassroomFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, ClassroomFilter>): Promise<unknown> {
    return classroomRepository.findClassroomsWithStudents({
      classroomOptions: params,
    });
  }
}

export class PostClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: ClassroomCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<ClassroomCreate, any>): Promise<unknown> {
    return classroomRepository.create(body);
  }
}

export class GetClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: ClassIdSchema,
  };
  protected handle({ params }: IpcRequest<any, ClassId>): Promise<unknown> {
    return classroomRepository.findById(params.classId);
  }
}

export class UpdateClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: ClassIdSchema,
    body: ClassroomUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<ClassroomUpdate, ClassId>): Promise<unknown> {
    return classroomRepository.update(params.classId, body);
  }
}

export class DeleteClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: ClassIdSchema,
  };

  protected handle({ params }: IpcRequest<any, ClassId>): Promise<unknown> {
    return classroomRepository.delete(params.classId);
  }
}
