import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
// import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import type { TSeatingSessionGrouped } from "@/packages/@core/data-access/db/queries/seating-queries";

// type RawFileContent = Buffer;

async function processFileContent(
  filePromise: Promise<Buffer<ArrayBufferLike>>,
): Promise<RawFileContent> {
  const content: RawFileContent = await filePromise;
  return content;
}

export class SeatingPlanExcelExportExtension extends AbstractExportExtension {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description = undefined;

  public async process(data: TSeatingSessionGrouped) {
    const flatData = data.assignments.flatMap((room) =>
      room.students.map((student) => ({
        Local: room.name,
        Nom: student.enrolement.student.lastName,
        Prénom: student.enrolement.student.firstName,
        Classe: student.enrolement.classRoom.identifier,
        Ligne: student.rowPosition,
        Colonne: student.columnPosition,
        "Code Élève": student.enrolement.studentCode,
      })),
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plan de salle");

    worksheet.columns = [
      { header: "Local", key: "Local", width: 15 },
      { header: "Nom", key: "Nom", width: 20 },
      { header: "Prénom", key: "Prénom", width: 20 },
      { header: "Classe", key: "Classe", width: 15 },
      { header: "Ligne", key: "Ligne", width: 10 },
      { header: "Colonne", key: "Colonne", width: 10 },
      { header: "Code Élève", key: "Code Élève", width: 15 },
    ];

    worksheet.addRows(flatData);

    worksheet.getRow(1).font = { bold: true };

    return await processFileContent(workbook.xlsx.writeBuffer());
  }
}

export class SeatingPlanBySheetExcelExportExtension extends AbstractExportExtension<any> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  readonly description =
    "Elle génère automatiquement une feuille de calcul distincte pour chaque local";

  public async process(data: any): Promise<RawFileContent> {
    const workbook = new ExcelJS.Workbook();

    // On parcourt chaque local pour créer sa propre feuille
    data.assignments.forEach((room) => {
      // 1. Créer la feuille nommée selon le nom du local
      // On nettoie le nom pour éviter les caractères invalides dans Excel (ex: '/' ou ':')
      const safeName = room.name.replace(/[/\\?*\[\]]/g, "_");
      const worksheet = workbook.addWorksheet(safeName);

      // 2. Définir les colonnes
      worksheet.columns = [
        { header: "Nom", key: "lastName", width: 20 },
        { header: "Prénom", key: "firstName", width: 20 },
        { header: "Classe", key: "class", width: 15 },
        { header: "Ligne", key: "row", width: 10 },
        { header: "Colonne", key: "col", width: 10 },
      ];

      // 3. Ajouter les données des étudiants de ce local
      const rows = room.students.map((s) => ({
        lastName: s.enrolement.student.lastName,
        firstName: s.enrolement.student.firstName,
        class: s.enrolement.classRoom.identifier,
        row: s.rowPosition,
        col: s.columnPosition,
      }));

      worksheet.addRows(rows);

      // 4. Styliser l'en-tête de la feuille
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    console.log("SeatingPlanBySheetExcelExportExtension", workbook.xlsx);

    return workbook.xlsx.writeBuffer();
  }
}
