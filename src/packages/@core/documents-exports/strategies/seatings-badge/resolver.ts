import {
  schoolService,
  classroomService,
} from "@/packages/@core/data-access/db/queries";
import type { SECTION_ENUM } from "@/packages/@core/data-access/db";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

export type SeatingResolverParams = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
  sectionId: SECTION_ENUM;
  classId: string[];
};

export class SeatingPresenceSessionDataResolver {
  /**
   * Résout les données nécessaires pour la vue de placement.
   */
  static async resolveData({
    schoolId,
    sessionId,
    yearId,
    sectionId,
    classId = [],
  }: SeatingResolverParams) {
    if (!schoolId || !yearId || !sessionId) {
      throw new Error(
        "Paramètres requis manquants : schoolId, yearId ou sessionId.",
      );
    }
    const [school, classrooms] = await Promise.all([
      schoolService.fetchSchoolInfo(schoolId, yearId),
      classroomService.getClassroomsWithStudentAndAssignement({
        classroomOptions: {
          where: { schoolId, yearId, section: sectionId },
          whereIn: { classId },
        },
        assignementOptions: {
          where: {
            sessionId,
          },
        },
      }),
    ]);

    return {
      school,
      classrooms,
    };
  }
}
