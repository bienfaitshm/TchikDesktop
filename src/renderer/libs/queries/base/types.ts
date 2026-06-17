import type { MutationKey, UseMutationResult } from "@tanstack/react-query";
import type { DefaultValues, FieldValues } from "react-hook-form";

export type QueryUpdate<TData> = { id: string; data: Partial<TData> };
export type QueryCreateParams<TData, TParams> = {
  params: TParams;
  data: TData;
};

export type FormSubmitHelpers<TFieldValues extends FieldValues> = {
  reset?: (values?: DefaultValues<TFieldValues>) => void;
};

export type FormSubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  helpers: FormSubmitHelpers<TFieldValues>,
) => void | Promise<void>;

export type BaseFormProps<TFieldValues extends FieldValues> = {
  formId?: string;
  initialValues?: DefaultValues<TFieldValues>;
  onSubmit?: FormSubmitHandler<TFieldValues>;
};

export type MutationResult<TData, TError, TVariables, TOnMutateResult> =
  UseMutationResult<TData, TError, TVariables, TOnMutateResult> & {
    mutationKey?: MutationKey;
  };

export type BaseMutationConfig<
  T extends Record<string, unknown> = {},
  TResult extends Record<string, unknown> = {},
> = T & {
  mutationKeys?: MutationKey;
  onSuccess?(dataResult: TResult): void;
};
