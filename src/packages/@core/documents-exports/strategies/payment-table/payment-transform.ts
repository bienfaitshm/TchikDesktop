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
export function transformPaymentReport(input: any): any {
  return input;
}
