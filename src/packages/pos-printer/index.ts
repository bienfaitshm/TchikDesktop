import { ReceiptData, ReceiptPrinterService } from "./print";
// Récupération depuis tes variables d'environnement (.env)
const printerConfig = {
  ip: process.env.PRINTER_IP || "localhost",
  port: Number(process.env.PRINTER_PORT) || 9100,
  // encoding: "utf8",
};

const receiptData: ReceiptData = {
  receiptNumber: "RE-2026-00482",
  date: "15/07/2026 14:15",
  studentName: "KABANGE MUTOMBO Jonathan",
  className: "5ème Année Humanités (A)",
  fees: [
    { label: "Frais de Minerval", installment: "T1", amount: 150.0 },
    { label: "Frais de Laboratoire", installment: "Unique", amount: 45.0 },
  ],
  totalPaid: 195.0,
  balance: 0.0,
  verifyUrl: "https://ecole-sagesse.cd/verify/RE-2026-00482",
};

const printerService = new ReceiptPrinterService(printerConfig);

export async function printReceipt() {
  await printerService.printReceipt(receiptData);
}

// console.log("printReceipt");
// printReceipt();
