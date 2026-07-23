import type { FeeConfiguration } from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import {
  FeeConfigurationDialogDeleteForm,
  FeeConfigurationDialogUpdateForm,
  type FeeConfigDialogProps,
} from "@/renderer/apps/finances/dialog";
import { feeConfigColumns } from "./fee-config-table.columns";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import React from "react";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { Pencil, Trash2 } from "lucide-react";

interface FeeConfigurationRowActionsProps extends Pick<
  FeeConfigDialogProps,
  "mutationKey"
> {
  feeConfiguration: FeeConfiguration;
  schoolId: string;
  yearId: string;
}

export const RowAction: React.FC<FeeConfigurationRowActionsProps> = ({
  mutationKey,
  feeConfiguration,
  schoolId,
  yearId,
}) => (
  <ActionMenu
    trigger={<ButtonMenu />}
    dialogs={
      <>
        <MenuDialogWrapper id="edit">
          <FeeConfigurationDialogUpdateForm
            schoolId={schoolId}
            yearId={yearId}
            mutationKey={mutationKey}
            feeConfigId={feeConfiguration.feeConfigId}
            defaultValues={feeConfiguration}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="delete">
          <FeeConfigurationDialogDeleteForm
            mutationKey={mutationKey}
            id={feeConfiguration.feeConfigId}
            name={feeConfiguration.name}
          />
        </MenuDialogWrapper>
      </>
    }
  >
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

export type FeeConfigTableProps = {
  feeConfigurations?: FeeConfiguration[];
  mutationKey?: readonly unknown[];
  schoolId: string;
  yearId: string;
};

export const FeeConfigTable: React.FC<FeeConfigTableProps> = ({
  feeConfigurations = [],
  mutationKey,
  schoolId,
  yearId,
}) => {
  const serializedMutationKey = JSON.stringify(mutationKey);

  const columns = React.useMemo(
    () =>
      enhanceColumns(feeConfigColumns, {
        variant: "actions",
        renderRowAction: (feeConfiguration) => (
          <RowAction
            feeConfiguration={feeConfiguration}
            schoolId={schoolId}
            yearId={yearId}
            mutationKey={mutationKey}
          />
        ),
      }),
    [serializedMutationKey, schoolId],
  );

  return (
    <div className="w-full">
      <DataTable<FeeConfiguration>
        data={feeConfigurations}
        columns={columns}
        keyExtractor={(item) => item.feeConfigId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<FeeConfiguration> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
