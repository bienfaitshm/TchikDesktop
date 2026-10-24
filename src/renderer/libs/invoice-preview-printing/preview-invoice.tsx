import React from "react";
import { useInvoiceStore, Invoice } from "./hooks";
import { FileText } from "lucide-react";

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
  const latestInvoice = useInvoiceStore((state) =>
    state.getLatestInvoice(type),
  );

  return (
    <div className="space-y-4">
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
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-accent/30 text-card-foreground">
      <div className="p-3 mb-3 rounded-full bg-background border shadow-xs">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-md tracking-tight mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
    </div>
  );
};
