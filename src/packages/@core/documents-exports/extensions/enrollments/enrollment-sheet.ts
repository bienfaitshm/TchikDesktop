import * as ExcelJS from "exceljs";
import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { additionalJsContext as utils } from "@/packages/docx-template/additional-context";
import type {
  TEnrolement,
  TSchool,
  TUser,
  TStudyYear,
  TClassroom,
} from "@/packages/@core/data-access/db/schemas/types";

type EnrollmentWithStudent = TEnrolement & { student: TUser };
type SchoolWithYearStudy = TSchool & { studyYear: TStudyYear };

export interface EnrollmentReportPayload {
  school: SchoolWithYearStudy;
  classrooms: (TClassroom & { enrollments: EnrollmentWithStudent[] })[];
}

interface IStudentRow {
  index: number;
  lastName: string;
  middleName: string;
  firstName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  status: "Nouveau" | "Ancien";
  studentCode: string;
}

/**
 * Extension responsable de la génération de la liste des élèves sur Excel.
 * Le nom reste agnostique du format (pas de suffixe 'Excel').
 */
export class EnrollmentSheetExportExtension extends AbstractExportExtension<EnrollmentReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description =
    "Génère un fichier Excel contenant la liste détaillée des élèves pour la classe sélectionnée.";

  private readonly PRIMARY_COLOR = "FF00BFFF"; // Bleu Cyan vif
  private readonly HEADER_FONT_COLOR = "FFFFFFFF"; // Blanc (inchangé pour le contraste)
  private readonly ALT_ROW_COLOR = "FFE0F7F4"; // Vert Menthe très clair (rappel du dégradé bas)
  private readonly BORDER_COLOR = "FFB2D8D8"; // Gris bleuté doux (harmonieux avec le turquoise)

  public async process(
    payload: EnrollmentReportPayload,
  ): Promise<RawFileContent> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = `Tchik-${payload.school ?? "App"}`;
      workbook.created = new Date();

      for (const classroom of payload.classrooms) {
        const sheetName = this.sanitizeSheetName(classroom.shortIdentifier);
        const worksheet = workbook.addWorksheet(sheetName);

        this.configureColumns(worksheet);
        this.writeOfficialHeader(worksheet, payload.school, classroom);
        this.populateData(worksheet, classroom.enrollments);
        this.applyProfessionalStyling(worksheet);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as RawFileContent;
    } catch (error) {
      console.error(
        "Erreur lors de la génération du fichier Excel d'inscription:",
        error,
      );
      throw new Error("Échec de la génération du fichier Excel.");
    }
  }

  /**
   * Configure les clés et dimensions, et force l'écriture des en-têtes sur la ligne 6
   */
  private configureColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns = [
      { header: "N°", key: "index", width: 6 },
      { header: "Nom", key: "lastName", width: 24 },
      { header: "Post-nom", key: "middleName", width: 24 },
      { header: "Prénom", key: "firstName", width: 24 },
      { header: "Sexe", key: "gender", width: 8 },
      { header: "Lieu de naissance", key: "birthPlace", width: 24 },
      { header: "Date de naissance", key: "birthDate", width: 18 },
      { header: "Statut", key: "status", width: 14 },
      { header: "Code d’inscription", key: "studentCode", width: 20 },
    ];

    const headers: ExcelJS.CellValue[] = worksheet.columns.map(
      (col) => col.header as ExcelJS.CellValue,
    );
    worksheet.getRow(6).values = headers;
  }

  /**
   * En‑tête officiel du pays et de l'établissement (Lignes 1 à 5)
   */
  private writeOfficialHeader(
    worksheet: ExcelJS.Worksheet,
    school: SchoolWithYearStudy,
    classroom: TClassroom & { enrollments: EnrollmentWithStudent[] },
  ): void {
    const lastCol = this.columnIndexToLetter(worksheet.columnCount);

    const headerConfigs = [
      {
        text: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO",
        size: 14,
        bold: true,
        color: "FF222222",
        height: 28,
      },
      {
        text: "MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE",
        size: 12,
        bold: true,
        color: "FF222222",
        height: 24,
      },
      {
        text: school.name?.toUpperCase() ?? "",
        size: 13,
        bold: true,
        color: "FF222222",
        height: 24,
      },
      {
        text: `${school.adress ?? ""}, ${school.town ?? ""}`,
        size: 11,
        bold: false,
        color: "FF333333",
        height: 22,
      },
      {
        text: `LISTES DES ÉLÈVES INSCRITS | ${classroom.shortIdentifier} | ${school.studyYear?.yearName ?? ""}`,
        size: 12,
        bold: true,
        color: this.PRIMARY_COLOR,
        height: 24,
      },
    ];

    headerConfigs.forEach((config, idx) => {
      const rowNum = idx + 1;
      worksheet.mergeCells(`A${rowNum}:${lastCol}${rowNum}`);
      const cell = worksheet.getCell(`A${rowNum}`);
      cell.value = config.text;
      cell.font = {
        bold: config.bold,
        size: config.size,
        color: { argb: config.color },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(rowNum).height = config.height;
    });
  }

  /**
   * Remplissage des lignes élèves (ExcelJS ajoutera automatiquement à partir de la ligne 7)
   */
  private populateData(
    worksheet: ExcelJS.Worksheet,
    enrollments: EnrollmentWithStudent[],
  ): void {
    const rows: IStudentRow[] = enrollments.map((enrollment, idx) => ({
      index: idx + 1,
      lastName: enrollment.student.lastName?.toUpperCase() ?? "",
      middleName: enrollment.student.middleName?.toUpperCase() ?? "",
      firstName: enrollment.student.firstName?.toUpperCase() ?? "",
      gender: enrollment.student.gender,
      birthPlace: enrollment.student.birthPlace ?? "",
      birthDate: this.formatBirthDate(enrollment.student.birthDate),
      status: utils.conditionalFormat(
        enrollment.isNewStudent,
        "Nouveau",
        "Ancien",
      ),
      studentCode: enrollment.studentCode,
    }));

    worksheet.addRows(rows);
  }

  private formatBirthDate(timestamp: string | number | null): string {
    if (!timestamp) return "";
    const ts = isNaN(Number(timestamp))
      ? Date.parse(timestamp as string)
      : Number(timestamp);
    return isNaN(ts) ? String(timestamp) : utils.formatDate(ts);
  }

  private sanitizeSheetName(name: string): string {
    return name.replace(/[/\\?*[\]:]/g, "_").substring(0, 31);
  }

  private applyProfessionalStyling(worksheet: ExcelJS.Worksheet): void {
    // Figer les lignes 1 à 6 (titres + en-tête du tableau)
    worksheet.views = [{ state: "frozen", ySplit: 6 }];

    const lastCol = this.columnIndexToLetter(worksheet.columnCount);
    worksheet.autoFilter = {
      from: "A6",
      to: `${lastCol}${worksheet.rowCount}`,
    };

    const headerRow = worksheet.getRow(6);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: this.HEADER_FONT_COLOR },
        size: 11,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: this.PRIMARY_COLOR },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = this.softBorders();
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 6) return;

      row.height = 20;
      const isEven = rowNumber % 2 === 0;

      row.eachCell((cell, colNumber) => {
        if (isEven) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: this.ALT_ROW_COLOR },
          };
        }
        cell.border = this.softBorders();

        if ([1, 5, 7, 8, 9].includes(colNumber)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            indent: 1,
          };
        }
      });
    });
  }

  private softBorders(): Partial<ExcelJS.Borders> {
    const line: ExcelJS.Border = {
      style: "thin",
      color: { argb: this.BORDER_COLOR },
    };
    return { top: line, left: line, bottom: line, right: line };
  }

  private columnIndexToLetter(index: number): string {
    let letter = "";
    while (index > 0) {
      const remainder = (index - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      index = Math.floor((index - 1) / 26);
    }
    return letter;
  }
}
