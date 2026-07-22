import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import {
  FeeTypeDialogDeleteForm,
  FeeTypeDialogUpdateForm,
  type FeeTypeDialogProps,
} from "@/renderer/apps/finances/dialog";
import { feeTypeColumns } from "./fee-types.columns";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import React from "react";
import { Pencil, Trash2, ListOrdered } from "lucide-react";
import { ScheduleViewDialog } from "../dialog/schedule.detail-dialog";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

export interface FeeTypeRowActionsProps extends Pick<
  FeeTypeDialogProps,
  "mutationKey"
> {
  feeType: FeeType;
  schoolId: string;
}

const MENUS: ActionMenuConfig<FeeTypeRowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier le type de frais",
    icon: Pencil,
    dialog({ feeType, schoolId, mutationKey }) {
      return (
        <FeeTypeDialogUpdateForm
          schoolId={schoolId}
          mutationKey={mutationKey}
          feeTypeId={feeType.feeTypeId}
          defaultValues={feeType}
        />
      );
    },
  },
  {
    id: "create-schedule",
    label: "Voir les échéanciers",
    icon: ListOrdered,
    dialog({ feeType }) {
      return <ScheduleViewDialog feeType={feeType} />;
    },
  },
  {
    id: "delete",
    label: "Supprimer le type de frais",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ feeType, mutationKey }) {
      return (
        <FeeTypeDialogDeleteForm
          mutationKey={mutationKey}
          id={feeType.feeTypeId}
          name={feeType.name}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given fee type row.
 * @param props - Component properties containing the fee type entity, school ID, and mutation key.
 * @returns The rendered action menu component.
 */
export const RowAction: React.FC<FeeTypeRowActionsProps> =
  createActionMenus<FeeTypeRowActionsProps>(MENUS);

export type FeeTypeTableProps = {
  feeTypes?: FeeType[];
  mutationKey?: readonly unknown[];
  schoolId: string;
};

export const FeeTypeTable: React.FC<FeeTypeTableProps> = ({
  feeTypes = [],
  mutationKey,
  schoolId,
}) => {
  const serializedMutationKey = JSON.stringify(mutationKey);

  const columns = React.useMemo(
    () =>
      enhanceColumns(feeTypeColumns, {
        variant: "actions",
        renderRowAction: (feeType) => (
          <RowAction
            feeType={feeType}
            schoolId={schoolId}
            mutationKey={mutationKey}
          />
        ),
      }),
    [serializedMutationKey, schoolId],
  );

  return (
    <div className="w-full">
      <DataTable<FeeType>
        data={feeTypes}
        columns={columns}
        keyExtractor={(item) => item.feeTypeId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<FeeType> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
