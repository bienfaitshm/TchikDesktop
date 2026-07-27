import type { MutationKey, UseMutationResult } from "@tanstack/react-query";
import type { DefaultValues, FieldValues, UseFormReset } from "react-hook-form";

/**
 * Defines a basic select option pair.
 */
export type Option = {
  value: string;
  label: string;
};

/**
 * Represents the payload structure for updating an entity.
 * @template TData - The entity data type.
 * @template TId - The entity identifier type (defaults to string).
 */
export type QueryUpdatePayload<TData, TId = string> = {
  id: TId;
  data: Partial<TData>;
};

/**
 * Represents the payload structure for creating an entity with optional parameters.
 * @template TData - The entity data type to create.
 * @template TParams - Optional additional contextual parameters.
 */
export type QueryCreatePayload<
  TData,
  TParams = undefined,
> = TParams extends undefined
  ? { data: TData }
  : { params: TParams; data: TData };

/**
 * Utility functions provided to form submission handlers.
 * @template TFieldValues - The shape of the form field values.
 */
export interface FormSubmitHelpers<TFieldValues extends FieldValues> {
  reset: UseFormReset<TFieldValues>;
}

/**
 * Function contract for form submit handlers.
 * @template TFieldValues - The shape of the form field values.
 */
export type FormSubmitHandler<
  TFieldValues extends FieldValues,
  DataReturn extends FieldValues,
> = (
  data: TFieldValues,
  helpers: FormSubmitHelpers<DataReturn>,
) => void | Promise<void>;

/**
 * Standard properties for form components.
 * @template TFieldValues - The shape of the form field values.
 */
export interface BaseFormProps<
  TFieldValues extends FieldValues,
  DataReturn extends FieldValues = {},
> {
  formId?: string;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: FormSubmitHandler<TFieldValues, DataReturn>;
}

/**
 * Metadata associated with mutation hooks.
 */
export interface MutationMetadata {
  mutationKey?: MutationKey;
}

/**
 * React Query mutation result enriched with additional metadata.
 * @template TData - The expected response data type.
 * @template TError - The error type.
 * @template TVariables - The input variables type.
 * @template TContext - The mutation context type.
 */
export type EnhancedMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationResult<TData, TError, TVariables, TContext> & MutationMetadata;

/**
 * Base configuration options for mutation hooks.
 * @template TData - The data type returned on success.
 */
export interface BaseMutationConfig<TData = unknown> {
  mutationKey?: MutationKey;
  onSuccess?: (data: TData) => void | Promise<void>;
}

/**
 * Represents the search state and controls for dynamic option queries.
 * @template T - The option type extending base Option.
 */
export interface SearchOptionsResult<T extends Option = Option> {
  searchQuery: string;
  options: T[];
  isSearching: boolean;
  setSearchQuery: (value: string) => void;
}
