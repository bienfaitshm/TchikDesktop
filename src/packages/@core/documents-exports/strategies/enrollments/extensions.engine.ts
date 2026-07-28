import {
  ExportDocxExtension,
  SchoolInfo,
  SheetData,
  SheetExportExtension,
} from "@/packages/@core/documents-exports/extensions";
import {
  ColumnDef,
  DocxReportGeneratorService,
  additionalJsContext as utils,
} from "@/packages/document-template";
import type {
  ClassroomEnrollment,
  School,
  User,
  StudyYear,
  Classroom,
} from "@/packages/@core/data-access/db";

export type ClassroomWithEnrollements = Classroom & {
  enrollments: EnrollmentWithStudent[];
};
export type EnrollmentWithStudent = ClassroomEnrollment & { student: User };
export type SchoolWithYearStudy = School & { studyYear: StudyYear };

export interface EnrollmentReportPayload {
  school: SchoolWithYearStudy;
  classrooms: ClassroomWithEnrollements[];
}

const enrollmentColumns: ColumnDef[] = [
  { header: "N°", key: "nPosition", width: 8, align: "center" },
  { header: "Nom", key: "lastName", width: 24 },
  { header: "Post-nom", key: "middleName", width: 24 },
  { header: "Prénom", key: "firstName", width: 24 },
  { header: "Sexe", key: "gender", width: 8 },
  { header: "Lieu de naissance", key: "birthPlace", width: 24 },
  { header: "Date de naissance", key: "birthDate", width: 18 },
  { header: "Statut", key: "status", width: 14 },
  { header: "Code d’inscription", key: "studentCode", width: 20 },
] as const;

/**
 * Extension spécialisée dans la génération des fiches de cotation par salle de classe.
 * Hérite du comportement sécurisé d'ExportDocxExtension en appliquant un typage strict sur le payload.
 */
export class EnrollmentReportExportDocxExtension extends ExportDocxExtension<EnrollmentReportPayload> {
  /**
   * @param reportGenerator Permet d'injecter un service alternatif (mock) pour les tests unitaires.
   */
  constructor(reportGenerator?: DocxReportGeneratorService) {
    super(
      "enrollment-students.docx",
      "Génère la fiche contenant la liste des inscrits par salle",
      reportGenerator,
    );
  }
}

export class EnrollmentReportExportSheetExtension extends SheetExportExtension<EnrollmentReportPayload> {
  constructor() {
    super({
      columns: enrollmentColumns,
      description:
        "Génère un fichier Excel contenant la liste détaillée des élèves pour la classe sélectionnée.",
    });
  }
  public override getSchoolInfos(payload: EnrollmentReportPayload): SchoolInfo {
    const school = payload.school;
    return {
      name: school.name,
      yearName: school.studyYear.yearName,
      address: school.address,
      town: school.town,
    };
  }
  public override getSheetData(
    item: ClassroomWithEnrollements,
  ): SheetData<EnrollmentWithStudent> {
    return {
      data: item.enrollments,
      sheetName: item.identifier,
      title: ``,
      rowMapper({ student, isNewStudent, studentCode }, index) {
        return {
          nPosition: (index ?? 0) + 1,
          lastName: utils.toUpperCase(student.lastName),
          middleName: utils.toUpperCase(student.middleName),
          firstName: utils.toUpperCase(student.firstName ?? ""),
          gender: student.gender,
          birthPlace: student.birthPlace,
          birthDate: utils.formatDate(student.birthPlace ?? ""),
          status: utils.conditionalFormat(isNewStudent, "Nouveau", "Ancien"),
          studentCode,
        };
      },
    };
  }
  public override getItemElement(
    payload: EnrollmentReportPayload,
  ): ClassroomWithEnrollements[] {
    return payload.classrooms ?? [];
  }
}
