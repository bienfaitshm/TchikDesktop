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
import { getFeeScheduleLabel } from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { Button } from "@/renderer/components/ui/button";
import { Eye, CreditCard, Info, MoreVerticalIcon } from "lucide-react";
import {
  SavePaymentDialog,
  PaymentHistoryDialog,
  PaymentDetailDialog,
} from "../dialog";
import { STATUS_INDICATORS } from "../components/payment-legend-colors";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/renderer/components/menus/action-menus";

export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

const CELL_CONTEXT_MENUS: ActionMenuConfig<FeeTypeRowActionsProps>[] = [
  {
    id: "infos",
    icon: Info,
    label: "Détails de l'échéance",
    dialog: ({ feeAssignment }) => (
      <PaymentDetailDialog assignment={feeAssignment} />
    ),
  },
  {
    id: "view-history",
    icon: Eye,
    label: "Historique des paiements",
    dialog: ({ feeAssignment }) => (
      <PaymentHistoryDialog assignmentId={feeAssignment.assignmentId} />
    ),
  },
  {
    id: "pay",
    icon: CreditCard,
    label: "Enregistrer un paiement",
    dialog: ({ yearId, schoolId, feeAssignment, mutationKey }) => (
      <SavePaymentDialog
        yearId={yearId}
        schoolId={schoolId}
        totalAmount={feeAssignment.totalAmount}
        assignmentId={feeAssignment.assignmentId}
        amountPaid={feeAssignment.amountPaid}
        mutationKey={mutationKey}
      />
    ),
    disabled: ({ feeAssignment }) =>
      feeAssignment.amountPaid >= feeAssignment.totalAmount,
  },
];

/**
 * Action menu component rendered for an individual payment cell.
 */
export const CellAction = createActionMenus<FeeTypeRowActionsProps>(
  CELL_CONTEXT_MENUS,
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Menu d'actions de paiement"
    className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 transition-opacity"
  >
    <MoreVerticalIcon data-icon="inline-start" />
  </Button>,
);

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
        <span className="font-mono text-xs font-medium tabular-nums text-foreground">
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
    return createPaymentColumns(data?.head ?? [], (feeAssignment) => (
      <RenderPaymentCell
        feeAssignment={feeAssignment}
        schoolId={schoolId}
        yearId={yearId}
        mutationKey={mutationKey}
      />
    ));
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
