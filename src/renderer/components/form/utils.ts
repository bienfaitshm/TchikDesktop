import { useImperativeHandle, useRef } from "react";
import type { ErrorOption, UseFormReturn } from "react-hook-form";

export interface FormRef {
  setError(
    name: any,
    error: ErrorOption,
    options?: { shouldFocus: boolean }
  ): void;
  setValue(name: any, value: any): void;
  reset(): void;
}

export function useFormRef<T extends FormRef>(initialValue: T | null = null) {
  return useRef(initialValue);
}

export function useImperativeHandleForm<S extends {}>(
  ref: React.ForwardedRef<FormRef>,
  form: UseFormReturn<S, any, S>
) {
  useImperativeHandle(
    ref,
    () => ({
      reset() {
        form.reset();
      },
      setError(name, error, options) {
        form.setError(name, error, options);
      },
      setValue(key: any, value) {
        form.setValue(key, value);
      },
    }),
    [form]
  );
}

export function mergeDefaultValue<T extends {}>(
  ...args: Partial<T>[]
): Partial<T> {
  return args.reduce((prev, current) => ({ ...prev, ...current }), {} as T);
}
