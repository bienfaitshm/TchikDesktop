"use client";

import React from "react";
import { formatDate } from "@/packages/times";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

/**
 * Props for the InvoiceContainer component.
 */
export type InvoiceContainerProps = {
  title?: string;
  /** Optional date of the invoice (accepts Date object, ISO string, or null) */
  date?: string | Date | null;
  /** Optional custom reference identifier for the invoice */
  invoiceRef?: string;
  /** Optional school details override */
  school?: {
    name?: string;
    address?: string;
    town?: string;
  };
  /** Optional academic year details override */
  academicYear?: {
    yearName?: string;
  };
};

/**
 * Formats a given date input into localized French date, time, and year components.
 * @param date - The input date as a string, Date instance, or null.
 * @returns Formatted date, time, and year strings.
 */
export function formatInvoiceDateTime(date?: string | Date | null) {
  const targetDate = date ? new Date(date) : new Date();
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
}

/**
 * Displays a structured invoice container layout with header metadata and children content.
 * @param props - Component options including date, reference, optional config overrides, and children.
 * @returns The rendered JSX element representing the invoice ticket.
 */
export function InvoiceContainer({
  date,
  invoiceRef,
  school: customSchool,
  academicYear: customAcademicYear,
  children,
  title,
}: React.PropsWithChildren<InvoiceContainerProps>) {
  const config = useCurrentConfig();
  const school = customSchool ?? config.school;
  const academicYear = customAcademicYear ?? config.year;

  const formattedDateTime = formatInvoiceDateTime(date);

  return (
    <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 p-4 rounded shadow-md border border-slate-200 dark:border-zinc-800 flex flex-col gap-3 relative before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-[radial-gradient(circle,transparent_50%,#ffffff_50%)] before:bg-size-[8px_8px]">
      {/* Header section */}
      <div className="text-center flex flex-col gap-1 pb-2 border-b border-dashed border-slate-300 dark:border-zinc-800">
        <h3 className="font-bold text-xs tracking-wider uppercase">
          {school?.name || "ÉCOLE"}
        </h3>
        {school?.address && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {school.address}
          </p>
        )}
        {school?.town && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {school.town}
          </p>
        )}
        {academicYear?.yearName && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {academicYear.yearName}
          </p>
        )}
        <p className="text-sm font-medium">{title}</p>
        <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-dashed border-slate-300">
          <span>Date: {formattedDateTime.date}</span>
          <span>Heure: {formattedDateTime.time}</span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-zinc-400 text-left">
          Réf:{" "}
          <span className="uppercase font-bold">
            {invoiceRef || `POS-${formattedDateTime.year}-XXXX`}
          </span>
        </div>
      </div>
      {/* Body section */}
      {children}
    </div>
  );
}
