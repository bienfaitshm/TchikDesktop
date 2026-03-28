

export type BaseFormProps<T> = {
    formId?: string;
    initialValues?: Partial<T>;
    onSubmit?: (data: T) => void
}