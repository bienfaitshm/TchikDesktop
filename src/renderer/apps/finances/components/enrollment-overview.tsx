import {
  STUDENT_STATUS_ENUM,
  STUDENT_STATUS_ENUM_TRANSLATIONS,
} from "@/packages/@core/data-access/db/options";
import { formatDate } from "@/packages/times";
import { cn } from "@/renderer/utils";

export interface EnrollmentOverviewProps {
  fullName?: string;
  isProDeo?: boolean;
  startedAt: string | Date | number;
  enrolledAt: string | Date | number;
  status: STUDENT_STATUS_ENUM;
  className?: string;
}

/**
 * Computes Tailwind CSS style classes for the status badge based on student enrollment status.
 * @param status - The student's current enrollment status enum value.
 * @returns CSS class string specifying colors, borders, and typography.
 */
function getStatusBadgeStyles(status: STUDENT_STATUS_ENUM): string {
  switch (status) {
    case STUDENT_STATUS_ENUM.ACTIVE:
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case STUDENT_STATUS_ENUM.DROPOUT:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case STUDENT_STATUS_ENUM.EXPELLED:
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-600/20";
  }
}

/**
 * Displays student enrollment details, status badge, and dates in a compact, inline-ready layout.
 * @param props - Object containing student information, status, dates, and optional class names.
 * @returns A JSX element displaying the enrollment summary.
 */
export function EnrollmentOverview({
  fullName,
  enrolledAt,
  startedAt,
  status,
  isProDeo,
  className,
}: EnrollmentOverviewProps) {
  const statusLabel = STUDENT_STATUS_ENUM_TRANSLATIONS[status] ?? status;
  const badgeStyle = getStatusBadgeStyles(status);

  return (
    <span
      className={cn(
        "mt-1 block w-full border-t border-border/50 pt-1",
        className,
      )}
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        {fullName && (
          <span className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground uppercase">
              {fullName}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                badgeStyle,
              )}
            >
              {statusLabel} {isProDeo ? "| ProDeo" : ""}
            </span>
          </span>
        )}

        <span className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">Inscription :</span>
            <span className="font-medium text-foreground">
              {formatDate(new Date(enrolledAt))}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">Début :</span>
            <span className="font-medium text-foreground">
              {formatDate(new Date(startedAt))}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
