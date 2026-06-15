import z from "zod";
import {
  schoolRepository,
  studyYearRepository,
} from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  type ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import {
  SchoolSchema,
  StudyYearSchema,
  SchoolCreateSchema,
  SchoolUpdateSchema,
  SchoolFilterSchema,
  StudyYearCreateSchema,
  StudyYearUpdateSchema,
  StudyYearFilterSchema,
  type SchoolCreate,
  type SchoolUpdate,
  type SchoolFilter,
  type StudyYearCreate,
  type StudyYearUpdate,
  type StudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import { AbstractEndpoint } from "../abstract";
import { SchoolRoutes, StudyYearRoutes } from "../../routes-constant";

const SchoolIdSchema = SchoolSchema.pick({ schoolId: true });

type SchoolId = z.infer<typeof SchoolIdSchema>;

const YearIdSchema = StudyYearSchema.pick({ yearId: true });

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
  }: IpcRequest<any, SchoolFilter>): Promise<unknown> {
    return schoolRepository.findMany(params);
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
  }: IpcRequest<SchoolCreate, unknown>): Promise<unknown> {
    return schoolRepository.create(body);
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
    return schoolRepository.findById(params.schoolId);
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
  }: IpcRequest<SchoolUpdate, SchoolId>): Promise<unknown> {
    return schoolRepository.update(params.schoolId, body);
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
    return schoolRepository.delete(params.schoolId);
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
  }: IpcRequest<any, StudyYearFilter>): Promise<unknown> {
    return studyYearRepository.findMany(params);
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
  }: IpcRequest<StudyYearCreate, any>): Promise<unknown> {
    return studyYearRepository.create(body);
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
    return studyYearRepository.findById(params.yearId);
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
  }: IpcRequest<StudyYearUpdate, YearId>): Promise<unknown> {
    return studyYearRepository.update(params.yearId, body);
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
    return studyYearRepository.delete(params.yearId);
  }
}
