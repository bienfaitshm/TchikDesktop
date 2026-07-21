"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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
  TActionMenu,
} from "@/components/menus/action-menus";
import {
  CreateOptionDialog,
  DeleteOptionDialog,
  UpdateOptionDialog,
  type OptionDialogProps,
} from "@/renderer/dialog-actions/option.dialog-actions";

import { Pencil, Copy, Trash2 } from "lucide-react";

interface RowActionsProps extends Pick<OptionDialogProps, "mutationKey"> {
  option: Option;
}

const MENUS: TActionMenu<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier la filière",
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
    label: "Modifier la filière",
    icon: Copy,
    dialog({ option, mutationKey }) {
      return (
        <CreateOptionDialog mutationKey={mutationKey} defaultValues={option} />
      );
    },
  },

  {
    id: "delete",
    label: "Supprimer la filière",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ option, mutationKey }) {
      return (
        <DeleteOptionDialog
          mutationKey={mutationKey}
          optionId={option.optionId}
          optionName={option.optionName}
        />
      );
    },
  },
];

export const RowAction: React.FC<RowActionsProps> = createActionMenus(MENUS);

export const OptionPage = () => {
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
                Gestion des filières
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualisez et administrez les options et filières de votre
                établissement.
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
                placeholder="Recherche Ex. HSC"
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
                  Ajouter une filière
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
