import { useCallback } from "react";
import { useCreateWallet, useUpdateWallet, useDeleteWallet } from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  Wallet,
  WalletCreate,
  WalletUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";
import { CURRENCY_OPTIONS } from "@/packages/@core/data-access/db/options";

export type WalletFormConfig<T = Wallet> = BaseMutationConfig<T>;
export type WalletFormData = Wallet;

export function useCreateWalletForm(config?: BaseMutationConfig<Wallet>) {
  const mutation = useCreateWallet();
  const base = useFormBaseNotify<WalletCreate, WalletCreate, Wallet>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Portefeuille créé",
        description: "Le nouveau portefeuille a été enregistré.",
      },
      error: { title: "Erreur lors de la création du portefeuille." },
    }),
    adaptData: (data) => data,
  });
  return { ...base, currencyOptions: CURRENCY_OPTIONS };
}

export function useUpdateWalletForm(config?: BaseMutationConfig<Wallet>) {
  const mutation = useUpdateWallet();
  const base = useFormBaseNotify<
    QueryUpdatePayload<WalletUpdate>,
    { data: WalletUpdate; id: string },
    Wallet
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Portefeuille mis à jour",
        description: "Les informations du portefeuille ont été modifiées.",
      },
      error: { title: "Échec de la mise à jour du portefeuille." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });

  return { ...base, currencyOptions: CURRENCY_OPTIONS };
}

export function useDeleteWalletForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteWallet();

  const deleteWallet = useCallback(
    (walletId: string, walletName?: string) => {
      mutation.mutate(
        walletId,
        withNotifications({
          notifications: {
            success: {
              title: "Portefeuille supprimé",
              description: walletName
                ? `Le portefeuille "${walletName}" a été supprimé.`
                : "Le portefeuille a été supprimé.",
            },
          },
          onSuccess: () => {
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteWallet,
    onDelete: deleteWallet,
    isDeleting: mutation.isPending,
  };
}
