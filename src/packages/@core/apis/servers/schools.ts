import { SchoolQuery } from "@/packages/@core/data-access/data-queries";
import { HttpMethod, IpcRequest } from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { SchoolRoutes, StudyYearRoutes } from "../routes-constant";

export class GetSchools extends AbstractEndpoint<any> {
  route = SchoolRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.getSchools(params);
  }
}

export class PostSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.createSchool(params);
  }
}

export class GetSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.getSchoolById(params.schoolId);
  }
}

export class UpdateSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params, body }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.updateSchool(params.schoolId, body);
  }
}

export class DeleteSchool extends AbstractEndpoint<any> {
  route = SchoolRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.deleteSchool(params.schoolId);
  }
}

// study year

export class GetStudyYears extends AbstractEndpoint<any> {
  route = StudyYearRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.getStudyYears(params);
  }
}

export class PostStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.createStudyYear(params);
  }
}

export class GetStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.getStudyYearById(params.yearId);
  }
}

export class UpdateStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params, body }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.updateStudyYear(params.yearId, body);
  }
}

export class DeleteStudyYear extends AbstractEndpoint<any> {
  route = StudyYearRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.deleteStudyYear(params.yearId);
  }
}
