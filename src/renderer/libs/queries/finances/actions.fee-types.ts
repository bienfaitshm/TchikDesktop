import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import type {
  FeeType,
  FeeTypeCreate,
  FeeTypeBulkCreate,
  FeeTypeUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  BaseMutationConfig,
  QueryUpdatePayload,
  UseBaseParams,
} from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateFeeType,
  useBulkCreateFeeType,
  useUpdateFeeType,
  useDeleteFeeType,
  useGetWalletAsOptions,
} from "./finances";

type SchoolContext = Partial<Pick<FeeType, "schoolId">>;
export type FeeTypeFormConfig<T = FeeType> = SchoolContext &
  BaseMutationConfig<T>;
const CREATE_FEE_TYPE_NOTIFICATIONS = {
  success: {
    title: "Type de frais créé",
    description: "Le nouveau type de frais a été enregistré.",
  },
  error: { title: "Erreur lors de la création du type de frais." },
};

const BULK_CREATE_FEE_TYPE_NOTIFICATIONS = {
  success: {
    title: "Type de frais créés",
    description: "Le nouveau type de frais ont été enregistrés.",
  },
  error: { title: "Erreur lors de la création des types de frais." },
};

const UPDATE_FEE_TYPE_NOTIFICATIONS = {
  success: {
    title: "Type de frais mis à jour",
    description: "Le type de frais a été modifié avec succès.",
  },
  error: { title: "Échec de la mise à jour du type de frais." },
};

/**
 * Builds deletion notifications for fee types.
 * @param feeTypeName - Optional fee type name to include in the toast message.
 * @returns Notification object for fee type deletion.
 */
const getDeleteFeeTypeNotifications = (feeTypeName?: string) => ({
  success: {
    title: "Type de frais supprimé",
    description: feeTypeName
      ? `Le type de frais "${feeTypeName}" a été supprimé.`
      : "Le type de frais a été supprimé.",
  },
});

/**
 * Shared base hook fetching wallet select options and initializing mutation form state.
 * @template TFormData - The form input values structure.
 * @template TMutateInput - The variable structure expected by the mutation.
 * @template TReturnData - The response data type returned by the mutation.
 * @param params - Combined school context parameters and base mutation hook options.
 * @returns Form state, handlers, and wallet options array.
 */
const useBaseFeeType = <
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
>({
  schoolId,
  ...params
}: SchoolContext & UseBaseParams<TFormData, TMutateInput, TReturnData>) => {
  const { data: wallets = [] } = useGetWalletAsOptions({
    where: { wallets: { schoolId: { $eq: schoolId } } },
  });
  const form = useFormBaseNotify<TFormData, TMutateInput, TReturnData>(params);

  return { options: wallets, ...form };
};

/**
 * Form hook for creating a single fee type entity.
 * @param config - Optional configuration and school context parameters.
 * @returns Form state, handlers, and wallet selection options.
 */
export function useCreateFeeTypeForm(config?: FeeTypeFormConfig) {
  const mutation = useCreateFeeType();

  const adaptData = useCallback((data: FeeTypeCreate) => data, []);

  return useBaseFeeType<FeeTypeCreate, FeeTypeCreate, FeeType>({
    schoolId: config?.schoolId,
    mutation,
    config,
    getNotifications: () => CREATE_FEE_TYPE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for bulk creating fee type entities.
 * @param config - Optional configuration and school context parameters.
 * @returns Form state, handlers, and wallet selection options.
 */
export function useBulkCreateFeeTypeForm(
  config?: FeeTypeFormConfig<FeeType[]>,
) {
  const mutation = useBulkCreateFeeType();

  const adaptData = useCallback((data: FeeTypeBulkCreate) => data, []);

  return useBaseFeeType<FeeTypeBulkCreate, FeeTypeBulkCreate, FeeType[]>({
    mutation,
    config,
    schoolId: config?.schoolId,
    getNotifications: () => BULK_CREATE_FEE_TYPE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for updating an existing fee type entity.
 * @param config - Optional configuration and school context parameters.
 * @returns Form state, handlers, and wallet selection options.
 */
export function useUpdateFeeTypeForm(
  config?: FeeTypeFormConfig<FeeTypeUpdate>,
) {
  const mutation = useUpdateFeeType();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<FeeTypeUpdate>) => ({ data, id }),
    [],
  );

  return useBaseFeeType<
    QueryUpdatePayload<FeeTypeUpdate>,
    { data: FeeTypeUpdate; id: string },
    FeeTypeUpdate
  >({
    mutation,
    config,
    schoolId: config?.schoolId,
    getNotifications: () => UPDATE_FEE_TYPE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing fee type deletion operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing deletion callback and pending state.
 */
export function useDeleteFeeTypeForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteFeeType();

  const deleteFeeType = useCallback(
    (feeTypeId: string, feeTypeName?: string) => {
      mutation.mutate(
        feeTypeId,
        withNotifications({
          notifications: getDeleteFeeTypeNotifications(feeTypeName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteFeeType,
    isDeleting: mutation.isPending,
    onDelete: deleteFeeType,
  };
}
