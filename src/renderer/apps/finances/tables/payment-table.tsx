import React from "react";
import type {
  AssignmentTableOfClassroom,
  TableClassroomPaymentAssignment,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
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
  // TableFacetedFilterItem,
} from "@/renderer/components/tables";
import { createPaymentColumns } from "./payment-table.column";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import { RowAction, CellAction } from "./payment-table.menus";
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

/**
 * Renders a table cell displaying formatted currency and fee schedule status indicators in French.
 * @param props - Component properties containing fee assignment details and context parameters.
 * @returns The rendered payment cell component.
 */
export const RenderPaymentCell: React.FC<FeeTypeRowActionsProps> = ({
  feeAssignment,
  schoolId,
  yearId,
  mutationKey,
}) => {
  return (
    <CellAction
      feeAssignment={feeAssignment}
      schoolId={schoolId}
      yearId={yearId}
      mutationKey={mutationKey}
    />
  );
};

export type FeeTypeTableProps = {
  assigns?: AssignmentTableOfClassroom;
  mutationKey?: readonly unknown[];
  schoolId: string;
};

export type FeeConfigTableProps = {
  data?: TableClassroomPaymentAssignment["table"];
  mutationKey?: readonly unknown[];
  schoolId: string;
  yearId: string;
};

/**
 * Renders a data table representing payment assignments for a classroom.
 * @param props - Properties including dataset, school ID, year ID, and optional mutation keys.
 * @returns The rendered classroom payment table component.
 */
export const FeeClassroomPaymentTable: React.FC<FeeConfigTableProps> = ({
  data,
  schoolId,
  yearId,
  mutationKey,
}) => {
  const columns = React.useMemo(() => {
    const columns = createPaymentColumns(data?.head ?? [], (feeAssignment) => (
      <RenderPaymentCell
        feeAssignment={feeAssignment}
        schoolId={schoolId}
        yearId={yearId}
        mutationKey={mutationKey}
      />
    ));

    return enhanceColumns(columns, {
      variant: "actions",
      renderRowAction: (assign) => (
        <RowAction
          assign={assign}
          schoolId={schoolId}
          yearId={yearId}
          mutationKey={mutationKey}
        />
      ),
    });
  }, [data?.head, schoolId, yearId, mutationKey]);

  return (
    <div className="w-full">
      <DataTable<AssignmentTableOfClassroom>
        data={data?.body ?? []}
        columns={columns}
        keyExtractor={(item) => item.enrollmentId}
      >
        <DataTableToolbar>
          <FilteredTableToolbarContainer>
            <SearchTableToolbar
              searchColumn="student"
              placeholder="Rechercher ex. SHOMARI"
            />

            {/* <TableFacetedFilterItem
                        columnId="status"
                        title="Statut"
                        options={STUDENT_STATUS_OPTIONS}
                      /> */}
          </FilteredTableToolbarContainer>
          <div className="flex items-center gap-4">
            <DataTableColumnToggle />
          </div>
        </DataTableToolbar>
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<AssignmentTableOfClassroom> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
