import * as React from "react";
import { Phone, Briefcase, MapPin, Users, GraduationCap } from "lucide-react";
import type { EnrollmentDTO, TutorDTO } from "@/packages/@core/data-access/db";
import { Badge } from "@/renderer/components/ui/badge";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/utils";

/**
 * Extracts up to two uppercase initial letters from a given full name.
 * @param name - Full name string to extract initials from.
 * @returns Two-character uppercase initials or default fallback symbol.
 */
function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Props for the TutorProfileCard main container component.
 */
export interface TutorProfileCardProps {
  /** Primary tutor record payload. */
  tutor: TutorDTO;
  /** List of student enrollment records assigned to this tutor. */
  enrollments?: EnrollmentDTO[];
  /** Optional container CSS class overrides. */
  className?: string;
}

/**
 * Props for the internal TutorHeader component.
 */
interface TutorHeaderProps {
  /** Primary tutor record payload. */
  tutor: TutorDTO;
}

/**
 * Props for the internal StudentListItem component.
 */
interface StudentListItemProps {
  /** Individual student enrollment record payload. */
  student: EnrollmentDTO;
}

/**
 * Displays identity, status, and contact details for a legal tutor.
 * @param props - Component parameters including tutor data record.
 * @returns Rendered header element for tutor profile view.
 */
const TutorHeader: React.FC<TutorHeaderProps> = ({ tutor }) => {
  const fullName = tutor.fullName ?? "Tuteur non nommé";
  const initials = getInitials(fullName);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold uppercase tracking-tight text-foreground truncate">
              {fullName}
            </h2>
            <Badge
              variant="outline"
              className="text-[10px] font-medium py-0 px-2"
            >
              Tuteur légal
            </Badge>
          </div>

          {tutor.profession && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tutor.profession}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {tutor.phoneNumber && (
              <Badge
                variant="secondary"
                className="gap-1.5 py-1 px-2.5 text-xs font-normal"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{tutor.phoneNumber}</span>
              </Badge>
            )}

            {tutor.address && (
              <Badge
                variant="secondary"
                className="gap-1.5 py-1 px-2.5 text-xs font-normal"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate max-w-50">{tutor.address}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

TutorHeader.displayName = "TutorHeader";

/**
 * Displays a concise summary card for an enrolled student under tutor responsibility.
 * @param props - Component options containing enrollment and student details.
 * @returns Rendered item view for a student.
 */
const StudentListItem: React.FC<StudentListItemProps> = ({ student }) => {
  const studentName = student.student?.fullName ?? "Élève inconnu";
  const classroomName = student.classroom?.shortIdentifier ?? "N/A";
  const registrationNumber = student.studentCode;
  const initials = getInitials(studentName);

  return (
    <div className="p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-foreground truncate">
              {studentName}
            </h4>
            {registrationNumber && (
              <span className="text-[10px] font-mono text-muted-foreground">
                #{registrationNumber}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <GraduationCap className="h-3 w-3" />
            <span>
              Classe :{" "}
              <strong className="font-medium text-foreground">
                {classroomName}
              </strong>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

StudentListItem.displayName = "StudentListItem";

/**
 * Renders the primary profile layout for a legal tutor alongside linked students.
 * @param props - Component options including tutor data, enrollments, and optional styles.
 * @returns Complete profile section element.
 */
export const TutorProfileCard: React.FC<TutorProfileCardProps> = ({
  tutor,
  enrollments = [],
  className,
}) => {
  const hasStudents = enrollments.length > 0;

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label="Profil du tuteur et élèves rattachés"
    >
      <TutorHeader tutor={tutor} />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <h3 className="text-xs font-semibold tracking-wider text-foreground">
              Élèves sous responsabilité ({enrollments.length})
            </h3>
          </div>
        </div>

        {hasStudents ? (
          <div className="grid grid-cols-1 gap-2.5">
            {enrollments.map((student) => (
              <StudentListItem key={student.enrollmentId} student={student} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center bg-muted/20">
            <Users className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              Aucun élève rattaché à ce tuteur.
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Les élèves inscrits sous la responsabilité de ce tuteur
              apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

TutorProfileCard.displayName = "TutorProfileCard";
