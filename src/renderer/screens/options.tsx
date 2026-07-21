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
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
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

export interface RowActionsProps extends Pick<
  OptionDialogProps,
  "mutationKey"
> {
  option: Option;
}

const MENUS: ActionMenuConfig<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Edit option",
    icon: Pencil,
    dialog({ option, mutationKey }) {
      return (
        <UpdateOptionDialog
          mutationKey={mutationKey}
          optionId={option.optionId}
          defaultValues={option}
        />
      );
    },
  },

  {
    id: "duplicate",
    label: "Duplicate option",
    icon: Copy,
    dialog({ option, mutationKey }) {
      return (
        <CreateOptionDialog mutationKey={mutationKey} defaultValues={option} />
      );
    },
  },

  {
    id: "delete",
    label: "Delete option",
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
export const RowAction: React.FC<RowActionsProps> = createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing academic options.
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
    <div className="flex-1 w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section>
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Option Management
              </h1>
              <p className="text-sm text-muted-foreground">
                View and administer options and majors for your institution.
              </p>
            </header>
          </section>
        }
      >
        <DataTable<Option>
          data={options}
          columns={columns}
          keyExtractor={(item) => item.optionId}
        >
          <DataTableToolbar></DataTableToolbar>
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="optionName"
                placeholder="Search Ex. HSC"
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
                  Add Option
                </Button>
              </CreateOptionDialog>
            </div>
          </DataTableToolbar>

          <DataTableContent>
            <DataContentHead />
            <DataContentBody<Option>></DataContentBody>
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageShell>
    </div>
  );
};
