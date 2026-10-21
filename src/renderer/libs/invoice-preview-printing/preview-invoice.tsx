import React, { useState } from "react";
import { useInvoiceStore, Invoice } from "./hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, FileText, History } from "lucide-react";
import { formatDate } from "@/packages/times";

export type InvoicePreviewProps = {
  type?: string;
  messageInfo: React.ReactNode;
  children(invoice: Invoice): React.ReactNode;
};

/**
 * Manages the rendering of the latest invoice preview, fallback messages, and history dialog.
 * @param type - Optional filter for the invoice type.
 * @param messageInfo - Fallback content displayed when no invoice exists.
 * @param children - Render prop function passing the latest invoice.
 */
export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  type,
  messageInfo,
  children,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const invoices = useInvoiceStore((state) => state.invoices);
  const markAsPrinted = useInvoiceStore((state) => state.markAsPrinted);
  const latestInvoice = useInvoiceStore((state) =>
    state.getLatestInvoice(type),
  );

  const handlePrint = (id: string) => {
    markAsPrinted(id);
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              Historique des reçus
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-150">
            <DialogHeader>
              <DialogTitle>Liste des reçus enregistrés</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 py-4 pr-1">
              {invoices.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Aucun reçu disponible dans l'historique.
                </p>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {inv.invoiceRef}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {inv.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Date : {formatDate(inv.date)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={inv.isPrinted ? "secondary" : "default"}
                      onClick={() => handlePrint(inv.id)}
                      className="gap-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {inv.isPrinted ? "Ré-imprimer" : "Imprimer"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {latestInvoice ? children(latestInvoice) : messageInfo}
    </div>
  );
};

export type InvoiceEmptyMessageProps = {
  title?: string;
  description?: string;
};

/**
 * Renders a styled empty state placeholder when no invoice is present.
 * @param title - The heading text for the empty state.
 * @param description - Detailed explanatory text for the user.
 */
export const InvoiceEmptyMessage: React.FC<InvoiceEmptyMessageProps> = ({
  title = "Aperçu du reçu d'inscription",
  description = "Le détail du reçu s'affichera ici une fois l'inscription de l'élève enregistrée.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-muted/30 text-card-foreground">
      <div className="p-3 mb-3 rounded-full bg-background border shadow-xs">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
};
