import {
  classroomService,
  schoolInfoService,
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
      schoolInfoService.getSchoolInfo(schoolId, yearId),
      classroomService.getClassroomsWithStudentsAndAssignments({
        classroom: {
          where: {
            classrooms: {
              section: sectionId,
              schoolId,
              classId: {
                $in: classId,
              },
            },
          },
        },
        assignment: {
          where: {
            seatingAssignments: {
              sessionId,
            },
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

// ClassroomWithAssignments

export function normalizeEnrollments(classrooms: any[]) {
  return classrooms.map((classroom) =>
    classroom.enrollments.map((enrollment) => {
      const [firstAssignment] = enrollment.seatingAssignments ?? [];

      return {
        ...enrollment,
        assignment: firstAssignment ?? null,
      };
    }),
  );
}
