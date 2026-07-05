import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  WalletCreate,
  WalletUpdate,
  WalletFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { Wallet } from "@/packages/@core/data-access/db/schemas";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import { WalletRoutes } from "../routes-constant";

export type WalletApi = Readonly<{
  fetchWallets(params?: WalletFilter): Promise<Wallet[]>;
  fetchWalletsAsOptions(
    params?: WalletFilter,
  ): Promise<(SelectOption & Wallet)[]>;
  fetchWalletById(walletId: string): Promise<Wallet>;
  createWallet(data: WalletCreate): Promise<Wallet>;
  updateWallet(walletId: string, data: WalletUpdate): Promise<Wallet>;
  deleteWallet(walletId: string): Promise<void>;
}>;

export function createWalletApis(ipcClient: IpcClient): WalletApi {
  return {
    fetchWallets(params) {
      return ipcClient.get(WalletRoutes.ALL, { params });
    },
    fetchWalletsAsOptions(params) {
      return ipcClient.get(WalletRoutes.SEARCH, { params });
    },
    fetchWalletById(walletId) {
      return ipcClient.get(WalletRoutes.DETAIL, {
        params: { walletId },
      });
    },
    createWallet(data) {
      return ipcClient.post(WalletRoutes.ALL, data);
    },
    updateWallet(walletId, data) {
      return ipcClient.put(WalletRoutes.DETAIL, data, {
        params: { walletId },
      });
    },
    deleteWallet(walletId) {
      return ipcClient.delete(WalletRoutes.DETAIL, {
        params: { walletId },
      });
    },
  };
}
