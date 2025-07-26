import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@renderer/components/data-table/data-table-column-header";
import { formatCurrency } from "@renderer/utils/format";
import { TInvoice } from "@camontype/index";

export const columns: ColumnDef<TInvoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[20px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "nInvoice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Numero Facture" />
    ),
    cell: ({ row }) => (
      <div className="w-[40px]">{row.getValue("nInvoice")}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }): React.ReactNode => {
      // const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className="flex space-x-2">
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <span className="max-w-[80px] truncate font-medium">
            {row.getValue("client")}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "pht",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix Net." />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{formatCurrency(row.getValue("tva"))}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: "tva",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tva" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("tva")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("total")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
];
