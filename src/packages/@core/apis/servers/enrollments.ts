import { EnrolementQuery } from "@/packages/@core/data-access/data-queries";
import { HttpMethod, IpcRequest } from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { EnrollementRoutes } from "../routes-constant";

export class GetEnrollements extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.getEnrolements(params);
  }
}

export class GetEnrollementHistories extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL_HISTORIES;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.getEnrolementHistory(params);
  }
}

export class PostEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.ALL;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.createEnrolement(params);
  }
}

export class PostQuickEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.QUICK_ENROLLEMENT;
  method = HttpMethod.POST;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.createQuickEnrolement(params.EnrollementId);
  }
}

export class GetEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.GET;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.getEnrolementById(params.enrollementId);
  }
}

export class UpdateEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.PUT;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params, body }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.updateEnrolement(params.EnrollementId, body);
  }
}

export class DeleteEnrollement extends AbstractEndpoint<any> {
  route = EnrollementRoutes.DETAIL;
  method = HttpMethod.DELETE;
  //   validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return EnrolementQuery.deleteEnrolement(params.EnrollementId);
  }
}
