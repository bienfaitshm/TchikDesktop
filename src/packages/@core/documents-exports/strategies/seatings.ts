/**
 * @description Stratégie d'export pour la mise en place (seating).
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

const SEATING_FORM_FIELDS: FormFieldDef[] = [
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

export class SeatingExportStrategy extends AbstractExportStrategy {
  public readonly id = "SEATING_EXPORT" as const;
  public readonly displayName = "Liste de la mise en place";
  public readonly description =
    "Génère un état détaillé de la répartition des élèves par salle. Cet export inclut les listes d'émargement, l'affectation aux pupitres et les métadonnées de l'établissement pour faciliter l'organisation physique des épreuves ou des cours.";

  public readonly validationSchema = EnrolementFilterSchema;

  protected readonly formFields = SEATING_FORM_FIELDS;

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  } as const;

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: generateValidationSchema,
    });
  }
}
