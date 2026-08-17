import * as ExcelJS from "exceljs";
import { additionalJsContext as utils } from "./additional-context";

/** Default style constants to eliminate magic values. */
const DEFAULT_STYLES = {
  colors: {
    altRow: "FFE0F7F4",
    border: "FFB2D8D8",
  },
  heights: {
    officialHeader: 24,
    tableHeader: 26,
    dataRow: 20,
  },
} as const;

/** Cell or row styling configuration options. */
export interface CellStyleConfig {
  font?: Partial<ExcelJS.Font>;
  fill?: ExcelJS.Fill;
  alignment?: Partial<ExcelJS.Alignment>;
  border?: Partial<ExcelJS.Borders>;
  height?: number;
}

/** Definition of a table column. */
export interface ColumnDef {
  key: string;
  header: string;
  width: number;
  align?: "left" | "center" | "right";
}

/** Merged header row structure for document metadata. */
export interface MergedHeaderRow {
  text: string;
  style: CellStyleConfig;
}

/** Complete configuration for generating a worksheet. */
export interface SheetConfig<
  TData = Record<string, unknown>,
  TKey extends string = string,
> {
  sheetName: string;
  officialHeaders?: MergedHeaderRow[];
  columns: ColumnDef[];
  data: TData[];
  rowMapper: (item: TData, index: number) => Record<TKey, ExcelJS.CellValue>;
  tableStyle?: {
    headerRowStyle?: CellStyleConfig;
    altRowColor?: string;
    borderColor?: string;
  };
}

/**
 * Fluent builder for creating and styling ExcelJS workbooks.
 */
export class ExcelWorkbookBuilder {
  private readonly workbook: ExcelJS.Workbook;

  /**
   * Initializes a new Excel workbook builder instance.
   * @param creator - Creator metadata string for the workbook.
   */
  constructor(creator: string = "System") {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = creator;
    this.workbook.created = new Date();
  }

  /**
   * Sets the creator metadata of the workbook.
   * @param name - Creator name.
   */
  public setCreator(name: string): void {
    this.workbook.creator = name;
  }

  /**
   * Appends a new styled worksheet to the workbook based on declarative config.
   * @param config - Worksheet configuration payload.
   * @returns Current builder instance for chaining.
   */
  public addSheet<T>(config: SheetConfig<T>): this {
    if (!config || !Array.isArray(config.columns)) {
      throw new Error("Invalid sheet configuration: missing columns.");
    }

    const sheetName = this.sanitizeSheetName(config.sheetName || "Sheet");
    const sheet = this.workbook.addWorksheet(utils.truncate(sheetName, 31));
    const colCount = config.columns.length;

    if (config.officialHeaders?.length) {
      this.buildOfficialHeaders(sheet, config.officialHeaders, colCount);
    }

    this.buildTableHeaders(sheet, config.columns);
    this.buildDataRows(sheet, config);
    this.applyTableStyles(sheet, config);

    return this;
  }

  /**
   * Compiles the workbook and returns the raw binary buffer.
   * @returns Promise resolving to Excel buffer.
   */
  public async build(): Promise<ExcelJS.Buffer> {
    return await this.workbook.xlsx.writeBuffer();
  }

  /**
   * Sanitizes sheet names by removing forbidden characters and truncating.
   * @param name - Raw sheet name.
   * @returns Cleaned sheet name string.
   */
  private sanitizeSheetName(name: string): string {
    return name.replace(/[/\\?*[\]:]/g, "_").substring(0, 31);
  }

  /**
   * Renders official merged header rows at the top of the sheet.
   * @param sheet - Target worksheet instance.
   * @param headers - Array of merged header configurations.
   * @param colCount - Total column count for merging spans.
   */
  private buildOfficialHeaders(
    sheet: ExcelJS.Worksheet,
    headers: MergedHeaderRow[],
    colCount: number,
  ): void {
    headers.forEach((item) => {
      const row = sheet.addRow([item.text]);
      const rowNum = row.number;

      if (colCount > 1) {
        sheet.mergeCells(rowNum, 1, rowNum, colCount);
      }

      const cell = sheet.getCell(rowNum, 1);
      this.applyCellStyle(cell, item.style);
      row.height = item.style.height ?? DEFAULT_STYLES.heights.officialHeader;
    });
  }

  /**
   * Configures column metadata and explicitly writes the table header row below official headers.
   * @param sheet - Target worksheet instance.
   * @param columns - Array of column definitions.
   */
  private buildTableHeaders(
    sheet: ExcelJS.Worksheet,
    columns: ColumnDef[],
  ): void {
    sheet.columns = columns.map((col) => ({
      key: col.key,
      width: col.width,
    }));

    sheet.addRow(columns.map((col) => col.header));
  }

  /**
   * Appends data rows to the worksheet using the provided rowMapper.
   * @param sheet - Target worksheet instance.
   * @param config - Worksheet configuration payload.
   */
  private buildDataRows<T>(
    sheet: ExcelJS.Worksheet,
    config: SheetConfig<T>,
  ): void {
    if (!config.data || !Array.isArray(config.data)) return;

    config.data.forEach((item, idx) => {
      const mapped = config.rowMapper(item, idx);
      const rowValues = config.columns.map((col) => mapped[col.key] ?? "");
      sheet.addRow(rowValues);
    });
  }

  /**
   * Applies font, fill, alignment, and border styles to a specific cell.
   * @param cell - Target ExcelJS cell.
   * @param style - Style configuration object.
   */
  private applyCellStyle(cell: ExcelJS.Cell, style: CellStyleConfig): void {
    if (style.font) cell.font = style.font;
    if (style.fill) cell.fill = style.fill;
    if (style.alignment) cell.alignment = style.alignment;
    if (style.border) cell.border = style.border;
  }

  /**
   * Generates thin border definitions using a given ARGB color code.
   * @param color - ARGB color code string.
   * @returns Partial borders configuration object.
   */
  private generateBorder(color: string): Partial<ExcelJS.Borders> {
    const line: ExcelJS.Border = {
      style: "thin",
      color: { argb: color },
    };
    return { top: line, left: line, bottom: line, right: line };
  }

  /**
   * Applies global table formatting, freezing panes, filters, and row colors.
   * Alignments are strictly mapped to column definitions for header and data rows.
   * @param sheet - Target worksheet instance.
   * @param config - Worksheet configuration payload.
   */
  private applyTableStyles<T>(
    sheet: ExcelJS.Worksheet,
    config: SheetConfig<T>,
  ): void {
    const officialHeadersCount = config.officialHeaders?.length ?? 0;
    const tableHeaderRowNum = officialHeadersCount + 1;
    const dataRowCount = Array.isArray(config.data) ? config.data.length : 0;
    const styleOptions = config.tableStyle;

    sheet.views = [{ state: "frozen", ySplit: tableHeaderRowNum }];

    if (dataRowCount > 0) {
      sheet.autoFilter = {
        from: { row: tableHeaderRowNum, column: 1 },
        to: {
          row: tableHeaderRowNum + dataRowCount,
          column: config.columns.length,
        },
      };
    }

    const headerRow = sheet.getRow(tableHeaderRowNum);
    headerRow.height =
      styleOptions?.headerRowStyle?.height ??
      DEFAULT_STYLES.heights.tableHeader;
    const headerStyle = styleOptions?.headerRowStyle ?? {};

    const headerBorder = this.generateBorder(
      styleOptions?.borderColor ?? DEFAULT_STYLES.colors.border,
    );

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      this.applyCellStyle(cell, headerStyle);
      const colDef = config.columns[colNumber - 1];
      const defaultAlign = colDef?.align ?? "center";

      cell.alignment = {
        vertical: "middle",
        horizontal: defaultAlign,
        wrapText: true,
        ...headerStyle.alignment,
      };
      cell.border = cell.border ?? headerBorder;
    });

    if (dataRowCount === 0) return;

    const altColor = styleOptions?.altRowColor ?? DEFAULT_STYLES.colors.altRow;
    const cachedBorder = this.generateBorder(
      styleOptions?.borderColor ?? DEFAULT_STYLES.colors.border,
    );
    const altRowFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: altColor },
    };

    const columnAlignments: Partial<ExcelJS.Alignment>[] = config.columns.map(
      (col) => {
        const align = col.align ?? "left";
        return {
          vertical: "middle",
          horizontal: align,
          indent: align === "left" ? 1 : 0,
        };
      },
    );

    for (let i = 1; i <= dataRowCount; i++) {
      const row = sheet.getRow(tableHeaderRowNum + i);
      row.height = DEFAULT_STYLES.heights.dataRow;
      const isEven = i % 2 === 0;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (isEven) {
          cell.fill = altRowFill;
        }

        cell.border = cachedBorder;

        const alignStyle = columnAlignments[colNumber - 1];
        if (alignStyle) {
          cell.alignment = alignStyle;
        }
      });
    }
  }
}
