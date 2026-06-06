import {
  ExcelWorkbookBuilder,
  type SheetConfig,
  type ColumnDef,
} from "@/packages/document-template";
import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import type { SeatingReportPayload } from "./type";

type RoomAssignment = SeatingReportPayload["assignment"]["assignments"][0];

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
  { header: "N°", key: "n", width: 8, align: "center" },
  { header: "Nom", key: "lastName", width: 24 },
  { header: "Post-nom", key: "middleName", width: 22 },
  { header: "Prénom", key: "firstName", width: 22 },
  { header: "Sexe", key: "gender", width: 10, align: "center" },
  { header: "Classe", key: "className", width: 30 },
  { header: "Emplacement", key: "seat", width: 16, align: "center" },
  { header: "Code d’inscription", key: "code", width: 30, align: "center" },
] as const;

/**
 * Construit la configuration d’une feuille Excel correspondant
 * à un local et à ses élèves.
 *
 * @param room - Les données du local (nom, liste d’élèves, etc.)
 * @returns La configuration prête à être ajoutée au classeur.
 */
function buildEnrollmentSheet(
  room: RoomAssignment,
): SheetConfig<RoomAssignment["students"][0], string> {
  return {
    sheetName: truncateSheetName(room.name),
    officialHeaders: [],
    columns: enrollmentColumns,
    data: room.students,

    rowMapper: (studentRecord, idx) => {
      const {
        enrolement: { student, studentCode, classRoom },
        rowPosition,
        columnPosition,
      } = studentRecord;

      return {
        index: idx + 1,
        n: idx + 1,
        lastName: student.lastName,
        middleName: student.middleName,
        firstName: student.firstName,
        gender: student.gender,
        className: classRoom.shortIdentifier,
        code: studentCode,
        seat: `${rowPosition}‑${columnPosition}`,
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
 * Génère un plan de salle au format Excel.
 * Chaque local devient une feuille distincte dans le classeur.
 */
export class SeatingPlanBySheetExcelExportExtension extends AbstractExportExtension<SeatingReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description =
    "Génère un plan de salle avec une feuille Excel par local";

  public async process({
    school,
    assignment,
  }: SeatingReportPayload): Promise<RawFileContent> {
    const creator = `Tchik-${school.name ?? "App"}`;
    const builder = new ExcelWorkbookBuilder(creator);

    assignment.assignments.forEach((room) => {
      builder.addSheet(buildEnrollmentSheet(room));
    });

    return builder.build() as unknown as RawFileContent;
  }
}

/**
 * Tronque un nom de feuille pour ne pas dépasser la limite Excel.
 * Ajoute éventuellement des points de suspension.
 */
function truncateSheetName(name: string, maxLength = 31): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + "…";
}
