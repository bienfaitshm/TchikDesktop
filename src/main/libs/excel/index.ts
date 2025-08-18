import * as XLSX from "xlsx";
export * from "./utils";

type JsonToExcelBufferParams<T> = {
  data: T[];
  sheetName?: string;
};

export function jsonToExcelBuffer<TData>({
  data,
  sheetName = "Feuille1",
}: JsonToExcelBufferParams<TData>) {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}
