import * as React from "react";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

/**
 * Enumeration representing student enrollment status.
 */
export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/**
 * Represents summary information for a student linked to a tutor.
 */
export interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  classroomName: string;
  status: StudentStatus;
  relationship?: string;
  avatarUrl?: string;
}

/**
 * Represents detailed profile information for a legal tutor.
 */
export interface TutorDetail {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  profession?: string;
  gender: "MALE" | "FEMALE";
  students: StudentSummary[];
}

/**
 * Props interface for the TutorProfileCard component.
 */
export interface TutorProfileCardProps {
  /** The tutor data payload including linked student records. */
  tutor: TutorDetail;
  /** Optional container CSS class overrides. */
  className?: string;
  /** Optional click handler executed when selecting a student item. */
  onSelectStudent?: (studentId: string) => void;
}

/**
 * Props interface for the TutorHeader sub-component.
 */
interface TutorHeaderProps {
  tutor: TutorDetail;
}

/**
 * Props interface for the StudentListItem sub-component.
 */
interface StudentListItemProps {
  student: StudentSummary;
  onSelect?: (studentId: string) => void;
}

/**
 * Formats name parts into a sanitized, space-separated full name string.
 * @param firstName - Primary given name.
 * @param lastName - Primary family surname.
 * @param middleName - Optional secondary or middle name.
 * @returns Cleanly formatted full name string.
 */
export function formatFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
): string {
  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

/**
 * Renders the profile header displaying tutor contact information and identity attributes.
 * @param props - Component props containing the tutor entity.
 * @returns Rendered tutor header component.
 */
const TutorHeader: React.FC<TutorHeaderProps> = ({ tutor }) => {
  const fullName = formatFullName(
    tutor.firstName,
    tutor.lastName,
    tutor.middleName,
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <User className="h-7 w-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">{fullName}</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-700">
              Tuteur légal
            </span>
          </div>
          {tutor.profession && (
            <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-500" />
              {tutor.profession}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-300">
        <a
          href={`tel:${tutor.phoneNumber}`}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 transition-colors hover:border-slate-700 hover:text-white"
        >
          <Phone className="h-3.5 w-3.5 text-indigo-400" />
          <span>{tutor.phoneNumber}</span>
        </a>

        {tutor.email && (
          <a
            href={`mailto:${tutor.email}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 transition-colors hover:border-slate-700 hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>{tutor.email}</span>
          </a>
        )}

        {tutor.address && (
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span>{tutor.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};

TutorHeader.displayName = "TutorHeader";

/**
 * Renders an individual student card with placement and status details.
 * @param props - Component options including student data and select handler.
 * @returns Rendered student card item.
 */
const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  onSelect,
}) => {
  const fullName = formatFullName(
    student.firstName,
    student.lastName,
    student.middleName,
  );

  const renderStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Actif
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
            <XCircle className="h-3 w-3" /> Inactif
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-3 w-3" /> Suspendu
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect?.(student.id)}
      className={`group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900 ${
        onSelect ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {fullName}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Classe :{" "}
            <span className="text-slate-300 font-medium">
              {student.classroomName}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {student.relationship && (
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            {student.relationship}
          </span>
        )}
        {renderStatusBadge(student.status)}
      </div>
    </div>
  );
};

StudentListItem.displayName = "StudentListItem";

/**
 * Main container component displaying tutor profile details alongside their registered students.
 * @param props - Component options including tutor data entity and event handlers.
 * @returns Complete tutor profile and student list view.
 */
export const TutorProfileCard: React.FC<TutorProfileCardProps> = ({
  tutor,
  className = "",
  onSelectStudent,
}) => {
  const hasStudents = tutor.students && tutor.students.length > 0;

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl text-slate-100 ${className}`}
      aria-label="Profil du tuteur et élèves rattachés"
    >
      {/* Tutor Profile Header */}
      <TutorHeader tutor={tutor} />

      {/* Associated Students Section */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Élèves sous responsabilité
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-slate-800">
            {tutor.students.length}
          </span>
        </div>

        {hasStudents ? (
          <div className="grid grid-cols-1 gap-3">
            {tutor.students.map((student) => (
              <StudentListItem
                key={student.id}
                student={student}
                onSelect={onSelectStudent}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
            <Users className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">
              Aucun élève rattaché à ce tuteur.
            </p>
            <p className="text-xs text-slate-500 mt-1">
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
