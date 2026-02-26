import { create } from "zustand"
import {} from "@tanstack/react-table"
import {
  OnChangeFn,
  VisibilityState,
  TableState,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table"

type TTableState = {
  state: Partial<TableState>
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  onSortingChange?: OnChangeFn<SortingState>
}

function updaterFn<T>(oldState?: T, updater?: Updater<T>): T | undefined {
  if (typeof updater === "function") {
    const newState = updater?.(oldState)
    return newState
    //
  }
  return updater
}

export const useTableState = create<TTableState>((set, get) => ({
  state: {
    columnVisibility: {},
    rowSelection: {},
    sorting: [],
    columnFilters: [],
  },
  onRowSelectionChange(updaterRowSelection): void {
    set({ state: { rowSelection: updaterFn(get().state.rowSelection, updaterRowSelection) } })
  },
  onColumnFiltersChange(updaterColumnFilters): void {
    set({ state: { columnFilters: updaterFn(get().state.columnFilters, updaterColumnFilters) } })
  },
  onColumnVisibilityChange(updaterColumnVisibility): void {
    set({
      state: {
        columnVisibility: updaterFn(get().state.columnVisibility, updaterColumnVisibility),
      },
    })
  },
  onSortingChange(updaterSorting): void {
    set({ state: { sorting: updaterFn(get().state.sorting, updaterSorting) } })
  },
}))
