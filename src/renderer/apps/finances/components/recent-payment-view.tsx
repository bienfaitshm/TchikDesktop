import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import { formatCurrency } from "@/packages/currency";

/**
 * Interface representing formatted payment details for presentation.
 */
type Payment = {
  studentName: string;
  feeTypeName: string;
  amount: number;
  currency: CURRENCY_ENUM | string;
  classroomName: string;
  reference?: string | null;
  method?: PAYMENT_METHOD_ENUM | string;
  paymentId: string;
};

/**
 * Props for the RecentPaymentView component.
 * @template T The raw payment data type before formatting.
 */
export type RecentPaymentViewProps<T> = {
  /** List of payment items to display. */
  payments: T[];
  /** Function mapping raw payment data to the standardized Payment format. */
  formatData(payment: T): Payment;
};

/**
 * Localization strings for the RecentPaymentView component.
 */
const I18N = {
  noRecentPayments: "Aucun paiement récent enregistré.",
  fallbackInitial: "?",
} as const;

/**
 * Renders a list of recent payments or an empty state if no payments exist.
 * @template T The type of the raw payment data.
 * @param props - Component props containing payment list and formatting function.
 * @returns Rendered component displaying payment records or empty feedback.
 */
export function RecentPaymentView<T>({
  payments,
  formatData,
}: RecentPaymentViewProps<T>) {
  if (payments.length === 0) {
    return (
      <div>
        <p className="text-xs text-muted-foreground py-2">
          {I18N.noRecentPayments}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((paymentItem, index) => {
        const {
          amount,
          currency,
          feeTypeName,
          studentName,
          classroomName,
          method,
          reference,
          paymentId,
        } = formatData(paymentItem);

        const initial = studentName
          ? studentName[0].toUpperCase()
          : I18N.fallbackInitial;
        const key = paymentId || `payment-${index}`;

        return (
          <div
            key={key}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors -mx-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-xs font-bold text-foreground shadow-xs">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground leading-snug">
                  {studentName}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {feeTypeName} •{" "}
                  <span className="text-primary font-medium">
                    {classroomName}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-foreground whitespace-nowrap">
                {formatCurrency(amount, currency)}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {reference || method}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
