import type {
  AssignmentTableOfClassroom,
  TableClassroomPaymentAssignment,
} from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";

import { createPaymentColumns } from "./payment-table.column";
import React from "react";

export type FeeConfigTableProps = {
  data?: TableClassroomPaymentAssignment["table"];
  mutationKey?: readonly unknown[];
  schoolId: string;
  yearId: string;
};

export const FeeClassroomPayementTable: React.FC<FeeConfigTableProps> = ({
  data,
  schoolId,
  yearId,
}) => {
  const columns = React.useMemo(() => {
    const _columns = createPaymentColumns(data?.head ?? [], {
      schoolId,
      yearId,
    });
    console.log(
      "[FeeClassroomPayementTable]: columns of tables, ",
      _columns.length,
      " created",
    );
    return _columns;
  }, []);

  return (
    <div className="w-full">
      <DataTable<AssignmentTableOfClassroom>
        data={data?.body ?? []}
        columns={columns}
        keyExtractor={(item) => item.enrollmentId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<AssignmentTableOfClassroom> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
