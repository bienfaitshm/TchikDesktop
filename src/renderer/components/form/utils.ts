import React, { useImperativeHandle, useRef } from "react";
import type {
  UseFormReturn,
  FieldValues,
  FieldPath,
  ErrorOption,
} from "react-hook-form";

/**
 * @interface ImperativeFormHandle
 * @template TFieldValues - A type extending `FieldValues` (typically the schema type of your form).
 * @description Defines the methods exposed by an imperative form handle, allowing a parent component
 * to programmatically interact with a child form.
 * @property {(name: FieldPath<TFieldValues>, error: ErrorOption, options?: { shouldFocus: boolean }) => void} setError -
 * Imperatively sets an error for a specific form field.
 * @property {<TFieldName extends FieldPath<TFieldValues>>(name: TFieldName, value: TFieldValues[TFieldName], options?: SetValueOptions) => void} setValue -
 * Imperatively sets the value of a specific form field. Includes options for dirty state, validation, etc.
 * @property {(values?: ResetOptions<TFieldValues>) => void} reset -
 * Resets the form to its default values or to a specified set of values.
 */
export interface ImperativeFormHandle<TFieldValues extends FieldValues> {
  setError(
    name: FieldPath<TFieldValues>,
    error: ErrorOption,
    options?: { shouldFocus: boolean }
  ): void;
  setValue<TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
    value: TFieldValues[TFieldName],
    options?: any
  ): void;
  reset(values?: any): void;
}

/**
 * @function useFormHandleRef
 * @template TFieldValues - A type extending `FieldValues` (the schema type of the form).
 * @description A utility hook to create a React ref for `ImperativeFormHandle`.
 * This ref can then be passed to a child form component via `React.forwardRef` to
 * enable imperative interactions.
 * @param {ImperativeFormHandle<TFieldValues> | null} [initialValue=null] - The initial value for the ref.
 * Defaults to `null`.
 * @returns {React.MutableRefObject<ImperativeFormHandle<TFieldValues> | null>}
 * A mutable ref object that can hold an `ImperativeFormHandle` instance.
 *
 * @example
 * ```typescript
 * import React from 'react';
 * import { useFormHandleRef } from './path/to/this/file'; // Your utility file
 * import { StudyYearForm, StudyYearFormData, StudyYearFormHandle } from './StudyYearForm'; // Your form component
 * import { Button } from '@/renderer/components/ui/button';
 * import { toast } from 'sonner';
 *
 * function ParentComponent() {
 * const studyYearFormRef = useFormHandleRef<StudyYearFormData>();
 *
 * const handleSubmit = (data: StudyYearFormData) => {
 * console.log('Form submitted:', data);
 * toast.success('Données de l\'année scolaire soumises !');
 * };
 *
 * const handleReset = () => {
 * studyYearFormRef.current?.reset();
 * toast.info('Formulaire réinitialisé.');
 * };
 *
 * const handleErrorDemo = () => {
 * studyYearFormRef.current?.setError('yearName', {
 * type: 'manual',
 * message: 'Ce nom d\'année est invalide !',
 * }, { shouldFocus: true });
 * toast.warning('Erreur manuelle appliquée au champ "Nom de l\'année".');
 * };
 *
 * return (
 * <div className="p-4">
 * <h2>Gérer l'Année Scolaire</h2>
 * <StudyYearForm ref={studyYearFormRef} onSubmit={handleSubmit}>
 * <div className="mt-4 flex gap-2">
 * <Button type="submit">Enregistrer l'Année Scolaire</Button>
 * <Button type="button" variant="outline" onClick={handleReset}>Réinitialiser</Button>
 * <Button type="button" variant="destructive" onClick={handleErrorDemo}>Tester Erreur</Button>
 * </div>
 * </StudyYearForm>
 * </div>
 * );
 * }
 * ```
 */
export function useFormHandleRef<TFieldValues extends FieldValues>(
  initialValue: ImperativeFormHandle<TFieldValues> | null = null
) {
  return useRef(initialValue);
}

/**
 * @function useFormImperativeHandle
 * @template TFieldValues - A type extending `FieldValues` (the schema type of the form).
 * @description Binds methods of a `react-hook-form` instance to a `React.forwardRef` handle.
 * This allows parent components to call `reset`, `setError`, and `setValue` directly on the child form.
 * This hook should be used inside a component that is wrapped with `React.forwardRef`.
 * @param {React.ForwardedRef<ImperativeFormHandle<TFieldValues>>} ref - The ref forwarded from the parent component.
 * @param {UseFormReturn<TFieldValues, any, TFieldValues>} form - The form instance returned by `useForm` (or `useControlledForm`).
 * The `any` type for context is common for `UseFormReturn` when context isn't strictly typed.
 */
export function useFormImperativeHandle<TFieldValues extends FieldValues>(
  ref: React.ForwardedRef<ImperativeFormHandle<TFieldValues>>,
  form: UseFormReturn<TFieldValues, any, TFieldValues>
) {
  useImperativeHandle(
    ref,
    () => ({
      reset(values) {
        form.reset(values);
      },
      setError(name, error, options) {
        form.setError(name, error, options);
      },
      setValue(name, value, options) {
        form.setValue(name, value, options);
      },
    }),
    [form]
  );
}

/**
 * @function mergeFormDefaultValues
 * @template T - The type of the object being merged (e.g., your form's schema type).
 * @description Merges multiple partial objects into a single partial object.
 * This is particularly useful for combining default form values with initial values
 * provided by props, ensuring that later arguments override earlier ones.
 * @param {...Partial<T>[]} args - One or more partial objects to merge.
 * @returns {Partial<T>} A new partial object containing the merged properties.
 *
 * @example
 * ```typescript
 * import { mergeFormDefaultValues } from './path/to/this/file'; // Your utility file
 *
 * interface UserProfile {
 * firstName: string;
 * lastName: string;
 * email: string;
 * age?: number;
 * }
 *
 * const defaults: Partial<UserProfile> = {
 * firstName: 'John',
 * lastName: 'Doe',
 * email: 'john.doe@example.com'
 * };
 *
 * const initialData: Partial<UserProfile> = {
 * lastName: 'Smith', // Overrides 'Doe'
 * age: 30
 * };
 *
 * const finalValues = mergeFormDefaultValues(defaults, initialData);
 * // finalValues will be: { firstName: 'John', lastName: 'Smith', email: 'john.doe@example.com', age: 30 }
 * ```
 */
export function mergeFormDefaultValues<T extends {}>(
  ...args: Partial<T>[]
): Partial<T> {
  return args.reduce((prev, current) => ({ ...prev, ...current }), {} as T);
}
