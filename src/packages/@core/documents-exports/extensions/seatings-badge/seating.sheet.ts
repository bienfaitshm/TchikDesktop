import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  type ColumnDef,
  ExcelWorkbookBuilder,
  SheetConfig,
  additionalJsContext as utils,
} from "@/packages/document-template";
import type {
  SeatingBadgeReportPayload,
  EnrollmentWithStudent,
  ClassroomWithEnrollements,
} from "./type";

/**
 * Couleur d’en‑tête sobre, proche du bleu standard d’Excel.
 * Choisie pour un bon contraste avec le texte noir.
 */
const PRIMARY_COLOR = "FF00BFFF";
const HEADER_FONT_COLOR = "FFFFFFFF";
const ALT_ROW_COLOR = "FFE0F7F4";
const BORDER_COLOR = "FFB2D8D8";

/**
 * Définition des colonnes de la feuille d’émargement.
 *
 * @remarks
 * Les largeurs sont exprimées en nombre approximatif de caractères.
 * Les titres respectent les conventions de l’éducation nationale.
 */
const enrollmentColumns: ColumnDef[] = [
  { header: "N°", key: "index", width: 6 },
  { header: "Nom", key: "lastName", width: 24 },
  { header: "Post-nom", key: "middleName", width: 24 },
  { header: "Prénom", key: "firstName", width: 24 },
  { header: "Sexe", key: "gender", width: 8 },
  { header: "Lieu de naissance", key: "birthPlace", width: 24 },
  { header: "Date de naissance", key: "birthDate", width: 18 },
  { header: "Statut", key: "status", width: 14 },
  { header: "Code d’inscription", key: "studentCode", width: 20 },
  { header: "Local", key: "seat", width: 20 },
] as const;

/**
 * Construit la configuration d’une feuille Excel correspondant
 * à un local et à ses élèves.
 *
 * @param room - Les données du local (nom, liste d’élèves, etc.)
 * @returns La configuration prête à être ajoutée au classeur.
 */
function buildSheet({
  enrollments,
  shortIdentifier,
}: ClassroomWithEnrollements): SheetConfig<EnrollmentWithStudent, string> {
  return {
    sheetName: shortIdentifier,
    columns: enrollmentColumns,
    data: enrollments,

    rowMapper: (
      { student, isNewStudent, studentCode, assignment: { localroom } },
      idx,
    ) => {
      return {
        index: idx + 1,
        lastName: utils.toUpperCase(student.lastName),
        middleName: utils.toUpperCase(student.middleName),
        firstName: utils.toUpperCase(student.firstName ?? ""),
        gender: student.gender,
        birthPlace: student.birthPlace,
        birthDate: utils.formatDate(student.birthPlace ?? ""),
        status: utils.conditionalFormat(isNewStudent, "Nouveau", "Ancien"),
        studentCode,
        seat: localroom.name,
      };
    },

    tableStyle: {
      headerRowStyle: {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: PRIMARY_COLOR },
        },
        font: { color: { argb: HEADER_FONT_COLOR }, bold: true },
      },
      borderColor: BORDER_COLOR,
      altRowColor: ALT_ROW_COLOR,
    },
  };
}

/**
 * Extension responsable de la génération de la liste des élèves sur Excel.
 * Le nom reste agnostique du format (pas de suffixe 'Excel').
 */
export class SeatingBadgeSheetExcelExportExtension extends AbstractExportExtension<SeatingBadgeReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description =
    "Génère un fichier Excel contenant la liste détaillée des élèves pour la classe sélectionnée avec leurs local.";

  public async process({
    school,
    classrooms,
  }: SeatingBadgeReportPayload): Promise<RawFileContent> {
    const creator = `Tchik-${school.name ?? "App"}`;
    const builder = new ExcelWorkbookBuilder(creator);

    classrooms.forEach((clasroom) => {
      builder.addSheet(buildSheet(clasroom));
    });

    return builder.build() as unknown as RawFileContent;
  }
}
