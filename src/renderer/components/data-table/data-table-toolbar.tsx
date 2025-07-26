import { Microscope } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@renderer/components/ui/button";
import { DataTableViewOptions } from "@renderer/components/data-table/data-table-view-options";

// import {
//   priorities,
//   statuses,
// } from "@renderer/components/data-table/data/data";
// import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>): React.JSX.Element {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <DataTableViewOptions table={table} />
        {/* {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Microscope className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
