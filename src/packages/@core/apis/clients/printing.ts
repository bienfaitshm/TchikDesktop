import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import {} from "@/packages/@core/data-access/schema-validations";
import { PrinteToutes } from "../routes-constant";
import type { SystemPrinter } from "@/packages/pos-printer";

export type PrinterApis = Readonly<{
  getPrinters(): Promise<SystemPrinter[]>;
  checkPrinter(payload: any): Promise<unknown>;
  printInvoice(payload: any): Promise<unknown>;
  testPrinter(payload: any): Promise<unknown>;
}>;

export function createPrintingApis(ipcClient: IpcClient): PrinterApis {
  return {
    getPrinters() {
      return ipcClient.get(PrinteToutes.GET_PRINTERS);
    },

    checkPrinter(payload) {
      return ipcClient.post(PrinteToutes.CHECK_PRINTER, payload);
    },

    printInvoice(payload) {
      return ipcClient.post(PrinteToutes.PRINT_RECEIPT, payload);
    },
    testPrinter(payload) {
      return ipcClient.post(PrinteToutes.PRINT_TEST, payload);
    },
  } as const;
}
