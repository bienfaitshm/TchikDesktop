import {
  AbstractExportExtension,
  type RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  type ColumnDef,
  ExcelWorkbookBuilder,
  type SheetConfig,
} from "@/packages/document-template";
import type { CellValue } from "exceljs";

/** Primary brand color for main headers (Excel blue variant). */
const PRIMARY_COLOR = "FF00BFFF";
/** Text color used for contrast over primary headers. */
const HEADER_FONT_COLOR = "FFFFFFFF";
/** Background color applied to alternating table rows. */
const ALT_ROW_COLOR = "FFE0F7F4";
/** Border color applied to table grid cells. */
const BORDER_COLOR = "FFB2D8D8";

export interface SchoolInfo {
  name: string;
  yearName: string;
  address?: string;
  town?: string;
}

export interface SheetData<TData> {
  sheetName: string;
  title?: string;
  data: TData[];
  rowMapper(item: TData, idx: number): Record<string, CellValue>;
}

export interface BuildSheetParams<Data> {
  sheetName: string;
  schoolInfos: SchoolInfo;
  title?: string;
  columns: ColumnDef[];
  data: Data[];
  rowMapper(item: Data, idx: number): Record<string, CellValue>;
}

export interface SheetReportGeneratorService {
  description: string;
  columns: ColumnDef[];
}

/**
 * Builds the worksheet configuration payload for an Excel sheet including official metadata headers.
 * @param params - Parameters containing sheet data, column definitions, and school context.
 * @returns Configured SheetConfig object ready for workbook generation.
 */
export function buildSheet<Data>({
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
    columns,
    data,
    rowMapper: (value, idx) => ({
      ...rowMapper(value, idx),
      index: idx + 2,
    }),
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
 * Abstract extension base class responsible for exporting reports into Excel format.
 */
export abstract class SheetExportExtension<
  ReportPayload extends Record<string, unknown> = Record<string, unknown>,
> extends AbstractExportExtension<ReportPayload> {
  public readonly extension = DOCUMENT_EXTENSION.XLSX;
  public description?: string;
  protected columns: ColumnDef[];
  protected builder: ExcelWorkbookBuilder;

  /**
   * Initializes the export extension with report configuration.
   * @param config - Configuration service containing report description and column definitions.
   */
  constructor(config: SheetReportGeneratorService) {
    super();
    this.description = config.description;
    this.columns = config.columns;
    this.builder = new ExcelWorkbookBuilder();
  }

  /**
   * Extracts school information from the given report payload.
   * @param payload - Payload containing context for the report.
   * @returns Metadata regarding the school institution.
   */
  public abstract getSchoolInfos(payload: ReportPayload): SchoolInfo;

  /**
   * Transforms a single data element into structured sheet data.
   * @param item - Raw data item to be processed.
   * @returns Formatted SheetData object.
   */
  public abstract getSheetData<TItem>(item: TItem): SheetData<unknown>;

  /**
   * Extracts iterable items from the payload that represent individual sheets.
   * @param payload - Payload containing report parameters.
   * @returns Array of raw items.
   */
  public abstract getItemElement(payload: ReportPayload): unknown[];

  /**
   * Processes the report payload and compiles the final Excel file.
   * @param payload - Payload containing parameters required for generation.
   * @returns Raw file content representing the generated Excel workbook.
   */
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

    return (await this.builder.build()) as unknown as RawFileContent;
  }
}
