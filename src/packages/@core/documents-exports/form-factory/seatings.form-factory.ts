import type { FormFieldDef } from "@/packages/dynamic-form";

export class SeatingFormFactory {
  static buildSeatingField(options: any[]): FormFieldDef {
    return {
      id: "seating",
      type: "select",
      label: "Mise en place",
      required: true,
      defaultValue: "eng",
      colSpan: 4,
      options,
    };
  }

  static buildLocalRoomsField(options: any[]): FormFieldDef {
    return {
      id: "localRooms",
      type: "select",
      multiple: true,
      label: "Locaux",
      placeholder: "Locaux",
      defaultValue: [],
      options,
      colSpan: 4,
    };
  }

  static buildClassRoomsField(options: any[]): FormFieldDef {
    return {
      id: "classRooms",
      type: "select",
      multiple: true,
      label: "Salles de classes",
      placeholder: "Classes",
      defaultValue: [],
      options,
      colSpan: 4,
    };
  }
}
