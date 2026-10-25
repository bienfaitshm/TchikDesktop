/**
 * Formats the payment schedule status and progress description.
 * @param status - Current status of the schedule (e.g., UNPAID, PAID).
 * @param amountPaid - Amount already paid.
 * @param totalAmount - Total amount required.
 * @returns Formatted human-readable status description.
 */
export function formatScheduleStatus(
  status: string,
  amountPaid: number,
  totalAmount: number,
): string {
  if (status === "PAID") return "Payé en totalité";
  return `Payé : ${amountPaid} / ${totalAmount}`;
}
