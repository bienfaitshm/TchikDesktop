"use client";

import { memo, useMemo, useCallback } from "react";
import { AlertTriangle, Printer, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { School } from "@/packages/@core/data-access/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/packages/currency";
import { formatDate } from "@/packages/times";
import { useShallow } from "zustand/react/shallow";
import {
  useFastPaymentStore,
  useFastPaymentPreviewTicket,
  type Ticket,
} from "./hooks";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import type { FormSubmitHandler } from "@/renderer/libs/forms";

/**
 * Props interface for the InvoiceLivePreview component.
 */
export type InvoiceLivePreviewProps = {
  /** School entity information displayed on the ticket header. */
  school?: School;
  /** Callback triggered to execute the ticket printing process. */
  onPrint?: FormSubmitHandler<Ticket>;
  /** Indicates whether the print process is currently in progress. */
  isPrinting?: boolean;
};

/**
 * Validates whether a partial ticket contains all required properties for physical printing.
 * @param ticket - Partial ticket object to validate.
 * @returns Boolean indicating whether the ticket is valid and printable.
 */
const isPrintableTicket = (
  ticket: Partial<Ticket> | undefined,
): ticket is Ticket => {
  return Boolean(
    ticket &&
    ticket.ticketRef &&
    !ticket.ticketRef.endsWith("-PREV") &&
    ticket.studentName &&
    ticket.feeTypeName,
  );
};

/**
 * Formats a raw date or string into localized date, time, and year representations.
 * @param dateInput - Optional date object or ISO date string.
 * @returns Object containing formatted date, time, and year strings.
 */
const formatTicketDateTime = (dateInput?: string | Date | null) => {
  const targetDate = dateInput ? new Date(dateInput) : new Date();
  const validDate = Number.isNaN(targetDate.getTime())
    ? new Date()
    : targetDate;

  return {
    date: validDate.toLocaleDateString("fr-FR"),
    time: validDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    year: formatDate(validDate, "yyyy"),
  };
};

/**
 * Component rendering a real-time thermal receipt live preview card.
 * @param props - School details, print event handler, and printing state.
 * @returns Memoized React component presenting ticket details and print controls.
 */
export const InvoiceLivePreview = memo<InvoiceLivePreviewProps>(
  ({ school, onPrint, isPrinting }) => {
    const ticketPreview = useFastPaymentPreviewTicket();
    const { selectedStudent, markTicketAsPrinted } = useFastPaymentStore(
      useShallow((state) => ({
        selectedStudent: state.selectedStudent,
        markTicketAsPrinted: state.markTicketAsPrinted,
      })),
    );

    const isRealTicket = isPrintableTicket(ticketPreview);

    const formattedDateTime = useMemo(
      () => formatTicketDateTime(ticketPreview?.date),
      [ticketPreview?.date],
    );

    const handlePrint = useCallback(() => {
      if (!isPrintableTicket(ticketPreview)) return;

      const activeTicket = ticketPreview;

      onPrint?.(activeTicket, {
        reset() {
          markTicketAsPrinted(activeTicket.ticketRef);
        },
      });
    }, [ticketPreview, onPrint, markTicketAsPrinted]);

    return (
      <Card className="border-dashed bg-slate-50/50 dark:bg-zinc-900/40 shadow-sm sticky top-6 overflow-hidden">
        <CardHeader className="pb-3 flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/10 font-mono tracking-tight text-[10px]"
            >
              <span>
                {selectedStudent ? "APERÇU TICKET" : "DERNIER TICKET ÉMIS"}
              </span>
            </Badge>

            {ticketPreview?.isPrinted ? (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              >
                <CheckCircle2 className="size-3 text-emerald-600" /> Imprimé
              </Badge>
            ) : isRealTicket ? (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 border-amber-500/30 text-amber-600 bg-amber-500/10 animate-pulse"
              >
                En attente d'impression
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 font-mono text-xs">
          <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 p-4 rounded shadow-md border border-slate-200 dark:border-zinc-800 flex flex-col gap-3 relative before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-[radial-gradient(circle,transparent_50%,#ffffff_50%)] before:bg-size-[8px_8px]">
            {/* Header section */}
            <div className="text-center flex flex-col gap-1 pb-2 border-b border-dashed border-slate-300 dark:border-zinc-800">
              <h3 className="font-bold text-xs tracking-wider uppercase">
                {school?.name || ticketPreview?.schoolName || "ÉCOLE"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                {school?.address ||
                  ticketPreview?.address ||
                  "Adresse de l'établissement"}
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1">
                <span>Date: {formattedDateTime.date}</span>
                <span>Heure: {formattedDateTime.time}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 text-left">
                Réf:{" "}
                <span className="uppercase font-bold">
                  {ticketPreview?.ticketRef ||
                    `POS-${formattedDateTime.year}-XXXX`}
                </span>
              </div>
            </div>

            {/* Student information */}
            <div className="flex flex-col gap-1.5 min-h-15 py-1 text-[11px] border-b border-dashed border-slate-300 dark:border-zinc-800">
              <AnimatePresence mode="popLayout">
                {ticketPreview ? (
                  <motion.div
                    key={ticketPreview.studentName}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">
                        NOM :
                      </span>
                      <span className="font-bold text-right truncate max-w-40">
                        {ticketPreview.studentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">
                        CODE :
                      </span>
                      <span className="text-right">
                        {selectedStudent?.studentCode || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">
                        CLASSE :
                      </span>
                      <span className="text-right">
                        {selectedStudent?.classroom?.shortIdentifier || "—"}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-student"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-full text-slate-400 italic text-[10px] py-2"
                  >
                    Aucun ticket récent à afficher
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fee and payment details */}
            <div className="flex flex-col gap-2 min-h-10 py-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Désignation
              </div>
              <AnimatePresence mode="popLayout">
                {ticketPreview && (
                  <motion.div
                    key={ticketPreview.feeTypeName}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-start text-[11px]"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {ticketPreview.feeTypeName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        [{ticketPreview.scheduleName}]
                      </span>
                    </div>
                    <motion.span
                      key={ticketPreview.amountPaid}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-bold text-right"
                    >
                      {formatCurrency(ticketPreview.amountPaid ?? 0)}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Total paid */}
            <div className="border-t-2 border-dashed border-slate-900 dark:border-zinc-100 pt-3 mt-1">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-zinc-900 p-2 rounded">
                <span className="text-xs font-black uppercase tracking-wider">
                  TOTAL PAYÉ
                </span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={ticketPreview?.amountPaid}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-black text-sm text-emerald-600 dark:text-emerald-400"
                  >
                    {formatCurrency(ticketPreview?.amountPaid ?? 0)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer notice */}
            <div className="text-center text-[9px] text-slate-400 pt-2 flex flex-col gap-0.5">
              <p>CAISSE: CAISSE_A_{formattedDateTime.year}</p>
              <p className="tracking-widest mt-1">
                *** MERCI DE VOTRE VISITE ***
              </p>
            </div>
          </div>

          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="size-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed">
              Ce montant sera débité immédiatement. Cette opération est
              irréversible.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="bg-muted/40 p-3 rounded-b-xl flex gap-2">
          <LoadingButton
            onClick={handlePrint}
            disabled={!isRealTicket || isPrinting}
            loading={isPrinting}
            className="w-full font-sans text-xs font-semibold"
            size="sm"
            variant="outline"
          >
            <Printer className="size-3.5 mr-2" />
            {isRealTicket
              ? ticketPreview?.isPrinted
                ? "Réimprimer la facture"
                : "Imprimer la facture"
              : "Validez l'encaissement pour imprimer"}
          </LoadingButton>
        </CardFooter>
      </Card>
    );
  },
);

InvoiceLivePreview.displayName = "InvoiceLivePreview";
