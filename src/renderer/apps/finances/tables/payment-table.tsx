import React from "react";
import type {
  AssignmentTableOfClassroom,
  TableClassroomPaymentAssignment,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import { createPaymentColumns } from "./payment-table.column";
import { formatCurrency } from "@/packages/currency";
import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { STATUS_INDICATORS } from "../components/payment-legend-colors";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import { RowAction, CellAction } from "./payment-table.menus";
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

/**
 * Renders a table cell displaying formatted currency and fee schedule status indicators in French.
 * @param props - Component properties containing fee assignment details and context parameters.
 * @returns The rendered payment cell component.
 */
export const RenderPaymentCell: React.FC<FeeTypeRowActionsProps> = ({
  feeAssignment,
  schoolId,
  yearId,
  mutationKey,
}) => {
  const statusLabel = getFeeScheduleLabel(feeAssignment.status);

  return (
    <div className="group/cell relative flex items-center justify-end gap-2 px-2 py-1.5 min-h-9 select-none rounded-md transition-colors hover:bg-muted/40">
      <div className="flex items-center">
        <CellAction
          feeAssignment={feeAssignment}
          schoolId={schoolId}
          yearId={yearId}
          mutationKey={mutationKey}
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-mono text-xs font-medium tabular-nums text-foreground",
            feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED &&
              "line-through",
          )}
        >
          {formatCurrency(feeAssignment.amountPaid, feeAssignment.currency)}
        </span>

        <span
          title={statusLabel}
          aria-label={`Statut : ${statusLabel}`}
          className={cn(
            "size-2 rounded-full shrink-0 ring-2 ring-background transition-transform group-hover/cell:scale-110",
            STATUS_INDICATORS[feeAssignment.status],
          )}
        />
      </div>
    </div>
  );
};

export type FeeTypeTableProps = {
  assigns?: AssignmentTableOfClassroom;
  mutationKey?: readonly unknown[];
  schoolId: string;
};

export type FeeConfigTableProps = {
  data?: TableClassroomPaymentAssignment["table"];
  mutationKey?: readonly unknown[];
  schoolId: string;
  yearId: string;
};

/**
 * Renders a data table representing payment assignments for a classroom.
 * @param props - Properties including dataset, school ID, year ID, and optional mutation keys.
 * @returns The rendered classroom payment table component.
 */
export const FeeClassroomPaymentTable: React.FC<FeeConfigTableProps> = ({
  data,
  schoolId,
  yearId,
  mutationKey,
}) => {
  const columns = React.useMemo(() => {
    const columns = createPaymentColumns(data?.head ?? [], (feeAssignment) => (
      <RenderPaymentCell
        feeAssignment={feeAssignment}
        schoolId={schoolId}
        yearId={yearId}
        mutationKey={mutationKey}
      />
    ));

    return enhanceColumns(columns, {
      variant: "actions",
      renderRowAction: (assign) => (
        <RowAction
          assign={assign}
          schoolId={schoolId}
          yearId={yearId}
          mutationKey={mutationKey}
        />
      ),
    });
  }, [data?.head, schoolId, yearId, mutationKey]);

  return (
    <div className="w-full">
      <DataTable<AssignmentTableOfClassroom>
        data={data?.body ?? []}
        columns={columns}
        keyExtractor={(item) => item.enrollmentId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<AssignmentTableOfClassroom> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
