import type { ColumnDef } from "@tanstack/react-table";
import { format, isValid } from "date-fns";
import { TypographySmall } from "@/renderer/components/ui/typography";
import type {
  ClassroomEnrollment,
  User,
  Classroom,
} from "@/packages/@core/data-access/db/schemas";

export interface EnrollmentHistoryItem extends ClassroomEnrollment {
  student: User & { fullName?: string };
  classroom: Classroom;
}

const DATE_FORMAT = "dd/MM/yyyy";
const TIME_FORMAT = "HH:mm";

/**
 * Définition des colonnes pour le tableau d'historique des inscriptions.
 * Configuration stricte des types et gestion défensive des données.
 */
export const enrollmentHistoryColumns: ColumnDef<EnrollmentHistoryItem>[] = [
  {
    accessorKey: "student.fullName",
    header: "Nom, Postnom et Prénom",
    cell: ({ getValue }) => (
      <TypographySmall className="font-medium text-foreground">
        {String(getValue() ?? "N/A")}
      </TypographySmall>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "classroom.shortIdentifier",
    header: "Classe",
    cell: ({ getValue }) => (
      <TypographySmall className="font-mono text-sm text-muted-foreground">
        {String(getValue() ?? "N/A")}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "studentCode",
    header: "Code",
    cell: ({ getValue }) => (
      <TypographySmall className="font-bold text-primary">
        {String(getValue() ?? "-")}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date d'Inscription",
    cell: ({ getValue }) => {
      const rawDate = getValue();
      const date = rawDate ? new Date(rawDate as string | number | Date) : null;

      if (!date || !isValid(date)) {
        return (
          <TypographySmall className="text-xs font-medium text-destructive">
            Date invalide
          </TypographySmall>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          <TypographySmall className="text-xs font-medium text-foreground">
            {format(date, DATE_FORMAT)}
            {"   "}
            <TypographySmall className="text-muted-foreground-soft sm:text-muted-foreground">
              à {format(date, TIME_FORMAT)}
            </TypographySmall>
          </TypographySmall>
        </div>
      );
    },
    enableColumnFilter: false,
  },
];
