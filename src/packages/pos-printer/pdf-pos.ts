import { renderTemplate } from "@/packages/document-template";
import { defaultPrinterManagementService } from "@/packages/electron-utility";

export type Payload = {
  ticketRef: string;
  schoolName: string;
  address: string;
  studentName: string;
  feeTypeName: string;
  scheduleName: string;
  status: string;
  currency: string;
  amountPaid: number;
  totalDue: number;
  yearName: string;
  paymentMethod?: string;
  transactionReference?: string;
  date: Date;
  isPrinted?: boolean;
};

export async function printPdfReceipt(payload: Payload) {
  const htmlContent = await renderTemplate("facture.hbs", payload);
  await defaultPrinterManagementService.printHtmlContent(htmlContent, {
    pageSize: "A5",
    // Ou supprimez l'option si le format est déjà géré par le CSS @page :
    silent: true,
  });
}
