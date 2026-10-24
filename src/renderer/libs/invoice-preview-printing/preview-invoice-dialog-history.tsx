"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, History } from "lucide-react";
import { formatDate } from "@/packages/times";
import { useInvoiceStore, type Invoice } from "./hooks";

/**
 * Properties for the InvoiceHistoryItem component.
 */
interface InvoiceHistoryItemProps {
  /** The invoice record to display. */
  invoice: Invoice;
  /** Callback triggered when print action is requested. */
  onPrint: (id: string) => void;
}

/**
 * Renders an individual invoice item row with metadata and print trigger.
 * @param props - Properties containing the invoice and print callback.
 * @returns The rendered invoice history row element.
 */
function InvoiceHistoryItem({
  invoice,
  onPrint,
}: InvoiceHistoryItemProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{invoice.invoiceRef}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {invoice.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Date : {formatDate(invoice.date)}
        </p>
      </div>
      <Button
        size="sm"
        variant={invoice.isPrinted ? "secondary" : "default"}
        onClick={() => onPrint(invoice.id)}
        className="gap-1.5"
      >
        <Printer className="h-3.5 w-3.5" />
        {invoice.isPrinted ? "Ré-imprimer" : "Imprimer"}
      </Button>
    </div>
  );
}

/**
 * Renders a dialog containing the complete history of saved invoices.
 * @returns The rendered invoice history dialog component.
 */
export function InvoiceHistoryDialog(): React.JSX.Element {
  const invoices = useInvoiceStore((state) => state.invoices);
  const markAsPrinted = useInvoiceStore((state) => state.markAsPrinted);

  const handlePrint = (id: string): void => {
    markAsPrinted(id);
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 rounded-full text-xs"
        >
          <History className="h-4 w-4" />
          <span>Historique des reçus</span>
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
            invoices.map((invoice) => (
              <InvoiceHistoryItem
                key={invoice.id}
                invoice={invoice}
                onPrint={handlePrint}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
