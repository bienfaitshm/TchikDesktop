export type FieldType = "text" | "email" | "number" | "select";

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  defaultValue?: string | number | string[] | number[];
  options?: Readonly<SelectOption[]>;
  multiple?: boolean;
  colSpan?: ColSpan;
  customClass?: string;
}
