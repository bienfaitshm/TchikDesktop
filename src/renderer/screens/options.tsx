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
  enhanceColumns,
} from "@/renderer/components/tables/columns";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";

import {
  CreateOptionDialog,
  DeleteOptionDialog,
  UpdateOptionDialog,
  type OptionDialogProps,
} from "@/renderer/dialog-actions/option.dialog-actions";

import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { Pencil, Copy, Trash2 } from "lucide-react";

interface RowActionsProps extends Pick<OptionDialogProps, "mutationKey"> {
  option: Option;
}

export const RowAction: React.FC<RowActionsProps> = ({
  mutationKey,
  option,
}) => (
  <ActionMenu
    trigger={<ButtonMenu />}
    dialogs={
      <>
        <MenuDialogWrapper id="edit">
          <UpdateOptionDialog
            mutationKey={mutationKey}
            optionId={option.optionId}
            defaultValues={option}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="duplicate">
          <CreateOptionDialog
            mutationKey={mutationKey}
            defaultValues={option}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="delete">
          <DeleteOptionDialog
            mutationKey={mutationKey}
            optionId={option.optionId}
            optionName={option.optionName}
          />
        </MenuDialogWrapper>
      </>
    }
  >
    <MenuDialogItem targetId="edit" className="gap-2 cursor-pointer">
      <Pencil className="size-4 text-muted-foreground" />
      <span>Modifier la filière</span>
    </MenuDialogItem>

    <MenuDialogItem targetId="duplicate" className="gap-2 cursor-pointer">
      <Copy className="size-4 text-muted-foreground" />
      <span>Dupliquer la filière</span>
    </MenuDialogItem>

    <DropdownMenuSeparator />

    <MenuDialogItem
      targetId="delete"
      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="size-4" />
      <span>Supprimer la filière</span>
    </MenuDialogItem>
  </ActionMenu>
);

export const OptionPage = () => {
  const { schoolId } = useSchoolContext();
  const { data: options = [], queryKey: mutationKey } = useGetOptions({
    where: { schoolId },
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
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
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
            <DataContentBody<Option>></DataContentBody>
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageShell>
    </div>
  );
};
