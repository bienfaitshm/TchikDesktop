import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";

export function formatScheduleStatus(
  status: FEE_SCHEDULES_ENUM,
  amountPaid: number,
  totalAmount: number,
): string {
  if (status === FEE_SCHEDULES_ENUM.PARTIALLY_PAID) {
    const remaining = totalAmount - amountPaid;
    return `Avance de ${amountPaid.toFixed(2)}, Reste: ${remaining.toFixed(2)}`;
  }
  return getFeeScheduleLabel(status);
}
