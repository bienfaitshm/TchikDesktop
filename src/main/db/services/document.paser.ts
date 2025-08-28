import { USER_GENDER, STUDENT_STATUS } from "@/commons/constants/enum";
import { formatDate } from "@/commons/libs/times";
import type { EnrollmentData } from "@/main/db/services/document";

// Interfaces pour une meilleure structure et lisibilité des données
interface StudentProfile {
  gender: USER_GENDER;
  fullName: string;
  lastName: string;
  middleName: string;
  firstName?: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  status: STUDENT_STATUS;
  enrollmentCode: string;
}

interface ClassroomEnrollment {
  className: string;
  shortClassName: string;
  students: StudentProfile[];
}

/**
 * Transforme les données d'inscription brutes en un format structuré par classe.
 * @param classrooms - Tableau d'objets EnrollmentData contenant les informations des classes et des élèves.
 * @returns Un tableau d'objets ClassroomEnrollment, chaque objet représentant une classe avec sa liste d'élèves.
 */
export function mapClassroomsToEnrollments(
  classrooms: EnrollmentData[]
): ClassroomEnrollment[] {
  return classrooms.map((classroom) => ({
    className: classroom.identifier,
    shortClassName: classroom.shortIdentifier,
    students: classroom.ClassroomEnrolements.map((enrollment) => ({
      gender: enrollment.User.gender,
      fullName: enrollment.User.fullname,
      lastName: enrollment.User.lastName,
      middleName: enrollment.User.middleName,
      firstName: enrollment.User.firstName,
      birthPlace: enrollment.User.birthPlace,
      birthDate: enrollment.User.birthDate,
      status: enrollment.status,
      enrollmentCode: enrollment.code,
    })),
  }));
}

/**
 * Prépare les données d'inscription pour l'exportation vers Excel.
 *
 * @param enrollments - Les données d'inscription structurées par classe.
 * @returns Un tableau d'objets, chaque objet représentant une ligne avec des en-têtes de colonne en français.
 */
export function enrollmentToExcelData(enrollments: ClassroomEnrollment[]) {
  const excelData: any = [];

  for (const classroom of enrollments) {
    for (const student of classroom.students) {
      excelData.push({
        "Code de classe": classroom.className,
        "Nom de classe court": classroom.shortClassName,
        "Nom complet": student.fullName,
        Nom: student.lastName,
        Postnom: student.middleName,
        Prénom: student.firstName || "",
        Genre: student.gender,
        "Date de naissance": student.birthDate
          ? formatDate(student.birthDate)
          : "",
        "Lieu de naissance": student.birthPlace || "",
        Statut: student.status,
        "Code d'inscription": student.enrollmentCode,
      });
    }
  }

  return excelData;
}
