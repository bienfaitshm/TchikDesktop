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
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { Pencil, Trash2, ListOrdered } from "lucide-react";
import { ScheduleViewDialog } from "../dialog/schedule.detail-dialog";

interface FeeTypeRowActionsProps extends Pick<
  FeeTypeDialogProps,
  "mutationKey"
> {
  feeType: FeeType;
  schoolId: string;
}

export const RowAction: React.FC<FeeTypeRowActionsProps> = ({
  mutationKey,
  feeType,
  schoolId,
}) => (
  <ActionMenu
    trigger={<ButtonMenu />}
    dialogs={
      <>
        <MenuDialogWrapper id="edit">
          <FeeTypeDialogUpdateForm
            schoolId={schoolId}
            mutationKey={mutationKey}
            feeTypeId={feeType.feeTypeId}
            defaultValues={feeType}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="create-schedule">
          <ScheduleViewDialog feeType={feeType} />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="delete">
          <FeeTypeDialogDeleteForm
            mutationKey={mutationKey}
            feeTypeId={feeType.feeTypeId}
            name={feeType.name}
          />
        </MenuDialogWrapper>
      </>
    }
  >
    <MenuDialogItem targetId="create-schedule" className="gap-2 cursor-pointer">
      <ListOrdered className="size-4 text-muted-foreground" />
      <span>Voir les échéanciers</span>
    </MenuDialogItem>

    <MenuDialogItem targetId="edit" className="gap-2 cursor-pointer">
      <Pencil className="size-4 text-muted-foreground" />
      <span>Modifier le type de frais</span>
    </MenuDialogItem>

    <DropdownMenuSeparator />

    <MenuDialogItem
      targetId="delete"
      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="size-4" />
      <span>Supprimer le type de frais</span>
    </MenuDialogItem>
  </ActionMenu>
);

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
