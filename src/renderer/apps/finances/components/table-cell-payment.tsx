import {
  getFeeScheduleLabel,
  FEE_SCHEDULE_STATUS_ENUM,
  CURRENCY_ENUM,
} from "@/packages/@core/data-access/db/options";
import { formatCurrency } from "@/packages/currency";
import { cn } from "@/renderer/utils";
import { STATUS_INDICATORS } from "./payment-legend-colors";

export type TableCellPaymentProps = {
  status?: FEE_SCHEDULE_STATUS_ENUM;
  totalAmount?: number;
  amountPaid?: number;
  currency?: string;
};
export const TableCellPayment: React.FC<TableCellPaymentProps> = ({
  status = FEE_SCHEDULE_STATUS_ENUM.UNPAID,
  amountPaid = 0,
  currency = CURRENCY_ENUM.CDF,
  totalAmount = 0,
}) => {
  const statusLabel = getFeeScheduleLabel(status);
  return (
    <div className="w-full flex items-center justify-end gap-2">
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "font-mono text-xs font-medium tabular-nums text-foreground",
            status === FEE_SCHEDULE_STATUS_ENUM.EXEMPTED && "line-through",
          )}
        >
          {formatCurrency(amountPaid, currency)}
        </span>
        <span className="text-muted-foreground text-[8px]">
          sur {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      <span
        title={statusLabel}
        aria-label={`Statut : ${statusLabel}`}
        className={cn(
          "size-2 rounded-full shrink-0 ring-2 ring-background transition-transform group-hover/cell:scale-110",
          STATUS_INDICATORS[status],
        )}
      />
    </div>
  );
};
