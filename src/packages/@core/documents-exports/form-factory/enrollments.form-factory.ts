import type { FormFieldDef } from "@/packages/dynamic-form";

type TFieldConfig = Partial<FormFieldDef>;
export class EnrollmentFormFactory {
  static buildSectionField(config?: TFieldConfig): FormFieldDef {
    return {
      id: "section",
      type: "select",
      label: "Section",
      required: true,
      colSpan: 6,
      ...config,
    };
  }

  static buildClassRoomsField(config?: TFieldConfig): FormFieldDef {
    return {
      id: "classRooms",
      type: "select",
      multiple: true,
      label: "Salles de classes",
      placeholder: "Classes",
      colSpan: 6,
      ...config,
    };
  }
}
