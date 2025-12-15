import { ClassroomQuery } from "@/packages/@core/data-access/data-queries";
import { HttpMethod, IpcRequest } from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { ClassroomRoutes } from "../routes-constant";

export class GetClassrooms extends AbstractEndpoint<any> {
  route = ClassroomRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return ClassroomQuery.getClassrooms(params);
  }
}

export class PostClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return ClassroomQuery.createClassroom(params);
  }
}

export class GetClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return ClassroomQuery.getClassroomById(params.ClassroomId);
  }
}

export class UpdateClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params, body }: IpcRequest<any, any>): Promise<unknown> {
    return ClassroomQuery.updateClassroom(params.classroomId, body);
  }
}

export class DeleteClassroom extends AbstractEndpoint<any> {
  route = ClassroomRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return ClassroomQuery.deleteClassroom(params.classroomId);
  }
}
