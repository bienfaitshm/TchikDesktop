// Fichier: InvoiceDocumentHandler.ts

import z from "zod";
import {} from "@/commons/constants/enum";
import { AbstractDocumentHandler, ProcessHandleResult } from "./report";

const InvoiceParamsSchema = z.object({
  invoiceId: z.string().uuid("L'ID de la facture doit être un UUID valide."),
  format: z.enum(["PDF", "CSV"]).default("PDF"),
});

export class InvoiceDocumentHandler extends AbstractDocumentHandler {
  // Propriétés Abstraites implémentées
  public readonly key = "INVOICE_REPORT";
  public readonly type = "docx";
  public readonly title = "Rapport de Facturation Mensuel";
  public readonly description = "Exporte toutes les factures du mois spécifié.";
  public readonly requestName = "GET_MONTHLY_INVOICES";
  public readonly schema = InvoiceParamsSchema;

  // Méthode Abstraite implémentée
  public async processHandle(data: unknown): Promise<ProcessHandleResult> {
    // Le type de 'data' est connu ici grâce à la configuration du DataSystem
    const invoices = data as Array<any>;

    // 1. Logique de transformation et de génération du fichier
    // ... générer le PDF ...
    const generatedContent = Buffer.from(
      `Contenu du PDF pour ${invoices.length} factures`
    );

    return {
      success: true,
      result: {
        data: generatedContent,
        options: {
          defaultFilename: "Rapport-Factures-2025",
          allowedExtensions: ["pdf"],
          mimeType: "application/pdf",
        },
      },
    };
  }
}
