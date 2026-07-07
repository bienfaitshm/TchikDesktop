import z from "zod";
import { walletService } from "@/packages/@core/data-access/db/queries";
import {
  WalletSchema,
  WalletCreateSchema,
  WalletUpdateSchema,
  WalletFilter,
  WalletFilterSchema,
  createSearchOptionsSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";
import { WalletRoutes } from "../../routes-constant";

const WalletIdSchema = WalletSchema.pick({ walletId: true });
type WalletId = z.infer<typeof WalletIdSchema>;

export const searchWalletOptionsSchema =
  createSearchOptionsSchema(WalletFilterSchema);
export type SearchWalletOptionsParams = z.infer<
  typeof searchWalletOptionsSchema
>;

export class GetWallets extends AbstractEndpoint<any> {
  route = WalletRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: WalletFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, WalletFilter>): Promise<unknown> {
    return walletService.findMany(params);
  }
}

export class GetSearchWallets extends AbstractEndpoint<any> {
  route = WalletRoutes.SEARCH;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: searchWalletOptionsSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, SearchWalletOptionsParams>): Promise<unknown> {
    return walletService.fetchOptions(params);
  }
}

export class PostWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.ALL;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: WalletCreateSchema,
  };

  protected handle({
    body,
  }: IpcRequest<z.infer<typeof WalletCreateSchema>, any>): Promise<unknown> {
    return walletService.create(body);
  }
}

export class GetWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: WalletIdSchema,
  };

  protected handle({ params }: IpcRequest<any, WalletId>): Promise<unknown> {
    return walletService.findById(params.walletId);
  }
}

export class UpdateWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.DETAIL;
  method = HttpMethod.PUT;
  schemas: ValidationSchemas = {
    params: WalletIdSchema,
    body: WalletUpdateSchema,
  };

  protected handle({
    params,
    body,
  }: IpcRequest<
    z.infer<typeof WalletUpdateSchema>,
    WalletId
  >): Promise<unknown> {
    return walletService.update(params.walletId, body);
  }
}

export class DeleteWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: WalletIdSchema,
  };

  protected handle({ params }: IpcRequest<any, WalletId>): Promise<unknown> {
    return walletService.delete(params.walletId);
  }
}
