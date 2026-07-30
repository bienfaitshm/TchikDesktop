import {
  ExportDocxExtension,
  type SchoolInfo,
  type SheetData,
  SheetExportExtension,
} from "@/packages/@core/documents-exports/extensions";
import {
  type ColumnDef,
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

/** Composite type representing a classroom with populated student enrollments. */
export type ClassroomWithEnrollments = Classroom & {
  enrollments: EnrollmentWithStudent[];
};

/** Composite type combining enrollment details with the associated user profile. */
export type EnrollmentWithStudent = ClassroomEnrollment & { student: User };

/** Composite type pairing school entity with its current active study year. */
export type SchoolWithStudyYear = School & { studyYear: StudyYear };

/** Payload required to process and generate an enrollment report. */
export interface EnrollmentReportPayload {
  school: SchoolWithStudyYear;
  classrooms: ClassroomWithEnrollments[];
}

/** Default table column definitions for student enrollment sheets. */
const ENROLLMENT_COLUMNS: ColumnDef[] = [
  { header: "N°", key: "position", width: 8, align: "center" },
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
 * DOCX export extension specialized in generating enrollment sheets per classroom.
 */
export class EnrollmentReportExportDocxExtension extends ExportDocxExtension<EnrollmentReportPayload> {
  /**
   * Initializes the DOCX extension with default template settings.
   * @param reportGenerator - Optional custom report generator service for testing or overrides.
   */
  constructor(reportGenerator?: DocxReportGeneratorService) {
    super(
      "enrollment-students.docx",
      "Generates the sheet containing the list of enrolled students by classroom.",
      reportGenerator,
    );
  }
}

/**
 * Excel sheet export extension specialized in formatting enrollment data per classroom.
 */
export class EnrollmentReportExportSheetExtension extends SheetExportExtension<EnrollmentReportPayload> {
  /**
   * Initializes the Excel sheet extension with column metadata and description.
   */
  constructor() {
    super({
      columns: ENROLLMENT_COLUMNS,
      description:
        "Generates an Excel file containing the detailed list of students for the selected class.",
    });
  }

  /**
   * Extracts school metadata from the report payload.
   * @param payload - Complete enrollment report payload.
   * @returns Formatted school information object.
   */
  public override getSchoolInfos(payload: EnrollmentReportPayload): SchoolInfo {
    const school = payload.school;
    return {
      name: school.name,
      yearName: school.studyYear.yearName,
      address: school.address,
      town: school.town,
    };
  }

  /**
   * Formats classroom enrollment records into Excel sheet configuration data.
   * @param item - Classroom record containing student enrollments.
   * @returns Sheet data structure with mapped row values.
   */
  public override getSheetData(item: unknown): SheetData<unknown> {
    const classroom = item as ClassroomWithEnrollments;
    return {
      data: classroom.enrollments,
      sheetName: classroom.identifier,
      title: "",
      rowMapper(rawEnrollment, index) {
        const enrollment = rawEnrollment as EnrollmentWithStudent;
        const student = enrollment.student;

        return {
          position: (index ?? 0) + 1,
          lastName: utils.toUpperCase(student.lastName),
          middleName: utils.toUpperCase(student.middleName),
          firstName: utils.toUpperCase(student.firstName ?? ""),
          gender: student.gender,
          birthPlace: student.birthPlace,
          birthDate: utils.formatDate(student.birthDate ?? ""),
          status: utils.conditionalFormat(
            enrollment.isNewStudent,
            "Nouveau",
            "Ancien",
          ),
          studentCode: enrollment.studentCode,
        };
      },
    } as SheetData<unknown>;
  }

  /**
   * Extracts classroom elements from the payload.
   * @param payload - Complete enrollment report payload.
   * @returns Array of classrooms containing student enrollments.
   */
  public override getItemElement(
    payload: EnrollmentReportPayload,
  ): ClassroomWithEnrollments[] {
    return payload.classrooms ?? [];
  }
}
