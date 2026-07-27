import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";
import { formatCurrency } from "@/packages/currency";

/**
 * Formats a fee schedule status into a localized human-readable label.
 * Displays advance and remaining balance for partial payments, or standard status label otherwise.
 *
 * @param status - Current fee schedule status enumeration value.
 * @param amountPaid - Total cumulative amount paid toward the schedule.
 * @param totalAmount - Total amount assigned for the schedule.
 * @returns Formatted schedule status description string.
 */
export function formatScheduleStatus(
  status: FEE_SCHEDULES_ENUM,
  amountPaid: number,
  totalAmount: number,
): string {
  if (status === FEE_SCHEDULES_ENUM.PARTIALLY_PAID) {
    const remaining = Math.max(0, totalAmount - amountPaid);
    return `Avance de ${formatCurrency(amountPaid)}, Reste: ${formatCurrency(remaining)}`;
  }
  return getFeeScheduleLabel(status);
}
