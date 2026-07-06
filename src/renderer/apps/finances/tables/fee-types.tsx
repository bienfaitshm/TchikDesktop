import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableColumnToggle,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  FilteredTableToolbarContainer,
  SearchTableToolbar,
  TableFacetedFilterItem,
} from "@/renderer/components/tables";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { feeTypeColumns } from "./fee-types.columns";

export type FeeTypeTableProps = {
  feeTypes?: FeeType[];
};
export const FeeTypeTable: React.FC<FeeTypeTableProps> = ({
  feeTypes = [],
}) => {
  return (
    <div>
      <DataTable<FeeType>
        data={feeTypes}
        columns={feeTypeColumns}
        keyExtractor={(item) => item.feeTypeId}
      >
        <DataTableToolbar></DataTableToolbar>
        <DataTableToolbar>
          <FilteredTableToolbarContainer>
            <SearchTableToolbar
              searchColumn="name"
              placeholder="Ex. Minerval"
            />
            {/* <TableFacetedFilterItem
                      title="Section"
                      columnId="section"
                      options={SECTION_OPTIONS}
                    /> */}
          </FilteredTableToolbarContainer>
        </DataTableToolbar>

        <DataTableContent>
          <DataContentHead />
          <DataContentBody<FeeType>>
            {({ row }) => (
              <ExpandableRow
                row={row as any}
                renderDetail={
                  // <OptionRowActions
                  //   option={row.original}
                  //   mutationKey={mutationKey}
                  // />
                  <></>
                }
              />
            )}
          </DataContentBody>
        </DataTableContent>

        <DataTablePagination />
      </DataTable>
    </div>
  );
};
