export interface RawPayment {
  paymentId: string;
  amountReceived: number;
  currencyReceived: string;
  paymentMethod: string;
  transactionReference: string;
  createdAt: string;
  classroom: { shortIdentifier: string };
  student: { fullName: string; gender: string };
  feeType: { name: string };
  feeSchedule: { installmentName: string };
}

export interface RawSchool {
  schoolId: string;
  name: string;
  address: string;
  town: string;
  studyYear: { yearName: string };
}

export interface RawDataInput {
  school: RawSchool;
  payments: RawPayment[];
}

export interface FormattedPayment extends RawPayment {
  formattedAmount: string;
  formattedCreatedAt: string;
  installmentName: string;
}

export interface CategorySummary {
  name: string;
  amount: number;
  formattedAmount: string;
}

export interface ClassSummary {
  className: string;
  amount: number;
  formattedAmount: string;
  percentage: string;
}

export interface PaymentReportStats {
  totalAmount: number;
  formattedTotalAmount: string;
  totalTransactions: number;
  startDate: string;
  endDate: string;
  generatedDate: string;
}

export interface TransformedPaymentReport {
  school: RawSchool;
  stats: PaymentReportStats;
  feeSummaries: CategorySummary[];
  classSummaries: ClassSummary[];
  payments: FormattedPayment[];
}

/**
 * Formats a numeric amount using the specified locale formatting.
 * @param amount - The numeric value to format.
 * @param locale - BCP 47 language tag (defaults to "fr-FR").
 * @returns Formatted currency string representation.
 */
function formatCurrency(amount: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale).format(amount);
}

/**
 * Formats a date value into a localized string.
 * @param date - ISO date string or Date object.
 * @param options - Formatting options for Intl.DateTimeFormat.
 * @param locale - BCP 47 language tag (defaults to "fr-FR").
 * @returns Formatted date/time string.
 */
function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions,
  locale = "fr-FR",
): string {
  if (!date) return "";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(parsedDate);
}

/**
 * Transforms raw payment records and school information into a formatted report structure.
 * @param input - The raw school data and array of payments to process.
 * @returns Structured report data with aggregated statistics and formatted values.
 */
export function transformPaymentReport(
  input: RawDataInput,
): TransformedPaymentReport {
  const { school, payments } = input;

  const dateOnlyOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const decoratedPayments = payments.map((payment) => ({
    payment,
    timestamp: new Date(payment.createdAt).getTime(),
  }));

  decoratedPayments.sort((a, b) => b.timestamp - a.timestamp);

  let totalAmount = 0;
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  const feeTotalsMap = new Map<string, number>();
  const classTotalsMap = new Map<string, number>();

  const formattedPayments: FormattedPayment[] = [];

  for (const item of decoratedPayments) {
    const { payment, timestamp } = item;
    const amount = payment.amountReceived;

    totalAmount += amount;

    if (!isNaN(timestamp)) {
      if (timestamp < minTimestamp) minTimestamp = timestamp;
      if (timestamp > maxTimestamp) maxTimestamp = timestamp;
    }

    const feeName = payment.feeType?.name || "Autres";
    feeTotalsMap.set(feeName, (feeTotalsMap.get(feeName) || 0) + amount);

    const className = payment.classroom?.shortIdentifier || "Non attribué";
    classTotalsMap.set(
      className,
      (classTotalsMap.get(className) || 0) + amount,
    );

    formattedPayments.push({
      ...payment,
      formattedAmount: formatCurrency(amount),
      formattedCreatedAt: formatDate(payment.createdAt, dateTimeOptions),
      installmentName: payment.feeSchedule?.installmentName?.trim() || "",
    });
  }

  const hasValidDates =
    decoratedPayments.length > 0 &&
    minTimestamp !== Infinity &&
    maxTimestamp !== -Infinity;

  const startDate = hasValidDates
    ? formatDate(new Date(minTimestamp), dateOnlyOptions)
    : "-";
  const endDate = hasValidDates
    ? formatDate(new Date(maxTimestamp), dateOnlyOptions)
    : "-";

  const feeSummaries: CategorySummary[] = Array.from(
    feeTotalsMap.entries(),
  ).map(([name, amount]) => ({
    name,
    amount,
    formattedAmount: formatCurrency(amount),
  }));

  const classSummaries: ClassSummary[] = Array.from(
    classTotalsMap.entries(),
  ).map(([className, amount]) => ({
    className,
    amount,
    formattedAmount: formatCurrency(amount),
    percentage:
      totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : "0.0",
  }));

  return {
    school,
    stats: {
      totalAmount,
      formattedTotalAmount: formatCurrency(totalAmount),
      totalTransactions: payments.length,
      startDate,
      endDate,
      generatedDate: formatDate(new Date(), dateOnlyOptions),
    },
    feeSummaries,
    classSummaries,
    payments: formattedPayments,
  };
}
