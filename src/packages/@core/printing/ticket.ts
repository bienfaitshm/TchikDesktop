import {
  HttpException,
  HttpStatus,
  createErrorResponse,
} from "@/packages/electron-ipc-rest";
import { printPdfReceipt, Payload } from "@/packages/pos-printer";

export function printTicket(payload: Payload) {
  try {
    return printPdfReceipt(payload);
  } catch (error) {
    return createErrorResponse(error.message, HttpStatus.CONFLICT);
  }
}
