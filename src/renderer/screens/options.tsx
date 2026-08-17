"use client";

import * as React from "react";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetOptions } from "@/renderer/libs/queries/options";
import type { Option } from "@/packages/@core/data-access/db/schemas";
import { Button } from "@/renderer/components/ui/button";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  SearchTableToolbar,
  FilteredTableToolbarContainer,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import {
  optionColumns,
  enhanceColumns,
} from "@/renderer/components/tables/columns";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import {
  CreateOptionDialog,
  DeleteOptionDialog,
  UpdateOptionDialog,
  type OptionDialogProps,
} from "@/renderer/dialog-actions/option.dialog-actions";
import {
  PageContainer,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
  PageHeadDescription,
  PageContent,
} from "@/renderer/containers/page-container";

export interface RowActionsProps extends Pick<
  OptionDialogProps,
  "mutationKey"
> {
  option: Option;
}

const MENUS: ActionMenuConfig<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier l'option",
    icon: Pencil,
    dialog({ option, mutationKey }) {
      return (
        <UpdateOptionDialog
          mutationKey={mutationKey}
          optionId={option.optionId}
          defaultValues={option}
          optionName={option.optionName}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Dupliquer l'option",
    icon: Copy,
    dialog({ option, mutationKey }) {
      return (
        <CreateOptionDialog mutationKey={mutationKey} defaultValues={option} />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer l'option",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ option, mutationKey }) {
      return (
        <DeleteOptionDialog
          mutationKey={mutationKey}
          id={option.optionId}
          name={option.optionName}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given option row.
 * @param props - Component properties containing the option entity and mutation key.
 * @returns The rendered action menu component.
 */
export const RowAction: React.FC<RowActionsProps> =
  createActionMenus<RowActionsProps>(MENUS);

/**
 * Main application screen component for viewing and managing academic options in French.
 * @returns Rendered option management page layout with data table and toolbars.
 */
export const OptionPage: React.FC = () => {
  const { schoolId } = useSchoolContext();
  const { data: options = [], queryKey: mutationKey } = useGetOptions({
    where: { options: { schoolId: { $eq: schoolId } } },
  });

  const columns = React.useMemo(
    () =>
      enhanceColumns(optionColumns, {
        variant: "actions",
        renderRowAction: (option) => (
          <RowAction option={option} mutationKey={mutationKey} />
        ),
      }),
    [mutationKey],
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Gestion des options</PageHeadTitle>
          <PageHeadDescription>
            Consultez et administrez les options et filières de votre
            établissement.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <DataTable<Option>
          data={options}
          columns={columns}
          keyExtractor={(item) => item.optionId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="optionName"
                placeholder="Rechercher ex. Math-Physique"
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateOptionDialog
                mutationKey={mutationKey}
                defaultValues={{ schoolId }}
              >
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="mr-2 size-4" />
                  Ajouter une option
                </Button>
              </CreateOptionDialog>
            </div>
          </DataTableToolbar>

          <DataTableContent>
            <DataContentHead />
            <DataContentBody<Option> />
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageContent>
    </PageContainer>
  );
};
