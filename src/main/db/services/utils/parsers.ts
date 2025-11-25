import {
  USER_GENDER,
  STUDENT_STATUS,
  STUDENT_STATUS_TRANSLATIONS,
} from "@/commons/constants/enum";
import { formatDate } from "@/commons/libs/times";
import type { EnrollmentData } from "@/main/db/services/document";
import { sortStudentsByFullName } from "./filters";

/**
 * @interface IStudentProfile
 * @description Structure des données d'un élève mappées pour le reporting.
 */
export interface IStudentProfile {
  gender: USER_GENDER;
  fullName: string;
  lastName: string;
  middleName: string;
  firstName: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  status: STUDENT_STATUS;
  enrollmentCode: string;
}

/**
 * @interface IClassroomReport
 * @description Structure des données d'un rapport de classe, regroupant les élèves.
 */
export interface IClassroomReport {
  classId: string;
  className: string;
  shortClassName: string;
  students: IStudentProfile[];
}

/**
 * @typedef TExcelRow
 * @description Type de données pour une ligne prête à être exportée (colonnes en français).
 */
export type TExcelRow = {
  "Code de classe": string;
  "Nom de classe court": string;
  "Nom, postnom et Prénom": string;
  Nom: string;
  Postnom: string;
  Prénom: string;
  Sexe: USER_GENDER;
  "Date de naissance": string;
  "Lieu de naissance": string;
  Statut: string;
  "Code d'inscription": string;
};

/**
 * @function mapRawEnrollmentsToReportStructure
 * @description Transforme les données d'inscription brutes (typiquement issues de la DB)
 * en un format structuré par classe (`IClassroomReport`).
 * Les élèves sont triés par nom complet après le mapping.
 *
 * @param {EnrollmentData[]} rawClassroomsData - Tableau d'objets EnrollmentData (données brutes avec relations).
 * @returns {IClassroomReport[]} Un tableau d'objets structurés, chaque objet représentant une classe.
 */
export function mapRawEnrollmentsToReportStructure(
  rawClassroomsData: EnrollmentData[]
): IClassroomReport[] {
  // 1. Mapping de chaque classe (TClassroom -> IClassroomReport)
  return rawClassroomsData.map((classroom) => {
    // 2. Mapping et extraction des détails des élèves pour cette classe
    const rawStudents = classroom.ClassroomEnrolements.map((enrollment) => {
      const user = enrollment.User;
      return {
        gender: user.gender,
        fullName: user.fullname,
        lastName: user.lastName,
        middleName: user.middleName,
        firstName: user.firstName || null,
        birthPlace: user.birthPlace || null,
        birthDate: user.birthDate || null,
        status: enrollment.status,
        enrollmentCode: enrollment.code,
      } as IStudentProfile; // Assertion pour garantir le type IStudentProfile
    });

    // 3. Tri des élèves par nom complet après le mapping
    const sortedStudents = sortStudentsByFullName(rawStudents);

    return {
      classId: classroom.classId,
      className: classroom.identifier,
      shortClassName: classroom.shortIdentifier,
      students: sortedStudents,
    };
  });
}

/**
 * @function formatReportForExcelExport
 * @description Prépare les données structurées des inscriptions pour l'exportation.
 * Transforme la structure hiérarchique (Classe -> [Élèves]) en un tableau plat
 * (`TExcelRow[]`) avec des en-têtes de colonnes lisibles en français.
 *
 * @param {IClassroomReport[]} enrollmentReports - Les données d'inscription structurées par classe.
 * @returns {TExcelRow[]} Un tableau d'objets plats, chaque objet représentant une ligne d'exportation.
 */
export function formatReportForExcelExport(
  enrollmentReports: IClassroomReport[]
): TExcelRow[] {
  return enrollmentReports.reduce((excelData, classroom) => {
    for (const student of classroom.students) {
      // 1. Formatage conditionnel de la date
      const formattedBirthDate = student.birthDate
        ? formatDate(student.birthDate)
        : "";

      // 2. Traduction du statut
      const statusTranslation =
        STUDENT_STATUS_TRANSLATIONS[student.status] || student.status;

      // 3. Construction de l'objet ligne avec les en-têtes français
      const excelRow: TExcelRow = {
        "Code de classe": classroom.className,
        "Nom de classe court": classroom.shortClassName,
        "Nom, postnom et Prénom": student.fullName,
        Nom: student.lastName,
        Postnom: student.middleName,
        Prénom: student.firstName || "",
        Sexe: student.gender,
        "Date de naissance": formattedBirthDate,
        "Lieu de naissance": student.birthPlace || "",
        Statut: statusTranslation,
        "Code d'inscription": student.enrollmentCode,
      };

      excelData.push(excelRow);
    }
    return excelData;
  }, [] as TExcelRow[]);
}
