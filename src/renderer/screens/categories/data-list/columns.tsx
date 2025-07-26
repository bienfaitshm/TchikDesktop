import { ColumnDef } from "@tanstack/react-table";
import { TCategory } from "@renderer/apis/type";
import { DataTableColumnHeader } from "@renderer/components/data-table/data-table-column-header";

export const columns: ColumnDef<TCategory>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[20px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("nom")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    enableSorting: false,
    enableHiding: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }): React.ReactNode => {
      // const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className="flex space-x-2">
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
];
