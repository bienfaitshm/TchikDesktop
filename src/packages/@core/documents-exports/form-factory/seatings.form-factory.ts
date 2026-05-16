import type { FormFieldDef } from "@/packages/dynamic-form";
type TFieldConfig = Partial<FormFieldDef>;
export class SeatingFormFactory {
  static buildSeatingField(config?: TFieldConfig): FormFieldDef {
    return {
      id: "seating",
      type: "select",
      label: "Mise en place",
      required: true,
      defaultValue: "eng",
      multiple: true,
      colSpan: 4,
      ...config,
    };
  }

  static buildLocalRoomsField(config?: TFieldConfig): FormFieldDef {
    return {
      id: "localRooms",
      type: "select",
      multiple: true,
      label: "Locaux",
      placeholder: "Locaux",
      defaultValue: [],
      colSpan: 4,
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
      defaultValue: [],
      colSpan: 4,
      ...config,
    };
  }
}
