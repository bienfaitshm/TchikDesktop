import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import * as ExcelJS from "exceljs";
import type { TSeatingSessionGrouped } from "@/packages/@core/data-access/db/queries/seating-queries";
import { TSchool } from "@/packages/@core/data-access/db/schemas/types";

export type ExportPayload = TSchool & { assignment: TSeatingSessionGrouped };

export class SeatingPlanBySheetExcelExportExtension extends AbstractExportExtension<ExportPayload> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description =
    "Génère un plan de salle avec une feuille Excel par local";

  public async process(payload: ExportPayload): Promise<RawFileContent> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Tchik";
    workbook.created = new Date();

    payload.assignment.assignments.forEach((room) => {
      const safeName = room.name.replace(/[/\\?*[\]]/g, "_").substring(0, 31);
      const worksheet = workbook.addWorksheet(safeName);

      this.configureColumns(worksheet);
      this.populateData(worksheet, room.students);
      this.applyAdvancedStyles(worksheet);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as RawFileContent;
  }

  /**
   * Définit les colonnes avec des largeurs optimisées
   */
  private configureColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns = [
      { header: "Nom", key: "lastName", width: 25 },
      { header: "Post-nom", key: "middleName", width: 22 },
      { header: "Prénom", key: "firstName", width: 22 },
      { header: "Sexe", key: "gender", width: 12 },
      { header: "Classe", key: "class", width: 18 },
      { header: "Ligne", key: "row", width: 12 },
      { header: "Colonne", key: "col", width: 12 },
    ];
  }

  /**
   * Trie et insère les données des étudiants
   */
  private populateData(worksheet: ExcelJS.Worksheet, students: any[]): void {
    const sortedStudents = [...students].sort((a, b) => {
      if (a.rowPosition === b.rowPosition) {
        return a.columnPosition - b.columnPosition;
      }
      return a.rowPosition - b.rowPosition;
    });

    const rowsData = sortedStudents.map((s) => ({
      lastName: s.enrolement.student.lastName?.toUpperCase(),
      middleName: s.enrolement.student.middleName?.toUpperCase(),
      firstName: s.enrolement.student.firstName?.toUpperCase(),
      gender: s.enrolement.student.gender,
      class: s.enrolement.classRoom.identifier,
      row: s.rowPosition,
      col: s.columnPosition,
    }));

    worksheet.addRows(rowsData);
  }

  /**
   * Applique un design moderne et ergonomique au classeur
   */
  private applyAdvancedStyles(worksheet: ExcelJS.Worksheet): void {
    // 1. Figer la première ligne (pour garder les en-têtes visibles au scroll)
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // 2. Activer les filtres automatiques sur toutes les colonnes
    worksheet.autoFilter = {
      from: "A1",
      to: "G1",
    };

    // 3. Design de l'en-tête (Inspiré des tableaux de bord modernes)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B579A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = this.getSoftBorders();
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      row.height = 20;
      const isEvenRow = rowNumber % 2 === 0;

      row.eachCell((cell, colNumber) => {
        if (isEvenRow) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F6FB" },
          };
        }

        cell.border = this.getSoftBorders();

        if ([4, 5, 6, 7].includes(colNumber)) {
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

  /**
   * Retourne des bordures adoucies pour éviter l'effet "grille agressive"
   */
  private getSoftBorders(): Partial<ExcelJS.Borders> {
    const softLine: ExcelJS.Border = {
      style: "thin",
      color: { argb: "FFD4D4D4" },
    };
    return { top: softLine, left: softLine, bottom: softLine, right: softLine };
  }
}
