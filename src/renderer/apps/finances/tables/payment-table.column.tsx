import type { ColumnDef } from "@tanstack/react-table";
import type {
  AssignmentTableOfClassroom,
  User,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { formatCurrency } from "@/packages/currency";
import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";
import { createSelectColumn } from "@/renderer/components/tables/columns.utils";
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
  onSaveSuccess?(data: unknown): void;
}

// Bouton d'action contextuel à la cellule (apparaît au survol de la cellule)
export const CellAction: React.FC<FeeTypeRowActionsProps> = ({
  feeAssignment,
  schoolId,
  yearId,
  onSaveSuccess,
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
          <ViewPayementDetailDialog />
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
            onSuccess={onSaveSuccess}
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

const formatStudentName = (student: User): string => {
  return (
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ") || "Élève sans nom"
  );
};

// --- COLONNES STATIQUES ---
export const staticPaymentColumns: ColumnDef<AssignmentTableOfClassroom>[] = [
  createSelectColumn(),
  {
    accessorKey: "student",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Élève" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-sm text-foreground block truncate max-w-60">
        {formatStudentName(row.original.student)}
      </span>
    ),
    enableSorting: true,
  },
];

// --- COLONNES DYNAMIQUES ---
export const createPaymentColumns = (
  heads: { id: string; name: string }[],
  ctx: { schoolId: string; yearId: string },
): ColumnDef<AssignmentTableOfClassroom>[] => {
  const dynamicColumns: ColumnDef<AssignmentTableOfClassroom>[] = heads.map(
    (head) => ({
      id: `schedule_${head.id}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={head.name}
          className="justify-start text-left"
        />
      ),
      cell: ({ row }) => {
        const feeAssignment: FeeAssignment | null =
          row.original.payments[head.id] ?? null;

        if (!feeAssignment) {
          return (
            <span className="text-muted-foreground/30 text-xs block text-right pr-4">
              —
            </span>
          );
        }

        return (
          /* group/cell : Permet de cibler le survol de CETTE cellule uniquement */
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
              onSaveSuccess={(data) => {
                console.log("Payement successed", data);
              }}
              {...ctx}
            />
          </div>
        );
      },
      enableSorting: false,
    }),
  );

  return [...staticPaymentColumns, ...dynamicColumns];
};
