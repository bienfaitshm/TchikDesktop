import { OptionQuery } from "@/packages/@core/data-access/data-queries";
import { HttpMethod, IpcRequest } from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "./abstract";
import { OptionRoutes } from "../routes-constant";

export class GetOptions extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return OptionQuery.getOptions(params);
  }
}

export class PostOption extends AbstractEndpoint<any> {
  route = OptionRoutes.ALL;
  method = HttpMethod.POST;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return OptionQuery.createOption(params);
  }
}

export class GetOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.GET;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return OptionQuery.getOptionById(params.optionId);
  }
}

export class UpdateOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.PUT;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params, body }: IpcRequest<any, any>): Promise<unknown> {
    return OptionQuery.updateOption(params.optionId, body);
  }
}

export class DeleteOption extends AbstractEndpoint<any> {
  route = OptionRoutes.DETAIL;
  method = HttpMethod.DELETE;
  validationErrorMessage?: string | undefined = undefined;
  schemas: any;

  protected handle({ params }: IpcRequest<any, any>): Promise<unknown> {
    return OptionQuery.deleteOption(params.optionId);
  }
}
