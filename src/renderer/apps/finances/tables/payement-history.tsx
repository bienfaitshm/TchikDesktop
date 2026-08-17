import type { StudentPaymentDTO } from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import { studentPaymentColumns } from "./payement-history.columns";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import React from "react";

export type PaymentTableProps = {
  payments?: StudentPaymentDTO[];
  mutationKey?: readonly unknown[];
};

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments = [],
}) => {
  const columns = React.useMemo(
    () => enhanceColumns(studentPaymentColumns),
    [],
  );

  return (
    <div className="w-full flex-1">
      <DataTable<StudentPaymentDTO>
        data={payments}
        columns={columns}
        keyExtractor={(item) => item.paymentId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<StudentPaymentDTO> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
