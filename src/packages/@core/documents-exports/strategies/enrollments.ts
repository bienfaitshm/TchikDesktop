/**
 * @description Stratégie unique pour l'export des inscriptions supportant plusieurs formats.
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import { EnrolementFilterSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";

const formFields: FormFieldDef[] = [
  {
    id: "firstName",
    type: "text",
    label: "Prénom",
    placeholder: "ex: Jean",
    required: true,
    colSpan: 6,
  },
  {
    id: "lastName",
    type: "text",
    label: "Nom",
    placeholder: "ex: Dupont",
    required: true,
    colSpan: 6,
  },
  {
    id: "userEmail",
    type: "email",
    label: "Adresse Email",
    required: true,
    colSpan: 12,
  },
  {
    id: "department",
    type: "select",
    label: "Département",
    required: true,
    colSpan: 8,
    defaultValue: "eng",
    options: [
      { label: "Engineering", value: "eng" },
      { label: "Design", value: "dsgn" },
      { label: "Product", value: "prod" },
    ],
  },
  {
    id: "tech_stack",
    type: "select",
    multiple: true,
    label: "Technologies maîtrisées",
    defaultValue: ["react", "typescript"],
    options: [
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
      { label: "Node.js", value: "node" },
    ],
    colSpan: 12,
  },
];

export class EnrollmentExportStrategy extends AbstractExportStrategy {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";
  public readonly validationSchema = EnrolementFilterSchema;

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  };

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override getFormFields(params: any): object[] {
    console.log("getFormFields ", this.id, params);
    return formFields;
  }
}
