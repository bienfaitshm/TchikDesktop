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
  TableFacetedFilterItem,
  SearchTableToolbar,
  FilteredTableToolbarContainer,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import {
  optionColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import {
  ActionContainer,
  ActionTileCopy,
  ActionTileDelete,
  ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";

import {
  CreateOptionDialog,
  DeleteOptionDialog,
  UpdateOptionDialog,
  type OptionDialogProps,
} from "@/renderer/dialog-actions/option.dialog-actions";

import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";

const columns = enhanceColumnsExpandable(optionColumns);

interface OptionRowActionsProps extends Pick<OptionDialogProps, "mutationKey"> {
  option: Option;
}

/**
 * @description Actions de ligne
 */
const OptionRowActions = React.memo(
  ({ option, mutationKey }: OptionRowActionsProps) => {
    return (
      <ActionContainer className="lg:grid-cols-3">
        {/* Modification */}
        <UpdateOptionDialog
          mutationKey={mutationKey}
          optionId={option.optionId}
          defaultValues={option}
        >
          <ActionTileEdit />
        </UpdateOptionDialog>

        {/* Duplication */}
        <CreateOptionDialog mutationKey={mutationKey} defaultValues={option}>
          <ActionTileCopy />
        </CreateOptionDialog>

        {/* Suppression unifiée (Plus de Render Props obsolète !) */}
        <DeleteOptionDialog
          mutationKey={mutationKey}
          optionId={option.optionId}
          optionName={option.optionName}
        >
          <ActionTileDelete />
        </DeleteOptionDialog>
      </ActionContainer>
    );
  },
);

OptionRowActions.displayName = "OptionRowActions";

export const OptionPage = () => {
  const { schoolId } = useSchoolContext();
  const { data: rawOptions, queryKey: mutationKey } = useGetOptions({
    where: { schoolId },
  });
  const options = React.useMemo(() => rawOptions ?? [], [rawOptions]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4 ">
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
              <TableFacetedFilterItem
                title="Section"
                columnId="section"
                options={SECTION_OPTIONS}
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
            <DataContentBody<Option>>
              {({ row }) => (
                <ExpandableRow
                  row={row as any}
                  renderDetail={
                    <OptionRowActions
                      option={row.original}
                      mutationKey={mutationKey}
                    />
                  }
                />
              )}
            </DataContentBody>
          </DataTableContent>

          <DataTablePagination />
        </DataTable>
      </PageShell>
    </div>
  );
};
