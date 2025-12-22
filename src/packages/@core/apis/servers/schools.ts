import z from "zod";
import {
  SchoolQuery,
  StudyYearQuery,
} from "@/packages/@core/data-access/data-queries";
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
    return SchoolQuery.findMany(params);
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
    return SchoolQuery.create(body);
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
    return SchoolQuery.findById(params.schoolId);
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
    return SchoolQuery.update(params.schoolId, body);
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
    return SchoolQuery.delete(params.schoolId);
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
    return StudyYearQuery.findMany(params);
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
    return StudyYearQuery.create(body);
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
    return StudyYearQuery.findById(params.yearId);
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
    return StudyYearQuery.update(params.yearId, body);
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
    return StudyYearQuery.delete(params.yearId);
  }
}
