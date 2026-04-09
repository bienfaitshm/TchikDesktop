"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import type { TOptionAttributes as TOption } from "@/packages/@core/data-access/schema-validations"
import { useGetOptions } from "@/renderer/libs/queries/option"

import { Button } from "@/renderer/components/ui/button"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { withSchoolConfig } from "@/renderer/hooks/with-application-config"
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner"

import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
    TableFacetedFilterItem,
} from "@/renderer/components/tables/data-table"
import { OptionColumns } from "@/renderer/components/tables/columns.options"
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable"
import {
    ActionContainer,
    ActionTileCopy,
    ActionTileDelete,
    ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles"

import {
    CreateOptionDialog,
    DeleteOptionDialog,
    UpdateOptionDialog
} from "@/renderer/dialog-actions/option.dialog-actions"

import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options"
import type { Row } from "@tanstack/react-table"

/**
 * Actions de ligne mémoïsées pour la performance.
 * Empêche le re-render massif lors du scroll ou du filtrage.
 */
const OptionRowActions = React.memo(({ option }: { option: TOption }) => {
    // On stabilise les données initiales pour les formulaires d'édition
    const initialData = React.useMemo(() => ({ ...option }), [option.optionId])

    return (
        <ActionContainer className="lg:grid-cols-3">
            <UpdateOptionDialog optionId={option.optionId} initialData={initialData}>
                <ActionTileEdit />
            </UpdateOptionDialog>

            <CreateOptionDialog defaultValues={initialData}>
                <ActionTileCopy />
            </CreateOptionDialog>

            <DeleteOptionDialog
                optionId={option.optionId}
                optionName={option.optionName}
            >
                {({ isLoading, onOpen }) => (
                    <ActionTileDelete onClick={onOpen} disabled={isLoading} />
                )}
            </DeleteOptionDialog>
        </ActionContainer>
    )
})
OptionRowActions.displayName = "OptionRowActions"

const OptionManagementPage: React.FC<{ schoolId: string }> = ({ schoolId }) => {
    // On récupère les data. Si undefined, on stabilise avec un tableau vide.
    const { data: rawOptions } = useGetOptions({ where: { schoolId } })
    const options = React.useMemo(() => rawOptions ?? [], [rawOptions])

    return (
        <main className="container max-w-screen-2xl space-y-6 py-10">
            {/* Header de la page */}
            <section className="flex items-center justify-between">
                <header className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des filières</h1>
                    <p className="text-sm text-muted-foreground">
                        Visualisez et administrez les options et filières de votre établissement.
                    </p>
                </header>

                <CreateOptionDialog defaultValues={{ schoolId }}>
                    <Button size="sm" className="rounded-full shadow-sm">
                        <Plus className="mr-2 size-4" />
                        Ajouter une filière
                    </Button>
                </CreateOptionDialog>
            </section>

            {/* Table de données avec architecture Compound Components */}
            <DataTable<TOption>
                data={options}
                columns={OptionColumns}
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
                            <p className="text-sm text-muted-foreground animate-pulse">Chargement des filières...</p>
                        </div>
                    }
                >
                    <DataTableContent>
                        <DataContentHead />
                        <DataContentBody<TOption>>
                            {({ row }) => (
                                <ExpandableRow
                                    row={row as Row<unknown>}
                                    renderDetail={<OptionRowActions option={row.original} />}
                                />
                            )}
                        </DataContentBody>
                    </DataTableContent>

                    <DataTablePagination />
                </Suspense>
            </DataTable>
        </main>
    )
}

/**
 * OptionEntry - Gère la barrière de protection Suspense au niveau de la route.
 */
const OptionEntry: React.FC<{ schoolId: string }> = (props) => {
    console.log("OptionEntry")
    return (
        <Suspense fallback={<div className="p-10 text-center"><LoadingSpinner /></div>}>
            <OptionManagementPage {...props} />
        </Suspense>
    )
}

export const OptionPage = withSchoolConfig(OptionEntry)