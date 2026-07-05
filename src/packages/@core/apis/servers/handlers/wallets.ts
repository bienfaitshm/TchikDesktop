import z from "zod";
import { walletRepository } from "@/packages/@core/data-access/db/queries";
import {
  WalletSchema,
  WalletCreateSchema,
  WalletUpdateSchema,
  WalletFilter,
  WalletFilterSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
} from "@/packages/electron-ipc-rest";
import { AbstractEndpoint } from "../abstract";
import { WalletRoutes } from "../../routes-constant";

const WalletIdSchema = WalletSchema.pick({ walletId: true });
type WalletId = z.infer<typeof WalletIdSchema>;

export class GetWallets extends AbstractEndpoint<any> {
  route = WalletRoutes.ALL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: WalletFilterSchema,
  };

  protected handle({
    params,
  }: IpcRequest<any, WalletFilter>): Promise<unknown> {
    return walletRepository.findMany(params);
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
    return walletRepository.create(body);
  }
}

export class GetWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.DETAIL;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: WalletIdSchema,
  };

  protected handle({ params }: IpcRequest<any, WalletId>): Promise<unknown> {
    return walletRepository.findById(params.walletId);
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
    return walletRepository.update(params.walletId, body);
  }
}

export class DeleteWallet extends AbstractEndpoint<any> {
  route = WalletRoutes.DETAIL;
  method = HttpMethod.DELETE;
  schemas: ValidationSchemas = {
    params: WalletIdSchema,
  };

  protected handle({ params }: IpcRequest<any, WalletId>): Promise<unknown> {
    return walletRepository.delete(params.walletId);
  }
}
