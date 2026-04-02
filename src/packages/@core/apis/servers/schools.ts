import z from "zod";
import {
  schoolService,
  studyYearService,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  type ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  SchoolAttributesSchema,
  StudyYearAttributesSchema,
  SchoolCreateSchema,
  SchoolUpdateSchema,
  SchoolFilterSchema,
  StudyYearCreateSchema,
  StudyYearUpdateSchema,
  StudyYearFilterSchema,
  type TSchoolCreate,
  type TSchoolUpdate,
  type TSchoolFilter,
  type TStudyYearCreate,
  type TStudyYearUpdate,
  type TStudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "./abstract";
import { SchoolRoutes, StudyYearRoutes } from "../routes-constant";

const SchoolIdSchema = SchoolAttributesSchema.pick({ schoolId: true });

type SchoolId = z.infer<typeof SchoolIdSchema>;

const YearIdSchema = StudyYearAttributesSchema.pick({ yearId: true });

type YearId = z.infer<typeof YearIdSchema>;

export class GetSchools extends AbstractEndpoint<any> {
  route = SchoolRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: SchoolFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TSchoolFilter>): Promise<unknown> {
    return schoolService.findMany(params);
  }
}

export class PostSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: SchoolCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<TSchoolCreate, unknown>): Promise<unknown> {
    return schoolService.create(body);
  }
}

export class GetSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: SchoolIdSchema,
  };

  protected handle({ params }: IpcRequest<any, SchoolId>): Promise<unknown> {
    return schoolService.findById(params.schoolId);
  }
}

export class UpdateSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: SchoolIdSchema,
    body: SchoolUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<TSchoolUpdate, SchoolId>): Promise<unknown> {
    return schoolService.update(params.schoolId, body);
  }
}

export class DeleteSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: SchoolIdSchema,
  };

  protected handle({ params }: IpcRequest<any, SchoolId>): Promise<unknown> {
    return schoolService.delete(params.schoolId);
  }
}

// study year

export class GetStudyYears extends AbstractEndpoint<any> {
  route = StudyYearRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: StudyYearFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, TStudyYearFilter>): Promise<unknown> {
    return studyYearService.findMany(params);
  }
}

export class PostStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: StudyYearCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<TStudyYearCreate, any>): Promise<unknown> {
    return studyYearService.create(body);
  }
}

export class GetStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: YearIdSchema,
  };

  protected handle({ params }: IpcRequest<any, YearId>): Promise<unknown> {
    return studyYearService.findById(params.yearId);
  }
}

export class UpdateStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    body: StudyYearUpdateSchema,
    params: YearIdSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<TStudyYearUpdate, YearId>): Promise<unknown> {
    return studyYearService.update(params.yearId, body);
  }
}

export class DeleteStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {
    params: YearIdSchema,
  };

  protected handle({ params }: IpcRequest<any, YearId>): Promise<unknown> {
    return studyYearService.delete(params.yearId);
  }
}
