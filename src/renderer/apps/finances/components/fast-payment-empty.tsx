"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserSearch } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULES_ENUM,
} from "@/packages/@core/data-access/db/options";
import { CheckCircle2, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/packages/currency";

/**
 * Renders an animated loading indicator for fee processing states.
 * @returns The loading state visual fallback.
 */
export const FastPaymentLoading: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
      className="h-12 w-full flex items-center justify-center gap-3 rounded-md bg-muted/30 border border-dashed border-muted p-3 text-muted-foreground text-xs font-medium"
    >
      <Spinner className="size-4 text-primary" />
      <span>Chargement des frais en cours...</span>
    </motion.div>
  );
};

/**
 * Displays a prompt prompting the cashier to select a student enrollment.
 * @returns The empty selection fallback element for students.
 */
export const EmptySelectStudent: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="h-16 w-full flex items-center justify-center gap-3 rounded-lg bg-slate-50/60 dark:bg-zinc-900/40 border border-dashed p-4 text-muted-foreground text-xs font-medium"
    >
      <UserSearch className="size-5 text-primary/70 shrink-0" />
      <p className="text-center">
        Veuillez sélectionner un élève pour poursuivre le processus
        d'encaissement.
      </p>
    </motion.div>
  );
};

/**
 * Displays an empty-state prompt instructing the user to pick a fee category or schedule.
 * @returns The empty selection fallback element for fee types.
 */
export const EmptySelect: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="h-14 w-full flex items-center justify-center gap-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-3 text-amber-800 dark:text-amber-300 text-xs font-medium"
    >
      <span>
        Veuillez sélectionner le type de frais et l'échéancier correspondant.
      </span>
    </motion.div>
  );
};

export interface AssignmentOverviewData {
  status: FEE_SCHEDULES_ENUM | string;
  amountPaid: number;
  totalAmount: number;
  updatedAt?: Date | string | null;
  currency?: CURRENCY_ENUM;
}

export interface PaymentOverviewProps {
  assignment: AssignmentOverviewData;
  formatDate?: (date?: Date | string | null) => string;
}

/**
 * Formats a date object or string into a readable French date.
 * @param date - Date object, ISO string, or null/undefined.
 * @returns Formatted date string.
 */
function defaultFormatDate(date?: Date | string | null): string {
  if (!date) return "—";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Renders an animated status summary card for a student's fee schedule assignment.
 * @param props - Component properties containing assignment details and render children.
 * @returns The structured payment overview component.
 */
export const PaymentOverview: React.FC<
  React.PropsWithChildren<PaymentOverviewProps>
> = ({ assignment, formatDate = defaultFormatDate, children }) => {
  const {
    status,
    amountPaid,
    totalAmount,
    updatedAt,
    currency = CURRENCY_ENUM.CDF,
  } = assignment;
  const remainingAmount = Math.max(0, totalAmount - amountPaid);

  if (status === FEE_SCHEDULES_ENUM.EXEMPTED) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Alert
          variant="default"
          className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300"
        >
          <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="font-semibold text-xs">
            Exempté de paiement
          </AlertTitle>
          <AlertDescription className="text-xs">
            Cet élève a été exonéré du paiement de ce frais.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (status === FEE_SCHEDULES_ENUM.PAID) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-none">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-primary dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-emerald-950 dark:text-emerald-200">
                  L'élève est en ordre avec ce frais
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                  Montant réglé : {amountPaid.toFixed(2)} $
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-300 text-emerald-700 dark:text-emerald-300 text-[10px]"
            >
              Dernier règlement : {formatDate(updatedAt)}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (status === FEE_SCHEDULES_ENUM.PARTIALLY_PAID) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-none">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-amber-950 dark:text-amber-200">
                  Paiement partiel en cours
                </span>
                <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  Acompte versé :{" "}
                  <strong className="font-mono">
                    {formatCurrency(amountPaid, currency)}
                  </strong>{" "}
                  sur{" "}
                  <strong className="font-mono">
                    {formatCurrency(totalAmount, currency)}
                  </strong>
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300 text-amber-800 dark:text-amber-300 text-[10px] font-mono"
            >
              Reste : {formatCurrency(remainingAmount, currency)}
            </Badge>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <Alert variant="default" className="border-muted bg-muted/20">
        <AlertCircle className="size-4 text-muted-foreground" />
        <AlertTitle className="font-semibold text-xs">
          Paiement non effectué
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Aucun versement n'a encore été enregistré pour cette échéance.
        </AlertDescription>
      </Alert>

      <AnimatePresence mode="wait">
        {children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
