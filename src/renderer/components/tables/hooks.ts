"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import {
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  filterFn_includesString,
  filterFn_equals,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnSizingState,
  type FilterFn,
  type Header,
  type RowData,
  type SortFn,
  type SortingState,
  type TableFeatures,
  Row,
} from "@tanstack/react-table";
import {
  compareItems,
  rankItem,
  type RankingInfo,
} from "@tanstack/match-sorter-utils";
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools";

export interface FuzzyFilterMeta {
  itemRank?: RankingInfo;
}

export type CustomTableFeatures = TableFeatures & {
  filterMeta: FuzzyFilterMeta;
};

/**
 * Applies a fuzzy search filter to a row and injects ranking metadata.
 * @param row - The table row to evaluate.
 * @param columnId - The identifier of the column being filtered.
 * @param value - The search string provided by the user.
 * @param addMeta - Callback to store the resulting match rank.
 * @returns A boolean indicating if the row passes the filter.
 */
export const fuzzyFilter: FilterFn<CustomTableFeatures, RowData> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta?.({ itemRank });
  return itemRank.passed;
};

/**
 * Sorts two rows based on their previously injected fuzzy search ranking.
 * @param rowA - The first row to compare.
 * @param rowB - The second row to compare.
 * @param columnId - The identifier of the column being sorted.
 * @returns A numeric value (-1, 0, 1) determining the sort order.
 */
export const fuzzySort: SortFn<CustomTableFeatures, RowData> = (
  rowA,
  rowB,
  columnId,
) => {
  const rankA = rowA.columnFiltersMeta?.[columnId]?.itemRank as
    RankingInfo | undefined;
  const rankB = rowB.columnFiltersMeta?.[columnId]?.itemRank as
    RankingInfo | undefined;

  let dir = 0;
  if (rankA && rankB) {
    dir = compareItems(rankA, rankB);
  }

  return dir === 0 ? sortFn_alphanumeric(rowA, rowB, columnId) : dir;
};

export const features = tableFeatures({
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: {
    fuzzy: fuzzyFilter,
    includesString: filterFn_includesString,
    equals: filterFn_equals,
  },
  sortFns: {
    fuzzy: fuzzySort,
  },
  filterMeta: metaHelper<FuzzyFilterMeta>(),
});

export type TableFeature = typeof features;

export type TableColumnDef<Data extends RowData> = ColumnDef<
  TableFeature,
  Data
>;

export type TableRow<Data extends RowData> = Row<TableFeature, Data>;

/**
 * Generates inline CSS properties for sticky column pinning.
 * Accepts either a Column or a Header instance to determine boundary shadows safely.
 * @param target - The column or header instance to compute styles for.
 * @returns The CSS properties handling inset, shadows, and z-index.
 */
export const getCommonPinningStyles = <TData extends RowData>(
  target: Column<TableFeature, TData> | Header<TableFeature, TData>,
): CSSProperties => {
  const column = "column" in target ? target.column : target;
  const isPinned = column.getIsPinned();

  const isLastLeftPinnedColumn =
    isPinned === "start" &&
    ("getIsLastColumn" in target ? target.getIsLastColumn("start") : false);

  const isFirstRightPinnedColumn =
    isPinned === "end" &&
    ("getIsFirstColumn" in target ? target.getIsFirstColumn("end") : false);

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px gray inset"
        : undefined,
    insetInlineStart:
      isPinned === "start" ? `${column.getStart("start")}px` : undefined,
    insetInlineEnd:
      isPinned === "end" ? `${column.getAfter("end")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

export interface UseTableOptions<TData extends RowData> {
  initialData: TData[];
  columns: TableColumnDef<TData>[];
  keyExtractor: (item: TData) => string;
}

/**
 * Initializes and orchestrates the TanStack Table instance with built-in state management.
 * Uses React transitions to prevent Suspense fallbacks during state updates.
 * @param options - Table configuration containing initial data, columns, and a key extractor.
 * @returns An object containing the table instance, columns, and extracted row IDs.
 */
export function useDataTable<TData extends RowData>({
  initialData: data,
  columns,
  keyExtractor,
}: UseTableOptions<TData>) {
  const [isPending, startTransition] = React.useTransition();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    start: [],
    end: [],
  });
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const state = React.useMemo(
    () => ({
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      columnPinning,
      columnSizing,
      pagination,
    }),
    [
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      columnPinning,
      columnSizing,
      pagination,
    ],
  );

  const rowIds = React.useMemo(
    () => data.map(keyExtractor),
    [data, keyExtractor],
  );

  const tableInstance = useTable(
    {
      key: "data-table",
      features,
      data,
      columns,
      state,
      globalFilterFn: "fuzzy",
      columnResizeMode: "onChange",
      onRowSelectionChange: (updater) =>
        startTransition(() => setRowSelection(updater)),
      onSortingChange: (updater) => startTransition(() => setSorting(updater)),
      onColumnFiltersChange: (updater) =>
        startTransition(() => setColumnFilters(updater)),
      onGlobalFilterChange: (updater) =>
        startTransition(() => setGlobalFilter(updater)),
      onColumnVisibilityChange: (updater) =>
        startTransition(() => setColumnVisibility(updater)),
      onColumnPinningChange: (updater) =>
        startTransition(() => setColumnPinning(updater)),
      onColumnSizingChange: (updater) =>
        startTransition(() => setColumnSizing(updater)),
      onPaginationChange: (updater) =>
        startTransition(() => setPagination(updater)),
      getRowId: keyExtractor,
    },
    (tableState) => tableState,
  );

  useTanStackTableDevtools(tableInstance);

  return {
    tableInstance,
    columns,
    rowIds,
    keyExtractor,
    isPending,
  } as const;
}

/**
 * Instantiates a type-safe ColumnHelper for the current table configuration.
 * @returns A ColumnHelper instance typed with the custom table features.
 */
export function getTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<TableFeature, TData>();
}
