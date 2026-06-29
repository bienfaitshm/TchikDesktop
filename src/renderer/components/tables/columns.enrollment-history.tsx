import type { ColumnDef } from "@tanstack/react-table";
import { format, isValid } from "date-fns";
import { Link } from "react-router";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { APP_ROUTES } from "@/renderer/constants";
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
 * Configuration stricte des types, sémantique HTML valide et gestion défensive.
 */
export const enrollmentHistoryColumns: ColumnDef<EnrollmentHistoryItem>[] = [
  {
    accessorKey: "student.fullName",
    header: "Nom, Postnom et Prénom",
    cell: ({ getValue }) => (
      <TypographySmall className="text-foreground text-sm">
        {String(getValue() ?? "N/A")}
      </TypographySmall>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "classroom.shortIdentifier",
    header: "Classe",
    cell: ({ getValue, row }) => {
      const { classroomId } = row.original;

      return (
        <Link
          to={APP_ROUTES.CLASSROOMS.STUDENTS(classroomId)}
          className="font-mono text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
        >
          {String(getValue() ?? "N/A")}
        </Link>
      );
    },
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
        <TypographySmall className="text-xs font-medium text-foreground inline-flex items-center gap-1.5">
          <span>{format(date, DATE_FORMAT)}</span>
          <span className="text-[11px] font-normal text-muted-foreground/80 sm:text-muted-foreground">
            à {format(date, TIME_FORMAT)}
          </span>
        </TypographySmall>
      );
    },
    enableColumnFilter: false,
  },
];
