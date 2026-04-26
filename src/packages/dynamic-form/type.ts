export type FieldType = "text" | "email" | "number" | "select";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  defaultValue?: string | number;
  options?: SelectOption[];
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  customClass?: string;
}

export interface FormSchemaConfig {
  title: string;
  fields: FormFieldDef[];
}
