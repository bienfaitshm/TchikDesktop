"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import type { TOptionAttributes as TOption } from "@/packages/@core/data-access/schema-validations";
import { useGetOptions } from "@/renderer/libs/queries/option";

import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  TableFacetedFilterItem,
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

interface OptionRowActionsProps extends Pick<
  OptionDialogProps,
  "queryKeysToInvalidate"
> {
  option: TOption;
}

/**
 * @description Actions de ligne
 */
const OptionRowActions = React.memo(
  ({ option, queryKeysToInvalidate }: OptionRowActionsProps) => {
    return (
      <ActionContainer className="lg:grid-cols-3">
        {/* Modification */}
        <UpdateOptionDialog
          queryKeysToInvalidate={queryKeysToInvalidate}
          optionId={option.optionId}
          defaultValues={option}
        >
          <ActionTileEdit />
        </UpdateOptionDialog>

        {/* Duplication */}
        <CreateOptionDialog
          queryKeysToInvalidate={queryKeysToInvalidate}
          defaultValues={option}
        >
          <ActionTileCopy />
        </CreateOptionDialog>

        {/* Suppression unifiée (Plus de Render Props obsolète !) */}
        <DeleteOptionDialog
          queryKeysToInvalidate={queryKeysToInvalidate}
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
  const { data: rawOptions, queryKey: queryKeysToInvalidate } = useGetOptions({
    where: { schoolId },
  });
  const options = React.useMemo(() => rawOptions ?? [], [rawOptions]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4 ">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Gestion des filières
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualisez et administrez les options et filières de votre
                établissement.
              </p>
            </header>

            <CreateOptionDialog
              queryKeysToInvalidate={queryKeysToInvalidate}
              defaultValues={{ schoolId }}
            >
              <Button size="sm" className="rounded-full shadow-sm">
                <Plus className="mr-2 size-4" />
                Ajouter une filière
              </Button>
            </CreateOptionDialog>
          </section>
        }
      >
        <DataTable<TOption>
          data={options}
          columns={columns}
          keyExtractor={(item) => item.optionId}
        >
          <DataTableToolbar searchColumn="optionName">
            <TableFacetedFilterItem
              title="Section"
              columnId="section"
              options={SECTION_OPTIONS}
            />
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Chargement des filières...
                </p>
              </div>
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<TOption>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as any}
                    renderDetail={
                      <OptionRowActions
                        option={row.original}
                        queryKeysToInvalidate={queryKeysToInvalidate}
                      />
                    }
                  />
                )}
              </DataContentBody>
            </DataTableContent>

            <DataTablePagination />
          </Suspense>
        </DataTable>
      </PageShell>
    </div>
  );
};
