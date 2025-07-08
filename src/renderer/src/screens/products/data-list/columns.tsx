import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@renderer/components/data-table/data-table-column-header";
import { formatCurrency } from "@renderer/utils/format";
import { TProduit } from "@renderer/apis/type";

export const columns: ColumnDef<TProduit>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[20px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }): React.ReactNode => {
      // const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className="flex space-x-2">
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("nom")}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{formatCurrency(row.getValue("price"))}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: "tva",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TVA" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("tva")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
];
