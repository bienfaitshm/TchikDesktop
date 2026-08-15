import type { TutorDTO } from "@/packages/@core/data-access/db";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
} from "@/renderer/components/tables";
import {
  TutorProfileDialog,
  TutorDialogDeleteForm,
  TutorDialogUpdateForm,
  type CreateTutorDialogProps,
} from "@/renderer/apps/schools/dialogs";
import { tutorColumns } from "./tutor-table.columns";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

/**
 * Properties for the tutor row contextual actions component.
 */
export interface TutorRowActionsProps extends Pick<
  CreateTutorDialogProps,
  "mutationKey"
> {
  /** The tutor entity associated with the current row. */
  tutor: TutorDTO;
  /** Unique identifier of the current school context. */
  schoolId: string;
  /** Unique identifier of the current academic year context. */
  yearId: string;
}

/**
 * Configuration array defining available action items for each tutor table row.
 */
const ACTION_MENUS: ActionMenuConfig<TutorRowActionsProps>[] = [
  {
    id: "profile",
    label: "View Profile",
    icon: Eye,
    dialog({ tutor }) {
      return <TutorProfileDialog tutor={tutor} />;
    },
  },
  {
    id: "edit",
    label: "Edit Tutor",
    icon: Pencil,
    dialog({ tutor, schoolId, mutationKey }) {
      return (
        <TutorDialogUpdateForm
          schoolId={schoolId}
          mutationKey={mutationKey}
          tutorId={tutor.tutorId}
          defaultValues={tutor}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Delete Tutor",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ tutor, mutationKey }) {
      return (
        <TutorDialogDeleteForm
          mutationKey={mutationKey}
          id={tutor.tutorId}
          name={tutor.fullName ?? "Unknown"}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given tutor row.
 * @param props - Component properties containing the tutor entity, school ID, year ID, and mutation key.
 * @returns The rendered action menu component.
 */
export const RowAction: React.FC<TutorRowActionsProps> =
  createActionMenus<TutorRowActionsProps>(ACTION_MENUS);

/**
 * Properties for the TutorTable component.
 */
export type TutorTableProps = {
  /** List of tutor records to display in the table. */
  tutors?: TutorDTO[];
  /** Optional React Query mutation key used for invalidation upon table actions. */
  mutationKey?: readonly unknown[];
  /** Unique identifier of the current school context. */
  schoolId: string;
  /** Unique identifier of the current academic year context. */
  yearId: string;
};

/**
 * Renders a data table presenting a list of tutors with pagination and row actions.
 * @param props - Component properties including tutors data, school ID, year ID, and mutation key.
 * @returns The rendered tutor data table component.
 */
export const TutorTable: React.FC<TutorTableProps> = ({
  tutors = [],
  mutationKey,
  schoolId,
  yearId,
}) => {
  const columns = React.useMemo(
    () =>
      enhanceColumns(tutorColumns, {
        variant: "actions",
        renderRowAction: (tutor) => (
          <RowAction
            tutor={tutor}
            schoolId={schoolId}
            yearId={yearId}
            mutationKey={mutationKey}
          />
        ),
      }),
    [schoolId, yearId, mutationKey],
  );

  return (
    <div className="w-full">
      <DataTable<TutorDTO>
        data={tutors}
        columns={columns}
        keyExtractor={(item) => item.tutorId}
      >
        <DataTableContent>
          <DataContentHead />
          <DataContentBody<TutorDTO> />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};
