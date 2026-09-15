import React from "react";
import {
  User,
  Users,
  AlertCircle,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

// Types
export interface SearchResultItem {
  subTitle?: string;
  student: {
    userId: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
  };
  currentEnrollment?: {
    studentCode: string;
    status: string;
    classroom?: {
      identifier: string;
      shortIdentifier: string;
    };
    tutor?: {
      tutorId: string;
      profession?: string;
      address?: string;
      phoneNumber?: string;
      enrollments?: Array<{
        enrollmentId: string;
        classroom?: { shortIdentifier: string };
        student?: {
          userId: string;
          firstName?: string | null;
          middleName?: string | null;
          lastName?: string | null;
        };
      }>;
    };
  } | null;
}

interface StudentPreviewProps {
  data: SearchResultItem;
}

export const StudentPreview: React.FC<StudentPreviewProps> = ({ data }) => {
  const { student, currentEnrollment } = data;

  // Reconstitution du nom complet propre
  const fullName = [student.lastName, student.middleName, student.firstName]
    .filter(Boolean)
    .join(" ");

  const isEnrolled =
    !!currentEnrollment && currentEnrollment.status === "ACTIVE";
  const tutor = currentEnrollment?.tutor;

  // Filtrage des frères & sœurs (exclut l'élève actuellement sélectionné)
  const siblings =
    tutor?.enrollments
      ?.filter((e) => e.student && e.student.userId !== student.userId)
      // Évite les doublons d'élèves si réinscrits plusieurs fois
      .reduce(
        (acc, current) => {
          const x = acc.find(
            (item) => item.student?.userId === current.student?.userId,
          );
          return !x ? acc.concat([current]) : acc;
        },
        [] as NonNullable<typeof tutor.enrollments>,
      ) || [];

  return (
    <div className="w-full space-y-6 text-foreground">
      {/* 1. En-tête : Nom, Genre & Statut d'inscription */}
      <div className="flex items-start justify-between border-b border-border gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">
              {fullName || "Nom inconnu"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {/* Badge Genre */}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {student.gender === "F"
                  ? "Féminin"
                  : student.gender === "M"
                    ? "Masculin"
                    : "N/A"}
              </span>
              {/* Badge Inscription */}
              {isEnrolled ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Inscrit
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Non inscrit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Message si NON INSCRIT */}
      {!isEnrolled && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-3 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p>
            Cet élève n'est inscrit dans aucune classe pour l'année en cours.
          </p>
        </div>
      )}

      {/* 3. Détails Scolaires (si inscrit) */}
      {isEnrolled && currentEnrollment && (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-accent/40 border border-border/50">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Classe
            </span>
            <p className="font-semibold text-xs">
              {currentEnrollment.classroom?.shortIdentifier || "Non spécifiée"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Code Élève
            </span>
            <p className="font-mono font-semibold text-xs">
              {currentEnrollment.studentCode || "Aucun code"}
            </p>
          </div>
        </div>
      )}

      {/* 4. Section Tuteur */}
      {isEnrolled && (
        <div className="space-y-3 mt-2">
          <h4 className="text-xs font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            Informations du Tuteur
          </h4>

          {tutor ? (
            <div className="space-y-2 text-xs">
              {tutor.profession && (
                <div className="flex items-center gap-2 text-foreground">
                  <Briefcase
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                  <span>{tutor.profession}</span>
                </div>
              )}
              {tutor.phoneNumber && (
                <div className="flex items-center gap-2 text-foreground">
                  <Phone size={16} className="text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${tutor.phoneNumber}`}
                    className="hover:underline font-mono"
                  >
                    {tutor.phoneNumber}
                  </a>
                </div>
              )}
              {tutor.address && (
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                  <span>{tutor.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Aucun tuteur renseigné.
            </p>
          )}
        </div>
      )}

      {/* 5. Section Frères et Sœurs */}
      {isEnrolled && (
        <div className="space-y-3">
          <h4 className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users size={14} /> Fratrie / Co-tutélisés ({siblings.length})
          </h4>

          {siblings.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {siblings.map((item) => {
                const siblingName = [
                  item.student?.lastName,
                  item.student?.middleName,
                  item.student?.firstName,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    key={item.enrollmentId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-xs">{siblingName}</span>
                    {item.classroom && (
                      <span className="text-xs px-2 py-0.5 text-muted-foreground">
                        {item.classroom.shortIdentifier}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Aucun frère ou sœur enregistré sous le même tuteur.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
