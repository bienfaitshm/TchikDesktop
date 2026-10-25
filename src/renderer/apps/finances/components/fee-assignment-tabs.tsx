import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetFeeAssignments } from "@/renderer/libs/queries/finances";
import { groupFeeAssignmentsByTypeName } from "@/renderer/libs/queries/finances/utils";
import { formatCurrency } from "@/packages/currency";
import { PaymentAction } from "../tables/payment-table.menus";
import { Button } from "@/renderer/components/ui/button";
import type { FeeAssignmentDTO } from "@/packages/@core/data-access/db";

import { TableCellPayment } from "./table-cell-payment";

export interface FeeAssignmentTabProps {
  /** The unique identifier of the student enrollment */
  enrollmentId: string;
}

interface FeeGroup {
  heading: string;
  options: FeeAssignmentDTO[];
}

interface GroupSummary {
  totalAmount: number;
  totalPaid: number;
  currency: string;
  progressPercent: number;
}

/**
 * Computes financial summary totals and progress percentage for a fee group.
 * @param options - Array of fee options within a group.
 * @returns Object containing total amount, total paid, currency, and progress percentage.
 */
export function calculateGroupSummary(
  options: FeeAssignmentDTO[],
): GroupSummary {
  const totalAmount = options.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = options.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const currency = options[0]?.currency ?? "USD";
  const progressPercent =
    totalAmount > 0
      ? Math.min(100, Math.round((totalPaid / totalAmount) * 100))
      : 0;

  return { totalAmount, totalPaid, currency, progressPercent };
}

interface FinancialProgressProps {
  summary: GroupSummary;
}

/**
 * Renders the financial progress bar and summary for a fee group.
 * @param summary - Financial summary object containing totals and progress.
 * @returns JSX Element representing the progress bar.
 */
const FinancialProgress: React.FC<FinancialProgressProps> = ({ summary }) => (
  <div className="bg-accent/30 rounded-lg p-2.5 border border-border/50 flex items-center justify-between text-xs gap-4">
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">Progress:</span>
      <span className="font-semibold text-foreground">
        {formatCurrency(summary.totalPaid, summary.currency)} /{" "}
        {formatCurrency(summary.totalAmount, summary.currency)}
      </span>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${summary.progressPercent}%` }}
        />
      </div>
      <span className="font-mono text-[11px] font-bold text-muted-foreground">
        {summary.progressPercent}%
      </span>
    </div>
  </div>
);

interface FeeCardProps {
  option: FeeAssignmentDTO;
}

/**
 * Renders an interactive fee assignment button styled as a card with status and amounts.
 * @param option - Fee option data item.
 * @returns JSX Element representing the interactive fee card button.
 */
const FeeCard: React.FC<FeeCardProps> = ({ option }) => {
  return (
    <div className="space-y-2">
      <h5 className="text-xs text-right">
        {option.feeSchedule.installmentName}
      </h5>
      <PaymentAction
        key={option.assignmentId}
        feeAssignment={option}
        schoolId={option.feeType?.schoolId}
        yearId={option.feeType?.yearId}
      >
        <Button className="w-full flex flex-col h-9 bg-accent/50 p-2 hover:bg-accent rounded-md">
          <TableCellPayment
            amountPaid={option.amountPaid}
            totalAmount={option.totalAmount}
            currency={option.currency}
            status={option.status}
          />
        </Button>
      </PaymentAction>
    </div>
  );
};

/**
 * Displays fee assignments grouped by type for a specific student enrollment.
 * @param enrollmentId - The enrollment identifier to fetch fee assignments for.
 * @returns JSX Element containing the tabbed fee interface.
 */
export const FeeAssignmentTab: React.FC<FeeAssignmentTabProps> = ({
  enrollmentId,
}) => {
  const { data: assignments = [] } = useGetFeeAssignments({
    where: { feeAssignments: { enrollmentId } },
    orderBy: [{ table: "feeSchedules", column: "createdAt", order: "asc" }],
    limit: 5000,
  });

  const grouped =
    (groupFeeAssignmentsByTypeName(assignments) as FeeGroup[]) || [];

  if (grouped.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-2">
        No fee configuration found for this student.
      </p>
    );
  }

  const defaultTab = grouped[0]?.heading ?? "";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="bg-muted/50 p-1 rounded-lg gap-1 border border-border/40 w-full justify-start h-auto flex-wrap">
        {grouped.map((item) => (
          <TabsTrigger
            key={item.heading}
            value={item.heading}
            className="text-xs px-3 py-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            {item.heading}
          </TabsTrigger>
        ))}
      </TabsList>

      {grouped.map((item) => {
        const summary = calculateGroupSummary(item.options);

        return (
          <TabsContent
            key={item.heading}
            value={item.heading}
            className="mt-3 focus-visible:outline-none space-y-3"
          >
            <FinancialProgress summary={summary} />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {item.options.map((option) => (
                <FeeCard key={option.assignmentId} option={option} />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default FeeAssignmentTab;
