import type { MutationKey, UseMutationResult } from "@tanstack/react-query";
import type { DefaultValues, FieldValues, UseFormReset } from "react-hook-form";

export type QueryUpdatePayload<TData, TId = string> = {
  id: TId;
  data: Partial<TData>;
};

export type QueryCreatePayload<
  TData,
  TParams = undefined,
> = TParams extends undefined
  ? { data: TData }
  : { params: TParams; data: TData };

export interface FormSubmitHelpers<TFieldValues extends FieldValues> {
  reset: UseFormReset<TFieldValues>;
}

export type FormSubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  helpers: FormSubmitHelpers<TFieldValues>,
) => void | Promise<void>;

export interface BaseFormProps<TFieldValues extends FieldValues> {
  formId?: string;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: FormSubmitHandler<TFieldValues>;
}

export interface MutationMetadata {
  mutationKey?: MutationKey;
}

export type EnhancedMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationResult<TData, TError, TVariables, TContext> & MutationMetadata;

export interface BaseMutationConfig<TData = unknown> {
  mutationKey?: MutationKey;
  onSuccess?: (data: TData) => void | Promise<void>;
}
