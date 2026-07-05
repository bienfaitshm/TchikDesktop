import { useMutation, useSuspenseQuery } from "../base";
import { wallet as walletApi } from "@/renderer/libs/apis";
import type {
  Wallet,
  WalletCreate,
  WalletFilter,
  WalletUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

export const walletKeys = {
  all: ["wallets"] as const,
  lists: (params?: WalletFilter) =>
    [...walletKeys.all, "list", { params }] as const,
  options: (params?: WalletFilter) =>
    [...walletKeys.all, "options", { params }] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
  mutations: {
    create: () => [...walletKeys.all, "create"] as const,
    update: () => [...walletKeys.all, "update"] as const,
    delete: () => [...walletKeys.all, "delete"] as const,
  },
} as const;

export function useGetWallets(
  params?: WalletFilter,
  options?: Partial<UseSuspenseQueryOptions<Wallet[]>>,
) {
  return useSuspenseQuery({
    queryKey: walletKeys.lists(params),
    queryFn: () => walletApi.fetchWallets(params),
    ...options,
  });
}

export function useGetWalletAsOptions(
  params?: WalletFilter,
  options?: Partial<UseSuspenseQueryOptions<(SelectOption & Wallet)[]>>,
) {
  return useSuspenseQuery({
    queryKey: walletKeys.options(params),
    queryFn: () => walletApi.fetchWalletsAsOptions(params),
    ...options,
  });
}

export function useGetWalletById(
  walletId: string,
  options?: Partial<UseSuspenseQueryOptions<Wallet>>,
) {
  return useSuspenseQuery({
    queryKey: walletKeys.detail(walletId),
    queryFn: () => walletApi.fetchWalletById(walletId),
    ...options,
  });
}

export function useCreateWallet(
  options?: Partial<UseMutationOptions<Wallet, Error, WalletCreate>>,
) {
  return useMutation({
    mutationKey: walletKeys.mutations.create(),
    mutationFn: (data) => walletApi.createWallet(data),
    ...options,
  });
}

export function useUpdateWallet(
  options?: Partial<
    UseMutationOptions<Wallet, Error, TQueryUpdate<WalletUpdate>>
  >,
) {
  return useMutation({
    mutationKey: walletKeys.mutations.update(),
    mutationFn: ({ data, id }) => walletApi.updateWallet(id, data),
    ...options,
  });
}

export function useDeleteWallet(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: walletKeys.mutations.delete(),
    mutationFn: (walletId: string) => walletApi.deleteWallet(walletId),
    ...options,
  });
}
