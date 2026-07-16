import type {
  AssignmentTableOfClassroom,
  TableClassroomPaymentAssignment,
} from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";

import type { FeeAssignment } from "@/packages/@core/data-access/db";
import { createPaymentColumns } from "./payment-table.column";
import React from "react";
import { formatCurrency } from "@/packages/currency";
import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { Button } from "@/renderer/components/ui/button";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import { Eye, CreditCard, Info, MoreVerticalIcon } from "lucide-react";
import {
  SavePaymentDialog,
  FeeAssignmentPaymentHistoryDialog,
  ViewPayementDetailDialog,
} from "../dialog";

// Configuration des pastilles de statut discrètes (Style Vercel/Linear)
export const STATUS_INDICATORS: Record<FEE_SCHEDULES_ENUM, string> = {
  [FEE_SCHEDULES_ENUM.PAID]: "bg-emerald-500",
  [FEE_SCHEDULES_ENUM.UNPAID]: "bg-rose-500",
  [FEE_SCHEDULES_ENUM.PARTIALLY_PAID]: "bg-amber-500",
  [FEE_SCHEDULES_ENUM.EXEMPTED]: "bg-slate-400",
  [FEE_SCHEDULES_ENUM.OVERPAID]: "bg-indigo-500",
};

interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

// Bouton d'action contextuel à la cellule (apparaît au survol de la cellule)
export const CellAction: React.FC<FeeTypeRowActionsProps> = ({
  feeAssignment,
  schoolId,
  yearId,
  mutationKey,
}) => (
  <ActionMenu
    trigger={
      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-background/80 backdrop-blur-xs shadow-sm border border-border/40"
      >
        <MoreVerticalIcon className="size-3.5" />
      </Button>
    }
    dialogs={
      <>
        <MenuDialogWrapper id="infos">
          <ViewPayementDetailDialog assignmentId={feeAssignment.assignmentId} />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="view-history">
          <FeeAssignmentPaymentHistoryDialog
            assignmentId={feeAssignment.assignmentId}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="pay">
          <SavePaymentDialog
            yearId={yearId}
            schoolId={schoolId}
            assignmentId={feeAssignment.assignmentId}
            mutationKey={mutationKey}
          />
        </MenuDialogWrapper>
      </>
    }
  >
    <MenuDialogItem targetId="infos" className="gap-2">
      <Info className="size-4 text-muted-foreground" />
      <span>Détails de l'échéance</span>
    </MenuDialogItem>
    <MenuDialogItem targetId="view-history" className="gap-2">
      <Eye className="size-4 text-muted-foreground" />
      <span>Historique des paiements</span>
    </MenuDialogItem>
    <MenuDialogItem targetId="pay" className="gap-2">
      <CreditCard className="size-4 text-muted-foreground" />
      <span>Enregistrer un paiement</span>
    </MenuDialogItem>
  </ActionMenu>
);

const RenderPaymentCell: React.FC<FeeTypeRowActionsProps> = ({
  feeAssignment,
  schoolId,
  yearId,
  mutationKey,
}) => {
  return (
    <div className="group/cell relative flex items-left justify-start py-2 pr-8 min-h-10 text-right select-none gap-3">
      {/* Informations financières compactes */}
      <div className="flex flex-col items-end">
        <span className="font-mono text-sm font-medium text-foreground">
          {formatCurrency(feeAssignment.amountPaid)}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Point de couleur minimaliste pour le statut */}
          <span
            className={cn(
              "size-1.5 rounded-full shrink-0",
              STATUS_INDICATORS[feeAssignment.status],
            )}
          />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            {getFeeScheduleLabel(feeAssignment.status)}
          </span>
        </div>
      </div>

      {/* Action contextuelle masquée, ne pope qu'au survol de la cellule */}
      <CellAction
        feeAssignment={feeAssignment}
        schoolId={schoolId}
        yearId={yearId}
        mutationKey={mutationKey}
      />
    </div>
  );
};

export type FeeConfigTableProps = {
  data?: TableClassroomPaymentAssignment["table"];
  mutationKey?: readonly unknown[];
  schoolId: string;
  yearId: string;
};

export const FeeClassroomPayementTable: React.FC<FeeConfigTableProps> = ({
  data,
  schoolId,
  yearId,
  mutationKey,
}) => {
  const columns = React.useMemo(() => {
    const _columns = createPaymentColumns(data?.head ?? [], (feeAssignment) => (
      <RenderPaymentCell
        feeAssignment={feeAssignment}
        schoolId={schoolId}
        yearId={yearId}
        mutationKey={mutationKey}
      />
    ));
    console.log(
      "[FeeClassroomPayementTable]: columns of tables, ",
      _columns.length,
      " created",
    );
    return _columns;
  }, []);

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
