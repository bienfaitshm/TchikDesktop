import * as ExcelJS from "exceljs";
import { additionalJsContext as utils } from "./additional-context";

/** Constantes de style par défaut (élimine les "magic values") */
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

/** Style d’une cellule ou d’une ligne */
export interface CellStyleConfig {
  font?: Partial<ExcelJS.Font>;
  fill?: ExcelJS.Fill;
  alignment?: Partial<ExcelJS.Alignment>;
  border?: Partial<ExcelJS.Borders>;
  height?: number;
}

/** Définition d’une colonne du tableau */
export interface ColumnDef {
  key: string;
  header: string;
  width: number;
  align?: "left" | "center" | "right";
}

export interface MergedHeaderRow {
  text: string;
  style: CellStyleConfig;
}

/** Configuration complète d’une feuille de calcul */
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

export class ExcelWorkbookBuilder {
  private readonly workbook: ExcelJS.Workbook;

  constructor(creator: string = "System") {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = creator;
    this.workbook.created = new Date();
  }

  /**
   * Ajoute une feuille à partir d'une configuration déclarative.
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
   * Génère le buffer final
   */
  public async build(): Promise<ExcelJS.Buffer> {
    return await this.workbook.xlsx.writeBuffer();
  }

  private sanitizeSheetName(name: string): string {
    return name.replace(/[/\\?*[\]:]/g, "_").substring(0, 31);
  }

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

  private buildTableHeaders(
    sheet: ExcelJS.Worksheet,
    columns: ColumnDef[],
  ): void {
    sheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width,
    }));
  }

  private buildDataRows<T>(
    sheet: ExcelJS.Worksheet,
    config: SheetConfig<T>,
  ): void {
    // Guard clause pour éviter les crashs si data est null
    if (!config.data || !Array.isArray(config.data)) return;

    config.data.forEach((item, idx) => {
      const mapped = config.rowMapper(item, idx);
      const rowValues = config.columns.map((col) => mapped[col.key] ?? "");
      sheet.addRow(rowValues);
    });
  }

  private applyCellStyle(cell: ExcelJS.Cell, style: CellStyleConfig): void {
    if (style.font) cell.font = style.font;
    if (style.fill) cell.fill = style.fill;
    if (style.alignment) cell.alignment = style.alignment;
    if (style.border) cell.border = style.border;
  }

  private generateBorder(color: string): Partial<ExcelJS.Borders> {
    const line: ExcelJS.Border = {
      style: "thin",
      color: { argb: color },
    };
    return { top: line, left: line, bottom: line, right: line };
  }

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

    // Cache de la bordure du header
    const headerBorder = this.generateBorder(
      styleOptions?.borderColor ?? DEFAULT_STYLES.colors.border,
    );

    headerRow.eachCell((cell) => {
      this.applyCellStyle(cell, headerStyle);
      cell.alignment = cell.alignment ?? {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
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

    for (let i = 1; i <= dataRowCount; i++) {
      const row = sheet.getRow(tableHeaderRowNum + i);
      row.height = DEFAULT_STYLES.heights.dataRow;
      const isEven = i % 2 === 0;

      row.eachCell((cell, colNumber) => {
        if (isEven) {
          cell.fill = altRowFill;
        }

        cell.border = cachedBorder;

        const colDef = config.columns[colNumber - 1];
        if (colDef) {
          const align = colDef.align ?? "left";
          cell.alignment = {
            vertical: "middle",
            horizontal: align,
            indent: align === "left" ? 1 : 0,
          };
        }
      });
    }
  }
}
