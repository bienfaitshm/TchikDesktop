import type { FeeConfigurationDTO } from "@/packages/@core/data-access/db";
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
import { Pencil, Trash2 } from "lucide-react";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

interface FeeConfigurationRowActionsProps extends Pick<
  FeeConfigDialogProps,
  "mutationKey"
> {
  feeConfiguration: FeeConfigurationDTO;
  schoolId: string;
  yearId: string;
}

const MENUS: ActionMenuConfig<FeeConfigurationRowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier la configuration",
    icon: Pencil,
    dialog({ feeConfiguration, schoolId, yearId, mutationKey }) {
      return (
        <FeeConfigurationDialogUpdateForm
          schoolId={schoolId}
          yearId={yearId}
          mutationKey={mutationKey}
          feeConfigId={feeConfiguration.feeConfigId}
          defaultValues={feeConfiguration}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer la configuration",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ feeConfiguration, mutationKey }) {
      return (
        <FeeConfigurationDialogDeleteForm
          mutationKey={mutationKey}
          id={feeConfiguration.feeConfigId}
          name={feeConfiguration.name}
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
export const RowAction: React.FC<FeeConfigurationRowActionsProps> =
  createActionMenus<FeeConfigurationRowActionsProps>(MENUS);

export type FeeConfigTableProps = {
  feeConfigurations?: FeeConfigurationDTO[];
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
      <DataTable<FeeConfigurationDTO>
        data={feeConfigurations}
        columns={columns}
        keyExtractor={(item) => item.feeConfigId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<FeeConfigurationDTO> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
