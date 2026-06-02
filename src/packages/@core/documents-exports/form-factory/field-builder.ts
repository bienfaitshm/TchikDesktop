import type { FormFieldDef, SelectOption } from "@/packages/dynamic-form";
import type { TBaseFieldConfig } from "./field-factories.types";

/**
 * Immutable field builder following Builder pattern
 * Ensures type safety and prevents partial/invalid field states
 */
export class FieldBuilder {
  private constructor(
    private readonly field: Readonly<
      Required<Pick<FormFieldDef, "id" | "type">>
    > &
      Partial<FormFieldDef>,
  ) {}

  static create(id: string, type: FormFieldDef["type"]): FieldBuilder {
    return new FieldBuilder({ id, type });
  }

  withLabel(label: string): FieldBuilder {
    return new FieldBuilder({ ...this.field, label });
  }

  withPlaceholder(placeholder: string): FieldBuilder {
    return new FieldBuilder({ ...this.field, placeholder });
  }

  withOptions(options: readonly SelectOption[]): FieldBuilder {
    return new FieldBuilder({ ...this.field, options });
  }

  withDefaultValue(
    value?: string | number | string[] | number[],
  ): FieldBuilder {
    return new FieldBuilder({ ...this.field, defaultValue: value });
  }

  withColSpan(colSpan: FormFieldDef["colSpan"]): FieldBuilder {
    return new FieldBuilder({ ...this.field, colSpan });
  }

  required(): FieldBuilder {
    return new FieldBuilder({ ...this.field, required: true });
  }

  multiple(): FieldBuilder {
    return new FieldBuilder({ ...this.field, multiple: true });
  }

  build(config?: TBaseFieldConfig): FormFieldDef {
    return {
      ...this.field,
      ...config,
    } as FormFieldDef;
  }
}
