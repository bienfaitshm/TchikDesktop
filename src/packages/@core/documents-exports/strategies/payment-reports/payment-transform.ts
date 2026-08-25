import { formatCurrency } from "@/packages/currency";
import { formatDate } from "@/packages/times";

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
 * Extracts the most frequent currency from payments array or returns fallback currency.
 * @param payments - List of raw payment objects.
 * @param fallback - Default currency code when payments array is empty.
 * @returns The dominant ISO currency string.
 */
function getDominantCurrency(
  payments: RawPayment[],
  fallback: string = "CDF",
): string {
  if (payments.length === 0) return fallback;

  const frequencyMap = new Map<string, number>();
  for (const payment of payments) {
    const currency = payment.currencyReceived || fallback;
    frequencyMap.set(currency, (frequencyMap.get(currency) || 0) + 1);
  }

  let dominantCurrency = fallback;
  let maxCount = 0;

  for (const [currency, count] of frequencyMap.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantCurrency = currency;
    }
  }

  return dominantCurrency;
}

/**
 * Transforms raw payment records and school information into a formatted report structure.
 * @param input - The raw school data and array of payments to process.
 * @returns Structured report data with aggregated statistics and dynamically formatted values.
 */
export function transformPaymentReport(
  input: RawDataInput,
): TransformedPaymentReport {
  const { school, payments } = input;
  const mainCurrency = getDominantCurrency(payments);

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
    const currency = payment.currencyReceived || mainCurrency;

    totalAmount += amount;

    if (!Number.isNaN(timestamp)) {
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
      formattedAmount: formatCurrency(amount, currency),
      formattedCreatedAt: formatDate(payment.createdAt, "dd/MM/yyyy HH-mm-ss"),
      installmentName: payment.feeSchedule?.installmentName?.trim() || "",
    });
  }

  const hasValidDates =
    decoratedPayments.length > 0 &&
    minTimestamp !== Infinity &&
    maxTimestamp !== -Infinity;

  const startDate = hasValidDates ? formatDate(new Date(minTimestamp)) : "-";
  const endDate = hasValidDates ? formatDate(new Date(maxTimestamp)) : "-";

  const feeSummaries: CategorySummary[] = Array.from(
    feeTotalsMap.entries(),
  ).map(([name, amount]) => ({
    name,
    amount,
    formattedAmount: formatCurrency(amount, mainCurrency),
  }));

  const classSummaries: ClassSummary[] = Array.from(
    classTotalsMap.entries(),
  ).map(([className, amount]) => ({
    className,
    amount,
    formattedAmount: formatCurrency(amount, mainCurrency),
    percentage:
      totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : "0.0",
  }));

  return {
    school,
    stats: {
      totalAmount,
      formattedTotalAmount: formatCurrency(totalAmount, mainCurrency),
      totalTransactions: payments.length,
      startDate,
      endDate,
      generatedDate: formatDate(new Date()),
    },
    feeSummaries,
    classSummaries,
    payments: formattedPayments,
  };
}
