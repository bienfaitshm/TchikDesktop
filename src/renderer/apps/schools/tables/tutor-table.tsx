import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
} from "@/renderer/apps/schools/dialogs";
import { tutorColumns } from "./tutor-table.columns";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import {
  type ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

/**
 * Properties for the tutor row contextual actions component.
 */
export interface TutorRowActionsProps {
  /** The tutor entity associated with the current row. */
  tutor: TutorDTO;
  /** Unique identifier of the current school context. */
  schoolId: string;
  /** Unique identifier of the current academic year context. */
  yearId: string;
  /** Optional React Query mutation key used for cache invalidation. */
  mutationKey?: readonly unknown[];
}

/**
 * Configuration array defining available action items for each tutor table row.
 */
const ACTION_MENUS: ActionMenuConfig<TutorRowActionsProps>[] = [
  {
    id: "profile",
    label: "Voir le profil",
    icon: Eye,
    dialog({ tutor, schoolId, yearId }) {
      return (
        <TutorProfileDialog tutor={tutor} schoolId={schoolId} yearId={yearId} />
      );
    },
  },
  {
    id: "edit",
    label: "Modifier le tuteur",
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
    label: "Supprimer le tuteur",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ tutor, mutationKey }) {
      return (
        <TutorDialogDeleteForm
          mutationKey={mutationKey}
          id={tutor.tutorId}
          name={tutor.fullName ?? "Inconnu"}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given tutor row.
 * @param props - Component properties containing tutor entity, school ID, year ID, and optional mutation key.
 * @returns Rendered action menu component for a tutor row.
 */
export const TutorRowActions: React.FC<TutorRowActionsProps> =
  createActionMenus<TutorRowActionsProps>(ACTION_MENUS);

TutorRowActions.displayName = "TutorRowActions";

/* Backward compatibility alias */
export const RowAction = TutorRowActions;

/**
 * Properties for the TutorTable component.
 */
export type TutorTableProps = {
  /** List of tutor records to display in the table. */
  tutors?: TutorDTO[];
  /** Optional React Query mutation key used for cache invalidation upon table actions. */
  mutationKey?: readonly unknown[];
  /** Unique identifier of the current school context. */
  schoolId: string;
  /** Unique identifier of the current academic year context. */
  yearId: string;
};

/**
 * Renders a paginated data table presenting a list of tutors with row-level action menus.
 * @param props - Component properties including tutors data, school ID, year ID, and mutation key.
 * @returns Rendered tutor data table element.
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
          <TutorRowActions
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

TutorTable.displayName = "TutorTable";
