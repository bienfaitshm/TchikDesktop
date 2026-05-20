import type { FormFieldDef } from "@/packages/dynamic-form";
import { classroomService } from "@/packages/@core/data-access/db/queries";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { EnrollmentFormFactory } from "../form-factory";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";

export type TCreateEnrollmentFormParams = {
  yearId?: string;
  schoolId?: string;
  classId?: string | string[];
};

export const EnrollmentMappers = {
  /**
   * Mappe les classes de la BDD vers le format d'options attendu par l'UI.
   * Utilise le type inféré du service pour garantir la robustesse.
   */
  toClassroomOptions: (
    classrooms: Awaited<ReturnType<typeof classroomService.findMany>>,
  ) =>
    classrooms.map((classroom) => ({
      label: classroom.shortIdentifier,
      value: classroom.classId,
    })),
};

/**
 * Génère la configuration des champs de formulaire dynamiques pour les inscriptions (Enrollments).
 */
export async function createEnrollmentFieldForm({
  schoolId,
  yearId,
  classId,
}: TCreateEnrollmentFormParams): Promise<FormFieldDef[]> {
  if (!schoolId || !yearId) {
    return [];
  }

  const classrooms = await classroomService.findMany({
    where: { schoolId, yearId },
  });

  const defaultClassroomValue = Array.isArray(classId)
    ? classId
    : (classId ?? undefined);

  return [
    EnrollmentFormFactory.buildSectionField({
      options: SECTION_OPTIONS,
      colSpan: 4,
      defaultValue: SECTION_ENUM.SECONDARY,
    }),

    EnrollmentFormFactory.buildClassRoomsField({
      options: EnrollmentMappers.toClassroomOptions(classrooms),
      defaultValue: defaultClassroomValue,
      colSpan: 4,
    }),
  ];
}
