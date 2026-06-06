import { FieldBuilder } from "./field-builder";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import type { TBaseFieldConfig } from "./field-factories.types";
import type { FormFieldDef } from "@/packages/dynamic-form";

/**
 * Factory for file type selection fields
 */
export const FileTypeFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("fileType", "select")
      .withLabel("Format du fichier")
      .withPlaceholder("ex: pdf, docx")
      .withColSpan(4)
      .required()
      .build(config);
  },
};

/**
 * Factory for seating session fields
 */
export const SeatingSessionFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("sessionId", "select")
      .withLabel("Mise en place")
      .withDefaultValue("eng")
      .withColSpan(4)
      .required()
      .build(config);
  },
};

/**
 * Factory for classroom location fields
 */
export const LocalRoomsFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("localId", "select")
      .withLabel("Locaux")
      .withPlaceholder("Locaux")
      .withDefaultValue([])
      .withColSpan(4)
      .multiple()
      .build(config);
  },
};

/**
 * Factory for classroom selection fields
 */
export const ClassroomFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("classId", "select")
      .withLabel("Salles de classes")
      .withPlaceholder("Classes")
      .withDefaultValue([])
      .withColSpan(4)
      .multiple()
      .build(config);
  },
};

/**
 * Factory for section selection fields
 */
export const SectionFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("sectionId", "select")
      .withLabel("Section")
      .withOptions(SECTION_OPTIONS)
      .withDefaultValue(SECTION_ENUM.SECONDARY)
      .withColSpan(4)
      .required()
      .build(config);
  },
};

export const NumberDaysFieldFactory = {
  create(config?: TBaseFieldConfig): FormFieldDef {
    return FieldBuilder.create("nDays", "number")
      .withLabel("Nombre de jours")
      .withPlaceholder("Ex: 3")
      .withDefaultValue(14)
      .withColSpan(5)
      .required()
      .build(config);
  },
};
