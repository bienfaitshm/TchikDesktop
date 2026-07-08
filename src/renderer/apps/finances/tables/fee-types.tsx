import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { feeTypeColumns } from "./fee-types.columns";
import { enhanceColumnsExpandable } from "@/renderer/components/tables/columns";
import React from "react";

const columns = enhanceColumnsExpandable(feeTypeColumns);

export type FeeTypeTableProps = {
  feeTypes?: FeeType[];
  renderDetail?(feeType: FeeType): React.ReactNode;
};
export const FeeTypeTable: React.FC<FeeTypeTableProps> = ({
  feeTypes = [],
  renderDetail,
}) => {
  return (
    <div>
      <DataTable<FeeType>
        data={feeTypes}
        columns={columns}
        keyExtractor={(item) => item.feeTypeId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<FeeType>>
            {({ row }) => (
              <ExpandableRow
                row={row as any}
                renderDetail={<>{renderDetail?.(row.original)}</>}
              />
            )}
          </DataContentBody>
        </DataTableContent>

        <DataTablePagination />
      </DataTable>
    </div>
  );
};
