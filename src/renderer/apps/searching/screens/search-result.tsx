import React from "react";
import { useSearchParams } from "react-router";
import { useGetPreviewOfUserQuery } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { FeeAssignmentTab } from "@/renderer/apps/finances/components/fee-assignment-tabs";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";
import {
  User,
  GraduationCap,
  MapPin,
  Calendar,
  SearchX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Armchair,
  IdCard,
} from "lucide-react";

export const ResultSearch: React.FC = () => {
  const { yearId, schoolId } = useCurrentConfig();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("user") ?? "";

  const { data: preview, isLoading } = useGetPreviewOfUserQuery({
    schoolId,
    yearId,
    search: searchQuery,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageContent>
          <div className="max-w-6xl mx-auto p-4 space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded-xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!preview) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <SearchX size={20} />
            </div>
            <h3 className="text-base font-semibold">Aucun résultat trouvé</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Vérifiez le matricule ou le nom recherché.
            </p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const { student, currentEnrollment } = preview;
  const fullName = [student.lastName, student.middleName, student.firstName]
    .filter(Boolean)
    .join(" ");

  const isEnrolled = currentEnrollment?.status === "ACTIVE";
  const seating = currentEnrollment?.seatingAssignments?.[0];

  return (
    <PageContainer>
      <PageContent>
        <div className="max-w-6xl mx-auto space-y-4 p-4 text-foreground">
          {/* BANNIÈRE COMPACTE / PROFILE HEADER */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight">
                    {fullName}
                  </h1>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted font-medium text-muted-foreground">
                    {student.gender === "F" ? "Féminin" : "Masculin"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <GraduationCap size={13} className="text-muted-foreground" />
                  <span>
                    {currentEnrollment?.classroom?.identifier || "Non assigné"}
                  </span>
                  <span className="text-border">•</span>
                  <IdCard size={13} />
                  <span className="font-mono">
                    Code: {currentEnrollment?.studentCode || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* Badge de Statut */}
            <div className="flex items-center gap-2">
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Inscrit (Actif)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/20">
                  <AlertCircle size={12} /> Inactif
                </span>
              )}
            </div>
          </div>

          {/* DISPOSITION 2 COLONNES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* COLONNE PRINCIPALE : FINANCES & EXAMENS (2/3) */}
            <div className="md:col-span-2 space-y-4">
              {/* Carte Emplacement d'examen (si disponible) */}
              {seating && (
                <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Armchair size={16} />
                    </div>
                    <div>
                      <span className="font-semibold block text-foreground">
                        {seating.session?.sessionName}
                      </span>
                      <span className="text-muted-foreground">
                        {seating.localroom?.name} • Rangée {seating.rowPosition}
                        , Place {seating.columnPosition}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-accent text-accent-foreground font-mono">
                    Session Active
                  </span>
                </div>
              )}

              {/* Conteneur Onglets de paiement */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Affectations & Paiements des frais
                </h2>
                {currentEnrollment?.enrollmentId ? (
                  <FeeAssignmentTab
                    enrollmentId={currentEnrollment.enrollmentId}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Aucune donnée de paiement disponible.
                  </p>
                )}
              </div>
            </div>

            {/* COLONNE SECONDAIRE : DÉTAILS ÉLÈVE (1/3) */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Détails personnels
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar size={13} /> Née le
                    </span>
                    <span className="font-medium">
                      {student.birthDate
                        ? new Date(student.birthDate).toLocaleDateString(
                            "fr-FR",
                          )
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={13} /> Lieu de naissance
                    </span>
                    <span className="font-medium">
                      {student.birthPlace || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <UserCheck size={13} /> Tuteur
                    </span>
                    <span className="font-medium text-muted-foreground italic">
                      {currentEnrollment?.tutor ? "Renseigné" : "Non assigné"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">
                      Année Scolaire
                    </span>
                    <span className="font-medium text-foreground">
                      {currentEnrollment?.year?.yearName || "2025-2026"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};
