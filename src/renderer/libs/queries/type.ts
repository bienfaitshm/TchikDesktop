import type { DefaultValues, FieldValues } from "react-hook-form";

export type TQueryUpdate<TData> = { id: string; data: Partial<TData> };
export type TQueryCreateParams<TData, TParams> = {
  params: TParams;
  data: TData;
};

export type FormSubmitHelpers<TFieldValues extends FieldValues> = {
  reset: (values?: DefaultValues<TFieldValues>) => void;
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
