import type { FormFieldDef } from "@/packages/dynamic-form";

export class EnrollmentFormFactory {
  static buildSectionField(
    options: any[],
    defaultValue: string[] = [],
  ): FormFieldDef {
    return {
      id: "section",
      type: "select",
      label: "Section",
      required: true,
      colSpan: 6,
      options,
      defaultValue,
    };
  }

  static buildClassRoomsField(
    options: any[],
    defaultValue: string[] = [],
  ): FormFieldDef {
    console.log("DEFAULT", defaultValue);
    return {
      id: "classRooms",
      type: "select",
      multiple: true,
      label: "Salles de classes",
      placeholder: "Classes",
      defaultValue,
      options,
      colSpan: 6,
    };
  }
}
