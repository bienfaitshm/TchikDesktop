"use client";

import React from "react";
import { formatDate } from "@/packages/times";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { cn } from "@/renderer/utils";

/**
 * Renders a horizontal divider with dashed border styling.
 * @param props - Standard HTML div attributes.
 * @returns A styled div representing a dashed line.
 */
export const DashedDivider: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "border-b border-dashed border-slate-300 dark:border-zinc-800",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Props for the RowTitle component.
 */
export type RowTitleProps = React.ComponentProps<"span">;

/**
 * Renders an uppercase, truncated inline title for row or card headers.
 * @param props - Standard HTML span element props.
 * @returns A styled span element.
 */
export const RowTitle: React.FC<RowTitleProps> = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        "text-xs uppercase font-bold truncate max-w-48 inline-block mb-2",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Container component that aligns label and value horizontally with space-between layout.
 * @param props - Standard HTML div attributes.
 * @returns A flexbox container for key-value row items.
 */
export const KeyValueRow: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return <div className={cn("flex justify-between", className)} {...props} />;
};

/**
 * Label element for the left side of a KeyValueRow.
 * @param props - Standard HTML span attributes.
 * @returns Styled text component for labels.
 */
export const KeyLabel: React.FC<React.ComponentProps<"span">> = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "text-xs uppercase text-slate-500 dark:text-zinc-400",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Value element for the right side of a KeyValueRow.
 * @param props - Standard HTML span attributes.
 * @returns Right-aligned text component for values.
 */
export const ValueText: React.FC<React.ComponentProps<"span">> = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn("text-xs uppercase text-right", className)}
      {...props}
    />
  );
};

/**
 * Formats a given date input into localized date, time, and year string components.
 * @param date - Raw date string, Date instance, or null.
 * @param locale - BCP 47 language tag for formatting (defaults to "fr-FR").
 * @returns An object containing formatted date, time, and year values.
 */
export function formatInvoiceDateTime(
  date?: string | Date | null,
  locale = "fr-FR",
) {
  const targetDate = date ? new Date(date) : new Date();
  const validDate = Number.isNaN(targetDate.getTime())
    ? new Date()
    : targetDate;

  return {
    date: validDate.toLocaleDateString(locale),
    time: validDate.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    year: formatDate(validDate, "yyyy"),
  };
}

/**
 * Props for the InvoiceCardRoot component.
 */
export type InvoiceCardRootProps = React.ComponentProps<"div">;

/**
 * Root layout container for invoice tickets with receipt-style top serration.
 * @param props - HTML div attributes including children content.
 * @returns Styled wrapper element for invoice structure.
 */
export const InvoiceCardRoot: React.FC<InvoiceCardRootProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 p-4 rounded shadow-md border border-slate-200 dark:border-zinc-800 flex flex-col gap-3 relative before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-[radial-gradient(circle,transparent_50%,#ffffff_50%)] before:bg-size-[8px_8px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Props for the InvoiceCardHeader component.
 */
export type InvoiceCardHeaderProps = React.ComponentProps<"div">;

/**
 * Header section wrapper for school branding and title information.
 * @param props - HTML div attributes and child elements.
 * @returns Centered header block with bottom spacing.
 */
export const InvoiceCardHeader: React.FC<InvoiceCardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "text-center flex flex-col gap-1 pb-2 border-b border-dashed border-slate-300 dark:border-zinc-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Props for the InvoiceCardMeta component.
 */
export type InvoiceCardMetaProps = {
  date?: string | Date | null;
  invoiceRef?: string;
  locale?: string;
  className?: string;
};

/**
 * Renders date, time, and reference metadata for an invoice.
 * @param props - Metadata values including date, invoiceRef, and optional locale.
 * @returns Structured date and reference line items.
 */
export const InvoiceCardMeta: React.FC<InvoiceCardMetaProps> = ({
  date,
  invoiceRef,
  locale = "fr-FR",
  className,
}) => {
  const formattedDateTime = formatInvoiceDateTime(date, locale);

  return (
    <div className={cn("flex flex-col gap-1 pt-1", className)}>
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-dashed border-slate-300 dark:border-zinc-800">
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
  );
};

/**
 * Compound component for flexible invoice composition.
 */
export const InvoiceCard = Object.assign(InvoiceCardRoot, {
  Header: InvoiceCardHeader,
  Meta: InvoiceCardMeta,
  Row: KeyValueRow,
  Label: KeyLabel,
  Value: ValueText,
  Divider: DashedDivider,
});

/**
 * Props for the high-level InvoiceContainer component.
 */
export type InvoiceContainerProps = {
  title?: string;
  date?: string | Date | null;
  invoiceRef?: string;
  school?: {
    name?: string;
    address?: string;
    town?: string;
  };
  academicYear?: {
    yearName?: string;
  };
};

/**
 * Pre-composed invoice container connecting global store configuration with invoice UI.
 * @param props - Invoice parameters, optional school/academic overrides, and children content.
 * @returns A fully assembled invoice component.
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

  return (
    <InvoiceCard>
      <InvoiceCard.Header>
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
        {title && <p className="text-sm font-medium">{title}</p>}
        <InvoiceCard.Meta date={date} invoiceRef={invoiceRef} />
      </InvoiceCard.Header>
      {children}
    </InvoiceCard>
  );
}
