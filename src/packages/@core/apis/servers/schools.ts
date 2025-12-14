import { SchoolQuery } from "@/packages/@core/data-access/data-queries";
import { HttpMethod, IpcRequest } from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { SchoolRoutes } from "../routes-constant";

export class GetSchools extends AbstractEndpoint<any> {
  route = SchoolRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return SchoolQuery.getSchools(params);
  }
}

export class PostSchools extends AbstractEndpoint<any> {
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
