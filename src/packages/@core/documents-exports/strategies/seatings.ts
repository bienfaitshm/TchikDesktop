/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";
import z from "zod";

const SEATING_FORM_FIELDS: FormFieldDef[] = [
  {
    id: "seating",
    type: "select",
    label: "Mise en place",
    required: true,
    defaultValue: "eng",
    colSpan: 4,
    options: [
      { label: "Engineering", value: "eng" },
      { label: "Design", value: "dsgn" },
      { label: "Product", value: "prod" },
    ],
  },
  {
    id: "localRooms",
    type: "select",
    multiple: true,
    label: "Locaux",
    placeholder: "Locaux",
    defaultValue: ["react", "typescript"],
    options: [
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
      { label: "Node.js", value: "node" },
    ],
    colSpan: 4,
  },
  {
    id: "classRooms",
    type: "select",
    multiple: true,
    label: "Salles de classes",
    placeholder: "Classes",
    defaultValue: ["react", "typescript"],
    options: [
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
      { label: "Node.js", value: "node" },
    ],
    colSpan: 4,
  },
];

export class SeatingExportStrategy extends AbstractExportStrategy {
  public readonly id = "SEATING_EXPORT" as const;
  public readonly displayName = "Liste de la mise en place";
  public readonly description =
    "Génère un état détaillé de la répartition des élèves par salle. Cet export inclut les listes d'émargement, l'affectation aux pupitres et les métadonnées de l'établissement pour faciliter l'organisation physique des épreuves ou des cours.";

  public readonly validationSchema = z.object({});

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

  public override getFormFields() {
    return SEATING_FORM_FIELDS;
  }
}
