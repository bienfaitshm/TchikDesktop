import {
  schoolInfoService,
  classroomService,
} from "@/packages/@core/data-access/db/queries";

type EnrollmentResolverParams = {
  yearId: string;
  schoolId: string;
  classId: string[];
};

export class EnrollmentDataResolver {
  static async resolveData({
    schoolId,
    yearId,
    classId,
  }: EnrollmentResolverParams) {
    if (!schoolId || !yearId) {
      throw new Error(
        "Paramètres requis manquants : schoolId et yearId sont obligatoires.",
      );
    }

    if (classId.length === 0) {
      return { school: null, classrooms: [] };
    }

    try {
      const [school, classrooms] = await Promise.all([
        schoolInfoService.getSchoolInfo(schoolId, yearId),
        classroomService.getClassroomsWithStudents({
          classroom: {
            orderBy: [
              { table: "classrooms", column: "identifier", order: "asc" },
            ],
            where: {
              classrooms: {
                schoolId,
                classId: {
                  $in: classId,
                },
              },
            },
          },
          enrollment: {
            where: {
              classroomEnrollments: {
                yearId,
              },
            },
          },
        }),
      ]);

      return {
        school,
        classrooms,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la résolution des données de cotation :",
        error,
      );
      throw new Error("Impossible de récupérer les données de cotation.", {
        cause: error,
      });
    }
  }
}
