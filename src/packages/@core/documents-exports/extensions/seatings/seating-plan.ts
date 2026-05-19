import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import * as ExcelJS from "exceljs";
import type { TSeatingSessionGrouped } from "@/packages/@core/data-access/db/queries/seating-queries";
import { TSchool } from "@/packages/@core/data-access/db/schemas/types";

export class SeatingPlanBySheetExcelExportExtension extends AbstractExportExtension<any> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description = "Génère une feuille Excel par local.";

  public async process({
    assignment,
  }: TSchool & {
    assignment: TSeatingSessionGrouped;
  }): Promise<RawFileContent> {
    const workbook = new ExcelJS.Workbook();

    assignment.assignments.forEach((room) => {
      const safeName = room.name.replace(/[/\\?*\[\]]/g, "_");
      const worksheet = workbook.addWorksheet(safeName);

      // Configuration des colonnes
      worksheet.columns = [
        { header: "Nom", key: "lastName", width: 20 },
        { header: "Postnom", key: "middleName", width: 20 },
        { header: "Prénom", key: "firstName", width: 20 },
        { header: "Sexe", key: "gender", width: 10 },
        { header: "Classe", key: "class", width: 15 },
        { header: "Ligne", key: "row", width: 10 },
        { header: "Colonne", key: "col", width: 10 },
      ];

      // Ajout des données
      const rowsData = room.students.map((s) => ({
        lastName: s.enrolement.student.lastName,
        middleName: s.enrolement.student.middleName,
        firstName: s.enrolement.student.firstName,
        gender: s.enrolement.student.gender,
        class: s.enrolement.classRoom.identifier,
        row: s.rowPosition,
        col: s.columnPosition,
      }));

      worksheet.addRows(rowsData);

      // Stylisation avancée
      this.applyHeaderStyles(worksheet);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as RawFileContent;
  }

  private applyHeaderStyles(worksheet: ExcelJS.Worksheet): void {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FF000000" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Ajout de bordures sur toutes les cellules remplies
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  }
}
