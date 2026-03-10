import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/@core/apis/servers/abstract";
import { AppInfosRoutes } from "@/packages/@core/apis/routes-constant";
import { getSystemInformation, type SystemInformation } from "./sys-info";

export class GetSystemInfos extends AbstractEndpoint<any> {
  route = AppInfosRoutes.SYS_INFOS;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: ValidationSchemas = {};

  protected async handle({}: IpcRequest<any, any>): Promise<SystemInformation> {
    return await getSystemInformation();
  }
}
