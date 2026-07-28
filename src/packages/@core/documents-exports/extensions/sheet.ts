import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  type ColumnDef,
  ExcelWorkbookBuilder,
  SheetConfig,
} from "@/packages/document-template";
import type { CellValue } from "exceljs";

/**
 * Couleur d’en‑tête sobre, proche du bleu standard d’Excel.
 * Choisie pour un bon contraste avec le texte noir.
 */
const PRIMARY_COLOR = "FF00BFFF";
const HEADER_FONT_COLOR = "FFFFFFFF";
const ALT_ROW_COLOR = "FFE0F7F4";
const BORDER_COLOR = "FFB2D8D8";

export type SchoolInfo = {
  name: string;
  yearName: string;
  address?: string;
  town?: string;
};

export type SheetData<TData> = {
  sheetName: string;
  title?: string;
  data: TData[];
  rowMapper(item: TData, idx: number): Record<string, CellValue>;
};

export type BuildSheetParams<Data> = {
  sheetName: string;
  schoolInfos: SchoolInfo;
  title?: string;
  columns: ColumnDef[];
  data: Data[];
  rowMapper(item: Data, idx: number): Record<string, CellValue>;
};

/**
 * Construit la configuration d’une feuille Excel correspondant
 * à un local et à ses élèves.
 *
 * @param room - Les données du local (nom, liste d’élèves, etc.)
 * @returns La configuration prête à être ajoutée au classeur.
 */
function buildSheet<Data>({
  data,
  rowMapper,
  sheetName,
  schoolInfos,
  title,
  columns,
}: BuildSheetParams<Data>): SheetConfig<Data, string> {
  return {
    sheetName,
    officialHeaders: [
      {
        text: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO",
        style: {
          height: 28,
          alignment: { horizontal: "center" },
          font: { color: { argb: "FF222222" }, bold: true, size: 24 },
        },
      },
      {
        text: "MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE",
        style: {
          height: 28,
          alignment: { horizontal: "center" },
          font: { color: { argb: "FF222222" }, bold: true, size: 12 },
        },
      },
      {
        text: (schoolInfos.name ?? "").toUpperCase(),
        style: {
          height: 24,
          alignment: { horizontal: "center" },
          font: { color: { argb: "FF222222" }, bold: true, size: 13 },
        },
      },
      {
        text: `${schoolInfos.address ?? ""}, ${schoolInfos.town ?? ""}`,
        style: {
          alignment: { horizontal: "center" },
          height: 22,
          font: { color: { argb: "FF333333" }, bold: false, size: 11 },
        },
      },
      {
        text: title ?? "",
        style: {
          height: 24,
          alignment: { horizontal: "center" },
          font: { color: { argb: PRIMARY_COLOR }, bold: true, size: 12 },
        },
      },
    ],
    columns: columns,
    data: data,

    rowMapper: (value, idx) => {
      return {
        ...rowMapper(value, idx),
        index: idx + 2,
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

export type SheetReportGeneratorService = {
  description: string;
  columns: ColumnDef[];
};

/**
 * Extension responsable de la génération de la liste des élèves sur Excel.
 * Le nom reste agnostique du format (pas de suffixe 'Excel').
 */
export class SheetExportExtension<
  ReportPayload extends {} = {},
> extends AbstractExportExtension<ReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.XLSX;
  public description?: string | undefined;
  protected columns: ColumnDef[];
  protected builder: ExcelWorkbookBuilder;
  constructor(config: SheetReportGeneratorService) {
    super();
    this.description = config.description;
    this.columns = config.columns;
    this.builder = new ExcelWorkbookBuilder();
  }

  public getSchoolInfos(payload: ReportPayload): SchoolInfo {
    throw new Error("Method not implemented.");
  }

  public getSheetData(item: unknown): SheetData<unknown> {
    throw new Error("Method not implemented.");
  }

  public getItemElement(payload: ReportPayload): unknown[] {
    throw new Error("Method not implemented.");
  }

  public async process(payload: ReportPayload): Promise<RawFileContent> {
    const schoolInfos = this.getSchoolInfos(payload);
    const creator = `Tchik-${schoolInfos.name ?? "App"}`;
    this.builder.setCreator(creator);

    const elements = this.getItemElement(payload);

    elements.forEach((data) => {
      const sheet = this.getSheetData(data);
      this.builder.addSheet(
        buildSheet({
          columns: this.columns,
          data: sheet.data,
          rowMapper: sheet.rowMapper,
          schoolInfos,
          sheetName: sheet.sheetName,
          title: sheet.title,
        }),
      );
    });

    return this.builder.build() as unknown as RawFileContent;
  }
}
