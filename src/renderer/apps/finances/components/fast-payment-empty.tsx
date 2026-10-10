"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserSearch,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULE_STATUS_ENUM,
} from "@/packages/@core/data-access/db/options";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/packages/currency";
import {
  EnrollmentOverview,
  type EnrollmentOverviewProps,
} from "./enrollment-overview";
import { Button } from "@/components/ui/button";
import { PaymentAction } from "../tables/payment-table.menus";
import type { FeeAssignment } from "@/packages/@core/data-access/db";
import { cn } from "@/renderer/utils";

export const CAN_HIDE_PAYMENT_FORM = [
  FEE_SCHEDULE_STATUS_ENUM.EXEMPTED,
  FEE_SCHEDULE_STATUS_ENUM.PAID,
  FEE_SCHEDULE_STATUS_ENUM.OVERPAID,
];

/**
 * Renders an animated loading indicator for fee processing states.
 * @returns The loading state visual fallback element.
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
 * Displays an empty-state prompt instructing the user to select a student enrollment.
 * @returns The empty selection fallback element for students.
 */
export const EmptySelectStudent: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
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
      {children}
    </motion.div>
  );
};

/**
 * Displays an empty-state prompt instructing the user to pick a fee category or schedule.
 * @returns The empty selection fallback element for fee types.
 */
export const EmptySelect: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
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
      {children}
    </motion.div>
  );
};

type FormatDateFn = (date?: Date | string | number | null) => string;

export interface PaymentOverviewProps {
  assignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  studentOverview?: EnrollmentOverviewProps;
  formatDate?: FormatDateFn;
}

/**
 * Formats a date object or string into a localized French date string.
 * @param date - Date object, ISO string, number timestamp, or null/undefined.
 * @returns Formatted date string or a fallback dash.
 */
function defaultFormatDate(date?: Date | string | number | null): string {
  if (!date) return "—";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Retrieves configuration settings mapped to fee assignment statuses.
 * @param assignment - The fee assignment object containing payment metrics.
 * @param formatDate - Function to format dates.
 * @returns A mapping object containing visual configurations per status.
 */
const getStatusConfigMap = (
  assignment: FeeAssignment,
  formatDate: FormatDateFn,
) => {
  const {
    amountPaid,
    totalAmount,
    updatedAt,
    createdAt,
    currency = CURRENCY_ENUM.CDF,
  } = assignment;
  const remainingAmount = Math.max(0, totalAmount - amountPaid);

  return {
    [FEE_SCHEDULE_STATUS_ENUM.EXEMPTED]: {
      title: "Exempté de paiement",
      description: "Cet élève a été exonéré du paiement de ce frais.",
      icon: ShieldCheck,
      cardClass:
        "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300",
      iconClass: "text-blue-600 dark:text-blue-400",
      badgeText: "Exonéré",
      badgeClass: "border-blue-300 text-blue-700 dark:text-blue-300",
      actionLabel: "Détails",
      actionVariant: "outline" as const,
      actionClass:
        "border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300",
    },
    [FEE_SCHEDULE_STATUS_ENUM.PAID]: {
      title: "L'élève est en ordre avec ce frais",
      description: `Montant réglé : ${amountPaid.toFixed(2)} ${currency}`,
      icon: CheckCircle2,
      cardClass:
        "border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-none",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      badgeText: `Dernier règlement : ${formatDate(updatedAt || createdAt)}`,
      badgeClass:
        "border-emerald-300 text-emerald-700 dark:text-emerald-300 text-[10px]",
      actionLabel: "Voir / Reçu",
      actionVariant: "outline" as const,
      actionClass:
        "border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300",
    },
    [FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID]: {
      title: "Paiement partiel en cours",
      description: `Acompte versé : ${formatCurrency(amountPaid, currency)} sur ${formatCurrency(totalAmount, currency)}`,
      icon: Clock,
      cardClass:
        "border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-none",
      iconClass: "text-amber-600 dark:text-amber-400",
      badgeText: `Reste : ${formatCurrency(remainingAmount, currency)}`,
      badgeClass:
        "border-amber-300 text-amber-800 dark:text-amber-300 text-[10px] font-mono",
      actionLabel: "Payer le solde",
      actionVariant: "default" as const,
      actionClass: "bg-amber-600 hover:bg-amber-700 text-white gap-1.5",
    },
    [FEE_SCHEDULE_STATUS_ENUM.UNPAID]: {
      title: "Paiement non effectué",
      description:
        "Aucun versement n'a encore été enregistré pour cette échéance.",
      icon: AlertCircle,
      cardClass: "border-muted bg-muted/20 text-muted-foreground",
      iconClass: "text-muted-foreground",
      badgeText: null,
      badgeClass: "",
      actionLabel: "Modifier le prix",
      actionVariant: "default" as const,
      actionClass: "gap-1.5",
    },
  };
};

/**
 * Renders an animated status summary card for a student's fee schedule assignment.
 * @param props - Component properties containing assignment details, identifiers, and optional children.
 * @returns The structured payment overview component with integrated actions.
 */
export const PaymentOverview: React.FC<
  React.PropsWithChildren<PaymentOverviewProps>
> = ({
  assignment,
  schoolId,
  yearId,
  formatDate = defaultFormatDate,
  children,
  studentOverview,
}) => {
  const { status } = assignment;
  const statusMap = getStatusConfigMap(assignment, formatDate);
  const currentConfig =
    statusMap[status] || statusMap[FEE_SCHEDULE_STATUS_ENUM.UNPAID];
  const IconComponent = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <Card
        className={cn("shadow-none ring-0 border", currentConfig.cardClass)}
      >
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <IconComponent
                className={cn("size-5 shrink-0", currentConfig.iconClass)}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-xs">
                  {currentConfig.title}
                </span>
                <span className="text-[11px] opacity-90">
                  {currentConfig.description}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentConfig.badgeText && (
                <Badge
                  variant="outline"
                  className={cn("h-6 px-2.5", currentConfig.badgeClass)}
                >
                  {currentConfig.badgeText}
                </Badge>
              )}
              <PaymentAction
                feeAssignment={assignment}
                schoolId={schoolId}
                yearId={yearId}
                mutationKey={["fin"]}
              >
                <Button
                  variant={currentConfig.actionVariant}
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-md text-xs",
                    currentConfig.actionClass,
                  )}
                >
                  <span>{currentConfig.actionLabel}</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </PaymentAction>
            </div>
          </div>
          {studentOverview && (
            <div className="mt-1 pt-2 border-t border-border/40">
              <EnrollmentOverview {...studentOverview} />
            </div>
          )}
        </CardContent>
      </Card>

      {!CAN_HIDE_PAYMENT_FORM.includes(status) && (
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
      )}
    </motion.div>
  );
};
