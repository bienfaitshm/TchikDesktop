import type { StudentPaymentTDO } from "@/packages/@core/data-access/db/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { formatDate } from "@/packages/times";
import { formatCurrency } from "@/packages/currency";
import {
  getPaymentMethodLabel,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

export const studentPaymentColumns: ColumnDef<StudentPaymentTDO>[] = [
  {
    accessorKey: "student.fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Élève" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-sm font-medium">
          {String(getValue() ?? "—")}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "classroom.shortIdentifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Classe" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-sm">
          {String(getValue() ?? "—")}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "feeType.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type de frais" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-sm">
          {String(getValue() ?? "—")}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "amountReceived",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant reçu" />
    ),
    cell: ({ getValue, row: { original } }) => {
      const amount = getValue<number>();
      return (
        <TypographySmall className="text-sm tabular-nums">
          {amount != null
            ? formatCurrency(amount, original.currencyReceived)
            : "—"}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Méthode" />
    ),
    cell: ({ getValue }) => {
      const method = getValue<PAYMENT_METHOD_ENUM>();
      const label = getPaymentMethodLabel(method);
      return <TypographySmall className="text-sm">{label}</TypographySmall>;
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "transactionReference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Référence" />
    ),
    cell: ({ getValue }) => {
      const ref = getValue<string>();
      return (
        <TypographySmall className="text-sm">
          {ref && ref.trim() !== "" ? ref : "—"}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date du paiement" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-sm">
          {formatDate(getValue<string>())}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
];
